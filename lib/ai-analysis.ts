import "server-only";

import OpenAI from "openai";

export interface AnomalyNarrativeInput {
  machineName: string;
  resourceName: string;
  resourceCode: string;
  unit: string;
  currentValue: number;
  average: number;
  deviationPct: number;
  zScore: number | null;
  sampleSize: number;
  anomalyType: "SPIKE" | "DROP";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

export interface AnomalyNarrative {
  title: string;
  message: string;
  recommendation: string;
  confidence: number;
}

function deterministicNarrative(
  input: AnomalyNarrativeInput,
): AnomalyNarrative {
  const direction =
    input.anomalyType === "SPIKE" ? "สูงกว่า" : "ต่ำกว่า";

  const title =
    input.anomalyType === "SPIKE"
      ? `${input.machineName} ใช้ ${input.resourceName} สูงผิดปกติ`
      : `${input.machineName} มีค่า ${input.resourceName} ลดลงผิดปกติ`;

  const message =
    `${input.machineName} บันทึก ${input.resourceName} ` +
    `${input.currentValue.toLocaleString("th-TH", {
      maximumFractionDigits: 2,
    })} ${input.unit} ซึ่ง${direction}ค่าเฉลี่ยย้อนหลัง ` +
    `${Math.abs(input.deviationPct).toLocaleString("th-TH", {
      maximumFractionDigits: 1,
    })}% จากข้อมูล ${input.sampleSize} รายการล่าสุด`;

  const recommendation =
    input.anomalyType === "SPIKE"
      ? "ตรวจสอบโหลดการทำงาน ระยะเวลาเดินเครื่อง การรั่วไหล และยืนยันค่าที่บันทึกก่อนตัดสินใจ"
      : "ตรวจสอบว่าเครื่องหยุดทำงาน มีการเปลี่ยนแผนผลิต เซนเซอร์/มิเตอร์ผิดปกติ หรือมีการบันทึกค่าคลาดเคลื่อน";

  const confidence = Math.min(
    0.98,
    Math.max(
      0.65,
      0.7 +
        Math.min(input.sampleSize, 20) * 0.01 +
        Math.min(Math.abs(input.deviationPct), 100) * 0.001,
    ),
  );

  return {
    title,
    message,
    recommendation,
    confidence,
  };
}

export async function generateAnomalyNarrative(
  input: AnomalyNarrativeInput,
): Promise<AnomalyNarrative> {
  const fallback = deterministicNarrative(input);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      input: `
You are an industrial resource monitoring assistant.
Analyze only the supplied measurements. Do not invent a root cause.
Write concise Thai for a factory manager.

Return exactly 4 lines:
TITLE: <short title>
MESSAGE: <1-2 sentences explaining the anomaly with numbers>
RECOMMENDATION: <practical checks; phrase uncertainty appropriately>
CONFIDENCE: <number 0 to 1>

Data:
Machine: ${input.machineName}
Resource: ${input.resourceName} (${input.resourceCode})
Current: ${input.currentValue} ${input.unit}
Historical average: ${input.average} ${input.unit}
Deviation: ${input.deviationPct}%
Z-score: ${input.zScore ?? "N/A"}
Historical samples: ${input.sampleSize}
Anomaly type: ${input.anomalyType}
Severity from statistical engine: ${input.severity}
      `.trim(),
    });

    const text = response.output_text?.trim();

    if (!text) {
      return fallback;
    }

    const lines = text.split("\n");
    const title =
      lines.find((line) => line.startsWith("TITLE:"))
        ?.replace("TITLE:", "")
        .trim() || fallback.title;

    const message =
      lines.find((line) => line.startsWith("MESSAGE:"))
        ?.replace("MESSAGE:", "")
        .trim() || fallback.message;

    const recommendation =
      lines.find((line) => line.startsWith("RECOMMENDATION:"))
        ?.replace("RECOMMENDATION:", "")
        .trim() || fallback.recommendation;

    const confidenceRaw =
      lines.find((line) => line.startsWith("CONFIDENCE:"))
        ?.replace("CONFIDENCE:", "")
        .trim();

    const parsedConfidence = Number(confidenceRaw);

    return {
      title: title.slice(0, 255),
      message: message.slice(0, 1000),
      recommendation: recommendation.slice(0, 2000),
      confidence:
        Number.isFinite(parsedConfidence) &&
        parsedConfidence >= 0 &&
        parsedConfidence <= 1
          ? parsedConfidence
          : fallback.confidence,
    };
  } catch (error) {
    console.error("AI anomaly analysis failed:", error);
    return fallback;
  }
}

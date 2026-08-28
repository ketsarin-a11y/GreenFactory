import { NextResponse } from "next/server";
import OpenAI from "openai";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (
    value &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value ?? 0);
}

async function buildFactoryContext(companyId: number) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [usages, alerts, recommendations] = await Promise.all([
    prisma.resourceUsage.findMany({
      where: {
        companyId,
        status: "ACTIVE",
        usageAt: {
          gte: since,
        },
      },
      orderBy: {
        usageAt: "desc",
      },
      take: 60,
      select: {
        quantity: true,
        usageAt: true,
        sourceType: true,
        processingStatus: true,
        machine: {
          select: {
            machineName: true,
          },
        },
        checkpoint: {
          select: {
            checkpointName: true,
          },
        },
        department: {
          select: {
            departmentName: true,
          },
        },
        resourceType: {
          select: {
            resourceCode: true,
            resourceName: true,
          },
        },
        unit: {
          select: {
            symbol: true,
          },
        },
      },
    }),

    prisma.alert.findMany({
      where: {
        companyId,
        status: {
          in: ["OPEN", "ACKNOWLEDGED"],
        },
      },
      orderBy: {
        triggeredAt: "desc",
      },
      take: 15,
      select: {
        severity: true,
        title: true,
        message: true,
        status: true,
        triggeredAt: true,
        machine: {
          select: {
            machineName: true,
          },
        },
      },
    }),

    prisma.aIRecommendation.findMany({
      where: {
        companyId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        title: true,
        description: true,
        priority: true,
        confidenceScore: true,
        createdAt: true,
      },
    }),
  ]);

  const resourceTotals = new Map<
    string,
    {
      name: string;
      unit: string;
      total: number;
      count: number;
    }
  >();

  for (const usage of usages) {
    const key =
      `${usage.resourceType.resourceCode}::${usage.unit.symbol}`;

    const current = resourceTotals.get(key) ?? {
      name: usage.resourceType.resourceName,
      unit: usage.unit.symbol,
      total: 0,
      count: 0,
    };

    current.total += toNumber(usage.quantity);
    current.count += 1;

    resourceTotals.set(key, current);
  }

  return {
    period: "7 days",
    totalRecords: usages.length,
    resources: Array.from(resourceTotals.entries()).map(
      ([code, value]) => ({
        code: code.split("::")[0],
        ...value,
        total: Math.round(value.total * 100) / 100,
      }),
    ),
    recentUsages: usages.slice(0, 15).map((usage) => ({
      target:
        usage.machine?.machineName ??
        usage.checkpoint?.checkpointName ??
        "Unknown",
      department:
        usage.department?.departmentName ?? null,
      resource: usage.resourceType.resourceName,
      resourceCode: usage.resourceType.resourceCode,
      quantity: toNumber(usage.quantity),
      unit: usage.unit.symbol,
      sourceType: usage.sourceType,
      processingStatus: usage.processingStatus,
      usageAt: usage.usageAt.toISOString(),
    })),
    alerts: alerts.map((alert) => ({
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      status: alert.status,
      machineName: alert.machine?.machineName ?? null,
      triggeredAt: alert.triggeredAt.toISOString(),
    })),
    recommendations: recommendations.map((item) => ({
      title: item.title,
      description: item.description,
      priority: item.priority,
      confidence:
        item.confidenceScore === null
          ? null
          : toNumber(item.confidenceScore),
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

function fallbackAnswer(
  question: string,
  context: Awaited<ReturnType<typeof buildFactoryContext>>,
) {
  const openAlerts = context.alerts.filter(
    (item) => item.status === "OPEN",
  );

  if (/alert|แจ้งเตือน|ผิดปกติ|anomal/i.test(question)) {
    if (openAlerts.length === 0) {
      return "ตอนนี้ยังไม่มี Alert ที่เปิดอยู่จากข้อมูล 7 วันล่าสุดค่ะ";
    }

    const top = openAlerts[0];

    return `ตอนนี้มี ${openAlerts.length} Alert ที่ยังเปิดอยู่ รายการล่าสุดคือ “${top.title}” ระดับ ${top.severity}${top.machineName ? ` ที่ ${top.machineName}` : ""}`;
  }

  if (/resource|ทรัพยากร|ใช้.*มาก|สูงสุด/i.test(question)) {
    if (context.resources.length === 0) {
      return "ยังไม่มีข้อมูล ResourceUsage ในช่วง 7 วันล่าสุดค่ะ";
    }

    const top = [...context.resources].sort(
      (a, b) => b.count - a.count,
    )[0];

    return `ทรัพยากรที่มีการบันทึกบ่อยที่สุดใน 7 วันล่าสุดคือ ${top.name} จำนวน ${top.count} รายการ รวม ${top.total.toLocaleString("th-TH")} ${top.unit}`;
  }

  return `ใน 7 วันล่าสุดระบบมี ResourceUsage ${context.totalRecords} รายการ, Alert ที่ยังเปิดอยู่ ${openAlerts.length} รายการ และมีทรัพยากร ${context.resources.length} ประเภท คุณสามารถถามต่อได้ เช่น “มีอะไรผิดปกติ?”, “ทรัพยากรไหนถูกใช้มากสุด?” หรือ “สรุป Alert ล่าสุด”`;
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (session.roleName !== "MANAGER") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 },
    );
  }

  if (!session.companyId) {
    return NextResponse.json(
      { message: "Manager account does not have a companyId" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    message?: string;
    history?: ChatMessage[];
  };

  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { message: "message is required" },
      { status: 400 },
    );
  }

  const context = await buildFactoryContext(
    session.companyId,
  );

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      answer: fallbackAnswer(message, context),
      mode: "LOCAL_FALLBACK",
    });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const safeHistory = (body.history ?? [])
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 1200),
      }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      input: `
You are GreenFactory Assistant for a factory manager.

Rules:
- Answer in Thai unless the user asks for English.
- Base answers only on the FACTORY_CONTEXT below.
- Never invent measurements, causes, savings, or machine states.
- Clearly distinguish observation from possible cause.
- If data is insufficient, say so.
- Keep the first answer concise and actionable.
- For anomalies, mention severity and recommended checks when available.
- Different resource units must never be added together.

FACTORY_CONTEXT:
${JSON.stringify(context)}

RECENT_CONVERSATION:
${JSON.stringify(safeHistory)}

USER_QUESTION:
${message}
      `.trim(),
    });

    return NextResponse.json({
      answer:
        response.output_text?.trim() ||
        fallbackAnswer(message, context),
      mode: "AI",
    });
  } catch (error) {
    console.error("Manager assistant error:", error);

    return NextResponse.json({
      answer: fallbackAnswer(message, context),
      mode: "LOCAL_FALLBACK",
    });
  }
}

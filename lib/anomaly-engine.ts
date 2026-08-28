import "server-only";

import { prisma } from "@/lib/prisma";
import { generateAnomalyNarrative } from "@/lib/ai-analysis";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM";
type AnomalyType = "SPIKE" | "DROP";

const MIN_HISTORY = 3;
const HISTORY_LIMIT = 30;

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

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[], average: number) {
  if (values.length < 2) return 0;

  const variance =
    values.reduce(
      (sum, value) => sum + Math.pow(value - average, 2),
      0,
    ) / values.length;

  return Math.sqrt(variance);
}

function classifySeverity(
  deviationPct: number,
  zScore: number | null,
): Severity | null {
  const absDeviation = Math.abs(deviationPct);
  const absZ = Math.abs(zScore ?? 0);

  if (absDeviation >= 100 || absZ >= 4) {
    return "CRITICAL";
  }

  if (absDeviation >= 50 || absZ >= 3) {
    return "HIGH";
  }

  if (absDeviation >= 30 || absZ >= 2.5) {
    return "MEDIUM";
  }

  return null;
}

function isStatisticalAnomaly(
  historyCount: number,
  deviationPct: number,
  zScore: number | null,
) {
  const absDeviation = Math.abs(deviationPct);
  const absZ = Math.abs(zScore ?? 0);

  // ช่วงเริ่มต้นที่ข้อมูลยังน้อย ใช้เกณฑ์เข้มขึ้นเพื่อลด false alert
  if (historyCount < 5) {
    return absDeviation >= 60;
  }

  return absDeviation >= 30 && absZ >= 2;
}

export async function analyzeResourceUsage(
  usageId: bigint,
): Promise<{
  created: boolean;
  alertId?: string;
  reason?: string;
}> {
  const usage = await prisma.resourceUsage.findUnique({
    where: {
      usageId,
    },
    select: {
      usageId: true,
      usageReference: true,
      companyId: true,
      factoryId: true,
      buildingId: true,
      departmentId: true,
      lineId: true,
      machineId: true,
      checkpointId: true,
      resourceTypeId: true,
      quantity: true,
      usageAt: true,
      status: true,
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
  });

  if (!usage || usage.status !== "ACTIVE") {
    return {
      created: false,
      reason: "Usage not found or inactive",
    };
  }

  const targetWhere =
    usage.machineId !== null
      ? { machineId: usage.machineId }
      : usage.checkpointId !== null
        ? { checkpointId: usage.checkpointId }
        : null;

  if (!targetWhere) {
    return {
      created: false,
      reason: "Usage has no machine/checkpoint target",
    };
  }

  const historical = await prisma.resourceUsage.findMany({
    where: {
      companyId: usage.companyId,
      status: "ACTIVE",
      resourceTypeId: usage.resourceTypeId,
      usageAt: {
        lt: usage.usageAt,
      },
      ...targetWhere,
    },
    orderBy: {
      usageAt: "desc",
    },
    take: HISTORY_LIMIT,
    select: {
      quantity: true,
    },
  });

  if (historical.length < MIN_HISTORY) {
    return {
      created: false,
      reason: `Need at least ${MIN_HISTORY} historical records`,
    };
  }

  const values = historical
    .map((item) => toNumber(item.quantity))
    .filter((value) => Number.isFinite(value));

  if (values.length < MIN_HISTORY) {
    return {
      created: false,
      reason: "Not enough valid historical values",
    };
  }

  const currentValue = toNumber(usage.quantity);
  const average = mean(values);

  if (!Number.isFinite(currentValue) || average <= 0) {
    return {
      created: false,
      reason: "Invalid current value or historical average",
    };
  }

  const sd = standardDeviation(values, average);
  const deviationPct =
    ((currentValue - average) / average) * 100;

  const zScore =
    sd > 0 ? (currentValue - average) / sd : null;

  if (
    !isStatisticalAnomaly(
      values.length,
      deviationPct,
      zScore,
    )
  ) {
    return {
      created: false,
      reason: "Within normal range",
    };
  }

  const severity = classifySeverity(
    deviationPct,
    zScore,
  );

  if (!severity) {
    return {
      created: false,
      reason: "Below alert severity threshold",
    };
  }

  const anomalyType: AnomalyType =
    deviationPct >= 0 ? "SPIKE" : "DROP";

  const alertCode =
    `ANOM-${usage.usageId.toString()}-${anomalyType}`;

  const existing = await prisma.alert.findUnique({
    where: {
      alertCode,
    },
    select: {
      alertId: true,
    },
  });

  if (existing) {
    return {
      created: false,
      alertId: String(existing.alertId),
      reason: "Alert already exists",
    };
  }

  const targetName =
    usage.machine?.machineName ??
    usage.checkpoint?.checkpointName ??
    "จุดตรวจ";

  const narrative = await generateAnomalyNarrative({
    machineName: targetName,
    resourceName: usage.resourceType.resourceName,
    resourceCode: usage.resourceType.resourceCode,
    unit: usage.unit.symbol,
    currentValue,
    average,
    deviationPct,
    zScore,
    sampleSize: values.length,
    anomalyType,
    severity,
  });

  const alert = await prisma.alert.create({
    data: {
      companyId: usage.companyId,
      factoryId: usage.factoryId,
      buildingId: usage.buildingId,
      departmentId: usage.departmentId,
      lineId: usage.lineId,
      machineId: usage.machineId,
      usageId: usage.usageId,

      alertCode,
      alertType:
        anomalyType === "SPIKE"
          ? "RESOURCE_USAGE_SPIKE"
          : "RESOURCE_USAGE_DROP",
      severity,
      title: narrative.title,
      message:
        `${narrative.message} ` +
        `AI recommendation: ${narrative.recommendation}`.slice(
          0,
          1000,
        ),
      thresholdValue: average,
      actualValue: currentValue,
      status: "OPEN",
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      companyId: usage.companyId,
      factoryId: usage.factoryId,
      buildingId: usage.buildingId,
      departmentId: usage.departmentId,
      lineId: usage.lineId,
      machineId: usage.machineId,
      usageId: usage.usageId,
      alertId: alert.alertId,

      recommendationType: "ANOMALY_RESPONSE",
      title: `คำแนะนำ: ${narrative.title}`.slice(0, 255),
      description: narrative.recommendation.slice(0, 2000),
      priority:
        severity === "CRITICAL"
          ? 1
          : severity === "HIGH"
            ? 2
            : 3,
      confidenceScore: narrative.confidence,
      reviewStatus: "PENDING",
      implementationStatus: "NOT_STARTED",
      status: "ACTIVE",
    },
  });

  return {
    created: true,
    alertId: String(alert.alertId),
  };
}

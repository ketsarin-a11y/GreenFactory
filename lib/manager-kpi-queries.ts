import "server-only";

import { prisma } from "@/lib/prisma";

export interface ManagerKpiLatestResult {
  resultId: string;
  actualValue: number;
  varianceValue: number;
  achievementPercent: number;
  resultStatus: string;
  periodStart: string;
  periodEnd: string;
  calculatedAt: string;
}

export interface ManagerKpiDefinition {
  kpiId: number;
  kpiCode: string;
  kpiName: string;
  kpiType: string;
  scopeType: string;
  targetValue: number;
  targetOperator: string;
  periodType: string;
  unit: string;
  resourceCode: string | null;
  resourceName: string | null;
  latestResult: ManagerKpiLatestResult | null;
}

export interface ManagerKpiDailyResult extends ManagerKpiLatestResult {
  kpiId: number;
  kpiCode: string;
  kpiName: string;
  targetValue: number;
  targetOperator: string;
  unit: string;
}

export interface ManagerKpiDashboardData {
  definitions: ManagerKpiDefinition[];
  dailyResults: ManagerKpiDailyResult[];
  totalResults: number;
  passed: number;
  failed: number;
  passRate: number | null;
}

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function getManagerKpiDashboard(
  companyId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<ManagerKpiDashboardData> {
  const empty: ManagerKpiDashboardData = {
    definitions: [],
    dailyResults: [],
    totalResults: 0,
    passed: 0,
    failed: 0,
    passRate: null,
  };

  if (companyId === null) return empty;

  const kpis = await prisma.kPI.findMany({
    where: {
      companyId,
      status: "ACTIVE",
      effectiveFrom: { lte: endDate },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: startDate } }],
    },
    orderBy: [{ kpiCode: "asc" }, { kpiId: "asc" }],
    select: {
      kpiId: true,
      kpiCode: true,
      kpiName: true,
      kpiType: true,
      scopeType: true,
      targetValue: true,
      targetOperator: true,
      periodType: true,
      unit: { select: { symbol: true } },
      resourceType: { select: { resourceCode: true, resourceName: true } },
      results: {
        where: {
          periodStart: { lte: endDate },
          periodEnd: { gte: startDate },
        },
        orderBy: [{ periodStart: "desc" }, { resultId: "desc" }],
        select: {
          resultId: true,
          actualValue: true,
          varianceValue: true,
          achievementPercent: true,
          resultStatus: true,
          periodStart: true,
          periodEnd: true,
          calculatedAt: true,
        },
      },
    },
  });

  const definitions: ManagerKpiDefinition[] = kpis.map((kpi) => {
    const latest = kpi.results[0] ?? null;

    return {
      kpiId: kpi.kpiId,
      kpiCode: kpi.kpiCode,
      kpiName: kpi.kpiName,
      kpiType: kpi.kpiType,
      scopeType: kpi.scopeType,
      targetValue: Number(kpi.targetValue),
      targetOperator: kpi.targetOperator,
      periodType: kpi.periodType,
      unit: kpi.unit.symbol,
      resourceCode: kpi.resourceType?.resourceCode ?? null,
      resourceName: kpi.resourceType?.resourceName ?? null,
      latestResult: latest
        ? {
            resultId: latest.resultId.toString(),
            actualValue: Number(latest.actualValue),
            varianceValue: Number(latest.varianceValue),
            achievementPercent: Number(latest.achievementPercent),
            resultStatus: latest.resultStatus,
            periodStart: dateOnly(latest.periodStart),
            periodEnd: dateOnly(latest.periodEnd),
            calculatedAt: latest.calculatedAt.toISOString(),
          }
        : null,
    };
  });

  const dailyResults: ManagerKpiDailyResult[] = kpis
    .flatMap((kpi) =>
      kpi.results.map((result) => ({
        resultId: result.resultId.toString(),
        kpiId: kpi.kpiId,
        kpiCode: kpi.kpiCode,
        kpiName: kpi.kpiName,
        targetValue: Number(kpi.targetValue),
        targetOperator: kpi.targetOperator,
        unit: kpi.unit.symbol,
        actualValue: Number(result.actualValue),
        varianceValue: Number(result.varianceValue),
        achievementPercent: Number(result.achievementPercent),
        resultStatus: result.resultStatus,
        periodStart: dateOnly(result.periodStart),
        periodEnd: dateOnly(result.periodEnd),
        calculatedAt: result.calculatedAt.toISOString(),
      })),
    )
    .sort((a, b) => {
      const dateCompare = b.periodStart.localeCompare(a.periodStart);
      return dateCompare !== 0 ? dateCompare : a.kpiCode.localeCompare(b.kpiCode);
    });

  const passed = dailyResults.filter((item) => item.resultStatus.toUpperCase() === "PASS").length;
  const failed = dailyResults.filter((item) => item.resultStatus.toUpperCase() === "FAIL").length;
  const evaluated = passed + failed;

  return {
    definitions,
    dailyResults,
    totalResults: dailyResults.length,
    passed,
    failed,
    passRate: evaluated > 0 ? Math.round((passed / evaluated) * 10000) / 100 : null,
  };
}
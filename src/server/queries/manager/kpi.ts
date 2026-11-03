import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { bkkDay } from "@/lib/time";
import { kpiWhere, type Range } from "./common";

export const PAGE_SIZE = 20;
const day = (d: Date) => bkkDay(d); // @db.Date values are UTC midnight → same calendar day

export async function getKpis(user: CurrentUser, range: Range, f: { kpiId?: number; status?: string; page: number }) {
  const inRange = { periodStart: { lte: new Date(`${range.to}T00:00:00Z`) }, periodEnd: { gte: new Date(`${range.from}T00:00:00Z`) } };
  const kpis = await db.kPI.findMany({
    where: { ...kpiWhere(user), status: "ACTIVE" },
    include: {
      unit: { select: { symbol: true } },
      resourceType: { select: { resourceCode: true, resourceName: true } },
      results: { where: { periodEnd: { lte: new Date(`${range.to}T00:00:00Z`) } }, orderBy: { periodEnd: "desc" }, take: 1 },
    },
    orderBy: { kpiCode: "asc" },
  });
  const resultWhere = {
    kpi: kpiWhere(user),
    ...inRange,
    ...(f.kpiId ? { kpiId: f.kpiId } : {}),
    ...(f.status === "PASS" || f.status === "FAIL" ? { resultStatus: f.status } : {}),
  };
  const [results, total, summary] = await Promise.all([
    db.kPIResult.findMany({
      where: resultWhere,
      orderBy: [{ periodEnd: "desc" }, { kpiId: "asc" }],
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { kpi: { select: { kpiName: true, kpiCode: true, targetValue: true, targetOperator: true, unit: { select: { symbol: true } } } } },
    }),
    db.kPIResult.count({ where: resultWhere }),
    db.kPIResult.groupBy({ by: ["resultStatus"], where: { kpi: kpiWhere(user), ...inRange }, _count: true }),
  ]);
  const count = (s: string) => summary.find((x) => x.resultStatus === s)?._count ?? 0;
  const pass = count("PASS"), fail = count("FAIL");

  return {
    kpis: kpis.map((k) => {
      const r = k.results[0];
      return {
        id: k.kpiId, code: k.kpiCode, name: k.kpiName, unit: k.unit.symbol, periodType: k.periodType,
        target: Number(k.targetValue), operator: k.targetOperator, resource: k.resourceType?.resourceName ?? "—", resourceCode: k.resourceType?.resourceCode ?? "",
        latest: r ? { actual: Number(r.actualValue), achievement: Number(r.achievementPercent), status: r.resultStatus, start: day(r.periodStart), end: day(r.periodEnd) } : null,
      };
    }),
    results: results.map((r) => ({
      id: String(r.resultId), kpiName: r.kpi.kpiName, kpiCode: r.kpi.kpiCode, unit: r.kpi.unit.symbol, operator: r.kpi.targetOperator,
      start: day(r.periodStart), end: day(r.periodEnd), actual: Number(r.actualValue), target: Number(r.kpi.targetValue),
      variance: Number(r.varianceValue), achievement: Number(r.achievementPercent), status: r.resultStatus,
    })),
    total,
    summary: { total: pass + fail, pass, fail, passRate: pass + fail ? Math.round((pass / (pass + fail)) * 1000) / 10 : null },
  };
}

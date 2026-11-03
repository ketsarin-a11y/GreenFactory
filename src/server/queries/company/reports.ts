import "server-only";
import { db } from "@/server/db";
import { factoryWhere, usageWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { bkkDay, startOfBkkDay } from "@/lib/time";
import { num } from "@/lib/format";
import { byPriority } from "@/lib/resources";

export const isMonth = (s: unknown): s is string => typeof s === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
export const currentMonth = () => bkkDay(new Date()).slice(0, 7);

/** Bangkok month range [start, end). */
export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  return { gte: startOfBkkDay(`${month}-01`), lt: startOfBkkDay(`${next}-01`) };
}

/** Per factory × resource × unit totals for one month, plus carbon. */
export async function monthlyReport(user: CurrentUser, month: string) {
  const where = { ...usageWhere(user), usageAt: monthRange(month) };
  const [groups, carbonRows, factories, types, units] = await Promise.all([
    db.resourceUsage.groupBy({ by: ["factoryId", "resourceTypeId", "unitId"], where, _sum: { quantity: true }, _count: { _all: true } }),
    db.carbonResult.findMany({ where: { usage: where }, select: { carbonValue: true, usage: { select: { factoryId: true, resourceTypeId: true, unitId: true } } } }),
    db.factory.findMany({ where: factoryWhere(user), orderBy: { factoryCode: "asc" }, select: { factoryId: true, factoryCode: true, factoryName: true } }),
    db.resourceTypeMaster.findMany({ select: { resourceTypeId: true, resourceCode: true, resourceName: true } }),
    db.unit.findMany({ select: { unitId: true, symbol: true } }),
  ]);
  const carbonOf = (f: number | null, r: number, u: number) =>
    carbonRows.filter((c) => c.usage.factoryId === f && c.usage.resourceTypeId === r && c.usage.unitId === u).reduce((a, c) => a + num(c.carbonValue), 0);
  const rows = groups.map((g) => {
    const t = types.find((x) => x.resourceTypeId === g.resourceTypeId);
    return {
      factoryId: g.factoryId,
      code: t?.resourceCode ?? "",
      resource: t?.resourceName ?? "—",
      unit: units.find((u) => u.unitId === g.unitId)?.symbol ?? "",
      quantity: num(g._sum.quantity),
      records: g._count._all,
      carbonKg: carbonOf(g.factoryId, g.resourceTypeId, g.unitId),
    };
  });
  const sections = factories
    .map((f) => {
      const r = rows.filter((x) => x.factoryId === f.factoryId).sort((a, b) => byPriority(a.code, b.code));
      return { factory: `${f.factoryCode} · ${f.factoryName}`, rows: r, carbonKg: r.reduce((a, x) => a + x.carbonKg, 0) };
    })
    .filter((s) => s.rows.length > 0);
  return { month, sections, carbonKg: carbonRows.reduce((a, c) => a + num(c.carbonValue), 0) };
}

import "server-only";
import { db } from "@/server/db";
import { factoryWhere, usageWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { addDays, bkkDay, startOfBkkDay } from "@/lib/time";
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
const monthDays = (month: string) => {
  const r = monthRange(month);
  const n = Math.round((r.lt.getTime() - r.gte.getTime()) / 86_400_000);
  return Array.from({ length: n }, (_, i) => addDays(`${month}-01`, i));
};

/** Months that have usage in scope, newest first (for the month picker). */
export async function reportMonths(user: CurrentUser) {
  const [first, last] = await Promise.all([
    db.resourceUsage.findFirst({ where: usageWhere(user), orderBy: { usageAt: "asc" }, select: { usageAt: true } }),
    db.resourceUsage.findFirst({ where: usageWhere(user), orderBy: { usageAt: "desc" }, select: { usageAt: true } }),
  ]);
  const out: string[] = [];
  const end = (last ? bkkDay(last.usageAt) : bkkDay(new Date())).slice(0, 7);
  let m = (first ? bkkDay(first.usageAt) : bkkDay(new Date())).slice(0, 7);
  while (m <= end && out.length < 36) {
    out.unshift(m);
    const [y, mm] = m.split("-").map(Number);
    m = mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, "0")}`;
  }
  return out.length ? out : [currentMonth()];
}

/** Newest month with data, except in the first week of a month: then the last full month. */
export function defaultReportMonth(months: string[], now = new Date()) {
  const today = bkkDay(now);
  const early = Number(today.slice(8, 10)) <= 7;
  return early && months[0] === today.slice(0, 7) && months[1] ? months[1] : months[0] ?? today.slice(0, 7);
}

/**
 * One month for the whole company or one factory: totals per factory × resource × unit
 * (never adding different units), daily series per resource/unit split by factory, and carbon.
 * `factoryId` outside the company simply matches nothing (the scope is always applied).
 */
export async function monthlyReport(user: CurrentUser, month: string, factoryId?: number) {
  const where = { ...usageWhere(user), usageAt: monthRange(month), ...(factoryId ? { factoryId } : {}) };
  const [usages, allFactories] = await Promise.all([
    db.resourceUsage.findMany({
      where,
      select: {
        factoryId: true, usageAt: true, quantity: true,
        resourceType: { select: { resourceCode: true, resourceName: true } }, unit: { select: { symbol: true } },
        carbonResults: { select: { carbonValue: true } },
      },
    }),
    db.factory.findMany({ where: factoryWhere(user), orderBy: { factoryCode: "asc" }, select: { factoryId: true, factoryCode: true, factoryName: true } }),
  ]);
  const factories = allFactories.filter((f) => !factoryId || f.factoryId === factoryId);
  const days = monthDays(month);
  const dayIdx = new Map(days.map((d, i) => [d, i]));

  type Cell = { quantity: number; records: number; carbonKg: number; daily: number[] };
  const metrics = new Map<string, { code: string; resource: string; unit: string; byFactory: Map<number | null, Cell> }>();
  for (const u of usages) {
    const key = `${u.resourceType.resourceCode}|${u.unit.symbol}`;
    if (!metrics.has(key)) metrics.set(key, { code: u.resourceType.resourceCode, resource: u.resourceType.resourceName, unit: u.unit.symbol, byFactory: new Map() });
    const m = metrics.get(key)!;
    if (!m.byFactory.has(u.factoryId)) m.byFactory.set(u.factoryId, { quantity: 0, records: 0, carbonKg: 0, daily: days.map(() => 0) });
    const c = m.byFactory.get(u.factoryId)!;
    const q = num(u.quantity);
    c.quantity += q;
    c.records++;
    c.carbonKg += u.carbonResults.reduce((a, x) => a + num(x.carbonValue), 0);
    const i = dayIdx.get(bkkDay(u.usageAt));
    if (i !== undefined) c.daily[i] += q;
  }
  const sorted = [...metrics.values()].sort((a, b) => byPriority(a.code, b.code) || a.unit.localeCompare(b.unit));
  const empty = (): Cell => ({ quantity: 0, records: 0, carbonKg: 0, daily: days.map(() => 0) });

  const sections = factories
    .map((f) => {
      const rows = sorted
        .filter((m) => m.byFactory.has(f.factoryId))
        .map((m) => { const c = m.byFactory.get(f.factoryId)!; return { code: m.code, resource: m.resource, unit: m.unit, quantity: c.quantity, records: c.records, carbonKg: c.carbonKg }; });
      return { factoryId: f.factoryId, code: f.factoryCode, name: f.factoryName, rows, carbonKg: rows.reduce((a, x) => a + x.carbonKg, 0) };
    })
    .filter((s) => s.rows.length > 0);
  const shown = factories.filter((f) => sections.some((s) => s.factoryId === f.factoryId));

  return {
    month,
    days,
    factories: shown.map((f) => ({ id: f.factoryId, code: f.factoryCode, name: f.factoryName })),
    sections,
    /** Resource/unit metrics with per-factory totals and daily values (comparison + charts). */
    metrics: sorted.map((m) => ({
      code: m.code, resource: m.resource, unit: m.unit,
      total: [...m.byFactory.values()].reduce((a, c) => a + c.quantity, 0),
      carbonKg: [...m.byFactory.values()].reduce((a, c) => a + c.carbonKg, 0),
      byFactory: shown.map((f) => { const c = m.byFactory.get(f.factoryId) ?? empty(); return { factoryId: f.factoryId, quantity: c.quantity, records: c.records, carbonKg: c.carbonKg, daily: c.daily }; }),
    })),
    carbonKg: usages.reduce((a, u) => a + u.carbonResults.reduce((b, x) => b + num(x.carbonValue), 0), 0),
  };
}
export type MonthlyReport = Awaited<ReturnType<typeof monthlyReport>>;

import "server-only";
import { db } from "@/server/db";
import { factoryWhere, usageWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { pctChange } from "@/server/domain/analytics";
import { addDays, bkkDay, endOfBkkDayExclusive, startOfBkkDay } from "@/lib/time";
import { num } from "@/lib/format";

export const ENERGY_WINDOW = 30;
/** The factory chart shows a longer run (7-day average) so slow changes such as a retrofit are visible. */
export const TREND_DAYS = 90;
const AVG = 7;
const isElec = (code: string, unit: string) => code === "ELECTRICITY" && unit === "kWh";

/**
 * Company-wide electricity (kWh) and carbon for the last 30 Bangkok days that have data,
 * against the 30 days before, in total and per factory. Comparisons are null when recording
 * had not started at the beginning of the previous window (no fake growth).
 */
export async function companyEnergy(user: CurrentUser) {
  const scope = usageWhere(user);
  const [latest, first, factories] = await Promise.all([
    db.resourceUsage.findFirst({ where: { ...scope, usageAt: { lte: new Date() } }, orderBy: { usageAt: "desc" }, select: { usageAt: true } }),
    db.resourceUsage.findFirst({ where: scope, orderBy: { usageAt: "asc" }, select: { usageAt: true } }),
    db.factory.findMany({ where: { ...factoryWhere(user), status: "ACTIVE" }, orderBy: { factoryCode: "asc" }, select: { factoryId: true, factoryCode: true, factoryName: true } }),
  ]);
  // Complete days only: today is still being recorded and would draw a false drop at the end.
  const yesterday = addDays(bkkDay(new Date()), -1);
  const latestDay = latest ? bkkDay(latest.usageAt) : yesterday;
  const to = latestDay < yesterday ? latestDay : yesterday;
  const from = addDays(to, -(ENERGY_WINDOW - 1));
  const prevFrom = addDays(from, -ENERGY_WINDOW);
  const comparable = !!first && bkkDay(first.usageAt) <= prevFrom;
  const trendFrom = addDays(to, -(TREND_DAYS + AVG - 2));

  const rows = latest
    ? await db.resourceUsage.findMany({
        where: { ...scope, usageAt: { gte: startOfBkkDay(trendFrom < prevFrom ? trendFrom : prevFrom), lt: endOfBkkDayExclusive(to) } },
        select: { factoryId: true, usageAt: true, quantity: true, resourceType: { select: { resourceCode: true } }, unit: { select: { symbol: true } }, carbonResults: { select: { carbonValue: true } } },
      })
    : [];

  const days = Array.from({ length: ENERGY_WINDOW }, (_, i) => addDays(from, i));
  const dayIdx = new Map(days.map((d, i) => [d, i]));
  type Acc = { daily: number[]; kwh: number; kwhPrev: number; carbon: number; carbonPrev: number; carbonDaily: number[] };
  const blank = (): Acc => ({ daily: days.map(() => 0), kwh: 0, kwhPrev: 0, carbon: 0, carbonPrev: 0, carbonDaily: days.map(() => 0) });
  const total = blank();
  const byFactory = new Map<number, Acc>(factories.map((f) => [f.factoryId, blank()]));
  const longDays = Array.from({ length: TREND_DAYS + AVG - 1 }, (_, i) => addDays(trendFrom, i));
  const longIdx = new Map(longDays.map((d, i) => [d, i]));
  const longKwh = new Map<number, number[]>(factories.map((f) => [f.factoryId, longDays.map(() => 0)]));

  for (const r of rows) {
    const day = bkkDay(r.usageAt);
    const i = dayIdx.get(day);
    const current = day >= from;
    const elec = isElec(r.resourceType.resourceCode, r.unit.symbol);
    const q = num(r.quantity);
    const c = r.carbonResults.reduce((a, x) => a + num(x.carbonValue), 0);
    const li = longIdx.get(day);
    if (elec && li !== undefined && r.factoryId) { const arr = longKwh.get(r.factoryId); if (arr) arr[li] += q; }
    if (day < prevFrom) continue;
    for (const acc of [total, r.factoryId ? byFactory.get(r.factoryId) : undefined]) {
      if (!acc) continue;
      if (current) {
        acc.carbon += c;
        if (i !== undefined) acc.carbonDaily[i] += c;
        if (elec) { acc.kwh += q; if (i !== undefined) acc.daily[i] += q; }
      } else {
        acc.carbonPrev += c;
        if (elec) acc.kwhPrev += q;
      }
    }
  }
  const change = (now: number, prev: number) => (comparable ? pctChange(now, prev) : null);

  const avg7 = (xs: number[]) => xs.slice(AVG - 1).map((_, i) => xs.slice(i, i + AVG).reduce((a, v) => a + v, 0) / AVG);
  const trendDays = longDays.slice(AVG - 1);
  const firstDay = first ? bkkDay(first.usageAt) : to;

  return {
    from, to, days,
    // Days before recording started are left out of the averaged trend (no ramp-up from zero).
    trend: {
      days: trendDays.filter((d) => addDays(d, -(AVG - 1)) >= firstDay),
      byFactory: new Map([...longKwh].map(([id, xs]) => [id, avg7(xs).filter((_, i) => addDays(trendDays[i], -(AVG - 1)) >= firstDay)])),
    },
    hasData: rows.some((r) => bkkDay(r.usageAt) >= from),
    elec: { total: total.kwh, change: change(total.kwh, total.kwhPrev), daily: total.daily },
    carbon: { totalKg: total.carbon, change: change(total.carbon, total.carbonPrev), daily: total.carbonDaily },
    factories: factories.map((f) => {
      const a = byFactory.get(f.factoryId)!;
      return {
        id: f.factoryId, code: f.factoryCode, name: f.factoryName,
        daily: a.daily,
        kwh: a.kwh,
        kwhPerDay: a.kwh / ENERGY_WINDOW,
        kwhChange: change(a.kwh, a.kwhPrev),
        carbonKg: a.carbon,
        carbonChange: change(a.carbon, a.carbonPrev),
      };
    }),
  };
}
export type CompanyEnergy = Awaited<ReturnType<typeof companyEnergy>>;

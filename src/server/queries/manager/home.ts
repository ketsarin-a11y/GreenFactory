import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { ownedWhere, sensorWhere, usageWhere } from "@/server/scope";
import { anomalyBand, dailyTotals, dataQuality, dayList, pctChange, previousRange, sumByResourceUnit } from "@/server/domain/analytics";
import { periodBounds } from "@/server/domain/kpi";
import { addDays, bkkDay, daysBetween, startOfBkkDay } from "@/lib/time";
import { dayRange, kpiUsageWhere, kpiWhere, loadUsageRows, sortGroups, type Range, type UsageRow, loadPreviousRows } from "./common";
import { connectionStatus } from "./machines";

const TOP_MACHINES = 5;
const HEAT_MACHINES = 10;
/** Sparklines and the machine × day heatmap always cover the 28 days ending at the range end. */
export const WINDOW_DAYS = 28;

const sum = (xs: { quantity: number }[]) => xs.reduce((a, x) => a + x.quantity, 0);
const carbonKg = (xs: UsageRow[]) => xs.reduce((a, x) => a + (x.carbon?.kg ?? 0), 0);
const isElec = (r: { resourceCode: string; unit: string }) => r.resourceCode === "ELECTRICITY" && r.unit === "kWh";

export async function getHome(user: CurrentUser, range: Range) {
  const prev = previousRange(range.from, range.to);
  const wFrom = addDays(range.to, -(WINDOW_DAYS - 1));
  const [rows, prevRows, windowRows, openAlerts, openAlertCount, alertsNow, alertsPrev, alertDays, sensors, lastUsage, kpis] = await Promise.all([
    loadUsageRows(user, range.from, range.to),
    loadPreviousRows(user, prev),
    loadUsageRows(user, wFrom, range.to),
    db.alert.findMany({
      where: { ...ownedWhere(user), status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      orderBy: [{ triggeredAt: "desc" }],
      take: 4,
      select: { alertId: true, title: true, severity: true, status: true, triggeredAt: true, machine: { select: { machineName: true } } },
    }),
    db.alert.count({ where: { ...ownedWhere(user), status: "OPEN" } }),
    db.alert.count({ where: { ...ownedWhere(user), triggeredAt: dayRange(range.from, range.to) } }),
    db.alert.count({ where: { ...ownedWhere(user), triggeredAt: dayRange(prev.from, prev.to) } }),
    db.alert.findMany({ where: { ...ownedWhere(user), triggeredAt: dayRange(wFrom, range.to) }, select: { triggeredAt: true } }),
    db.sensor.findMany({
      where: { ...sensorWhere(user), status: "ACTIVE" },
      select: { status: true, lastConnectedAt: true, samplingIntervalSeconds: true, data: { orderBy: { measuredAt: "desc" }, take: 1, select: { qualityStatus: true, measuredAt: true } } },
    }),
    db.resourceUsage.findFirst({ where: usageWhere(user), orderBy: { usageAt: "desc" }, select: { usageAt: true } }),
    db.kPI.findMany({ where: { ...kpiWhere(user), status: "ACTIVE" }, include: { unit: { select: { symbol: true } } }, orderBy: { kpiCode: "asc" } }),
  ]);

  const elecRows = rows.filter(isElec);
  const elecNow = sum(elecRows), elecPrev = sum(prevRows.filter(isElec));
  const carbonNow = carbonKg(rows), carbonPrev = carbonKg(prevRows);
  const days = dayList(range.from, range.to);
  const band = anomalyBand(days, dailyTotals(elecRows, "kWh"));

  // Stacked daily electricity: top machines by total + "อื่น ๆ".
  const byMachine = new Map<string, number>();
  for (const r of elecRows) byMachine.set(r.target, (byMachine.get(r.target) ?? 0) + r.quantity);
  const top = [...byMachine.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_MACHINES).map(([n]) => n).sort();
  const daily = days.map((day) => {
    const row: Record<string, number | string> = { day };
    for (const r of elecRows.filter((x) => x.day === day)) {
      const k = top.includes(r.target) ? r.target : "อื่น ๆ";
      row[k] = ((row[k] as number) ?? 0) + r.quantity;
    }
    return row;
  });
  const hasOther = elecRows.some((r) => !top.includes(r.target));

  const prevGroups = new Map(sumByResourceUnit(prevRows).map((g) => [g.key, g.total]));
  const resources = sortGroups(sumByResourceUnit(rows)).map((g) => ({ ...g, change: pctChange(g.total, prevGroups.get(g.key) ?? 0) }));

  // 28-day window: sparklines + machine × day heatmap.
  const wDays = dayList(wFrom, range.to);
  const perDay = (xs: UsageRow[], v: (r: UsageRow) => number) => {
    const m = new Map<string, number>();
    for (const r of xs) m.set(r.day, (m.get(r.day) ?? 0) + v(r));
    return wDays.map((d) => m.get(d) ?? 0);
  };
  const water = resources.find((g) => g.resourceCode === "TAP_WATER" && g.unit === "m³") ?? null;
  const isWater = (r: UsageRow) => !!water && r.resourceCode === water.resourceCode && r.unit === water.unit;
  const alertPerDay = new Map<string, number>();
  for (const a of alertDays) alertPerDay.set(bkkDay(a.triggeredAt), (alertPerDay.get(bkkDay(a.triggeredAt)) ?? 0) + 1);

  const wElec = windowRows.filter((r) => isElec(r) && r.machineId !== null);
  const wByMachine = new Map<string, Map<string, number>>();
  for (const r of wElec) {
    const m = wByMachine.get(r.target) ?? new Map<string, number>();
    m.set(r.day, (m.get(r.day) ?? 0) + r.quantity);
    wByMachine.set(r.target, m);
  }
  const heatRows = [...wByMachine.entries()]
    .map(([name, m]) => ({ name, total: [...m.values()].reduce((a, v) => a + v, 0), m }))
    .sort((a, b) => b.total - a.total)
    .slice(0, HEAT_MACHINES);

  // Live line: latest reading (manual or sensor) and sensors currently online.
  const now = new Date();
  const lastSensor = sensors.map((s) => s.data[0]?.measuredAt).filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0];
  const latestAt = [lastUsage?.usageAt, lastSensor].filter((d): d is Date => !!d && d <= now).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const online = sensors.filter((s) => connectionStatus(s, s.data[0]?.qualityStatus ?? null, now) === "ONLINE").length;

  // KPI progress in the period that contains the range end (partial until the period closes).
  const ref = range.to;
  const kpiProgress = await Promise.all(
    kpis.map(async (k) => {
      const p = periodBounds(k.periodType, startOfBkkDay(ref));
      const agg = await db.resourceUsage.aggregate({ _sum: { quantity: true }, where: kpiUsageWhere(k, p.start, ref) });
      const actual = Number(agg._sum.quantity ?? 0);
      const elapsed = daysBetween(p.start, ref), length = daysBetween(p.start, p.end);
      return {
        id: k.kpiId, name: k.kpiName, unit: k.unit.symbol, operator: k.targetOperator, target: Number(k.targetValue),
        actual, start: p.start, end: p.end, elapsed, length,
        projected: elapsed < length && elapsed > 0 ? (actual / elapsed) * length : null,
      };
    }),
  );

  return {
    elec: { total: elecNow, change: pctChange(elecNow, elecPrev), spark: perDay(windowRows.filter(isElec), (r) => r.quantity) },
    carbon: { total: carbonNow, change: pctChange(carbonNow, carbonPrev), spark: perDay(windowRows, (r) => r.carbon?.kg ?? 0) },
    water: water && { ...water, spark: perDay(windowRows.filter(isWater), (r) => r.quantity) },
    alerts: { open: openAlertCount, triggered: alertsNow, change: prevRows.length ? pctChange(alertsNow, alertsPrev) : null, spark: wDays.map((d) => alertPerDay.get(d) ?? 0) },
    live: { latestAt, online, sensors: sensors.length },
    anomalyDays: band.anomalyDays,
    stacked: { days: daily, machines: top, hasOther },
    heatmap: { days: wDays, rows: heatRows.map((h) => ({ name: h.name, values: wDays.map((d) => h.m.get(d) ?? null) })) },
    resources,
    openAlerts,
    openAlertCount,
    kpis: kpiProgress,
    kpiRef: ref,
    quality: dataQuality(rows),
    records: rows.length,
    qrCount: rows.filter((r) => r.sourceType === "QR").length,
    sensorCount: rows.filter((r) => r.sourceType === "SENSOR").length,
  };
}

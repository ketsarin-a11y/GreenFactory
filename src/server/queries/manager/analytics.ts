import "server-only";
import type { CurrentUser } from "@/server/auth/current-user";
import { anomalyBand, dailyTotals, dayList, findings, pctChange, previousRange, sumByResourceUnit } from "@/server/domain/analytics";
import { forecast } from "@/server/domain/forecast";
import { addDays } from "@/lib/time";
import { loadUsageRows, metricKey, sortGroups, type Range, type UsageFilter, type UsageRow, loadPreviousRows } from "./common";

const group = (rows: UsageRow[], key: (r: UsageRow) => string) => {
  const m = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const g = m.get(key(r)) ?? { total: 0, count: 0 };
    g.total += r.quantity;
    g.count++;
    m.set(key(r), g);
  }
  return [...m.entries()].map(([name, g]) => ({ name, ...g })).sort((a, b) => b.total - a.total);
};

export async function getAnalytics(user: CurrentUser, range: Range, filter: UsageFilter, metric?: string) {
  const prev = previousRange(range.from, range.to);
  const [rows, prevRows] = await Promise.all([loadUsageRows(user, range.from, range.to, filter), loadPreviousRows(user, prev, filter)]);

  const metrics = sortGroups(sumByResourceUnit(rows));
  const selected = metrics.find((m) => m.key === metric) ?? metrics.find((m) => m.key === metricKey("ELECTRICITY", "kWh")) ?? metrics[0];
  if (!selected) return { metrics, selected: null } as const;

  const is = (r: UsageRow) => r.resourceCode === selected.resourceCode && r.unit === selected.unit;
  const mrows = rows.filter(is);
  const prevTotal = prevRows.filter(is).reduce((a, r) => a + r.quantity, 0);
  const days = dayList(range.from, range.to);
  const totals = dailyTotals(mrows, selected.unit);
  const band = anomalyBand(days, totals);
  const change = pctChange(selected.total, prevTotal);

  const byDepartment = group(mrows, (r) => r.departmentName);
  const byMachine = group(mrows, (r) => r.target);
  const top = byDepartment[0];
  const fc = forecast(days.filter((d) => totals.has(d)).map((d) => totals.get(d)!));

  const dayDetail = Object.fromEntries(
    days.filter((d) => totals.has(d)).map((d) => {
      const dr = mrows.filter((r) => r.day === d);
      return [d, group(dr, (r) => r.target).slice(0, 6).map((g) => ({ ...g, share: (g.total / totals.get(d)!) * 100 }))];
    }),
  );

  return {
    metrics,
    selected,
    change,
    prevTotal,
    band,
    points: band.points,
    byDepartment,
    byMachine,
    dayDetail,
    forecast: fc && { ...fc, points: fc.points.map((p) => ({ ...p, day: addDays(range.to, p.step) })) },
    findings: findings({
      label: selected.resourceName,
      unit: selected.unit,
      change,
      topGroup: top && byDepartment.length > 1 && selected.total > 0 ? { name: top.name, share: (top.total / selected.total) * 100 } : null,
      anomalyDays: band.anomalyDays,
    }),
  } as const;
}

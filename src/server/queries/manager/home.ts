import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { machineWhere, ownedWhere, usageWhere } from "@/server/scope";
import { anomalyBand, dailyTotals, dataQuality, dayList, pctChange, previousRange, sumByResourceUnit } from "@/server/domain/analytics";
import { loadUsageRows, sortGroups, type Range, loadPreviousRows } from "./common";

const TOP_MACHINES = 5;

export async function getHome(user: CurrentUser, range: Range) {
  const prev = previousRange(range.from, range.to);
  const [rows, prevRows, activeMachines, openAlerts, openAlertCount, recent] = await Promise.all([
    loadUsageRows(user, range.from, range.to),
    loadPreviousRows(user, prev),
    db.machine.count({ where: { ...machineWhere(user), status: "ACTIVE" } }),
    db.alert.findMany({
      where: { ...ownedWhere(user), status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      orderBy: [{ triggeredAt: "desc" }],
      take: 5,
      select: { alertId: true, title: true, severity: true, status: true, triggeredAt: true, machine: { select: { machineName: true } } },
    }),
    db.alert.count({ where: { ...ownedWhere(user), status: "OPEN" } }),
    db.resourceUsage.findMany({
      where: usageWhere(user),
      orderBy: { usageAt: "desc" },
      take: 5,
      select: {
        usageId: true, usageAt: true, quantity: true, sourceType: true,
        resourceType: { select: { resourceCode: true, resourceName: true } }, unit: { select: { symbol: true } },
        machine: { select: { machineName: true } }, checkpoint: { select: { checkpointName: true } },
      },
    }),
  ]);

  const elec = (r: { resourceCode: string; unit: string }) => r.resourceCode === "ELECTRICITY" && r.unit === "kWh";
  const sum = (xs: { quantity: number }[]) => xs.reduce((a, x) => a + x.quantity, 0);
  const carbon = (xs: typeof rows) => xs.reduce((a, x) => a + (x.carbon?.kg ?? 0), 0);
  const elecRows = rows.filter(elec);
  const elecNow = sum(elecRows), elecPrev = sum(prevRows.filter(elec));
  const carbonNow = carbon(rows), carbonPrev = carbon(prevRows);

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

  return {
    elec: { total: elecNow, change: pctChange(elecNow, elecPrev) },
    carbon: { total: carbonNow, change: pctChange(carbonNow, carbonPrev) },
    activeMachines,
    machinesWithData: new Set(rows.map((r) => r.machineId).filter(Boolean)).size,
    anomalyDays: band.anomalyDays,
    stacked: { days: daily, machines: top, hasOther },
    resources,
    openAlerts,
    openAlertCount,
    recent: recent.map((r) => ({
      id: String(r.usageId),
      usageAt: r.usageAt,
      quantity: Number(r.quantity),
      resourceCode: r.resourceType.resourceCode,
      resourceName: r.resourceType.resourceName,
      unit: r.unit.symbol,
      source: r.sourceType,
      target: r.machine?.machineName ?? r.checkpoint?.checkpointName ?? "—",
    })),
    quality: dataQuality(rows),
    records: rows.length,
    qrCount: rows.filter((r) => r.sourceType === "QR").length,
  };
}

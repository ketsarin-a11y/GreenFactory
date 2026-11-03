import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { machineWhere, ownedWhere, usageWhere } from "@/server/scope";
import { addDays, bkkDay } from "@/lib/time";
import { sumByResourceUnit, dailyTotals, dayList } from "@/server/domain/analytics";
import { latestDataDay, loadUsageRows, sortGroups } from "./common";

const OPEN = { in: ["OPEN", "ACKNOWLEDGED"] };

/** NORMAL / WARNING / MAINTENANCE / STOPPED / ERROR (legacy OFFLINE → STOPPED, CRITICAL → ERROR). */
export const normMachineStatus = (s: string) => ({ OFFLINE: "STOPPED", CRITICAL: "ERROR" })[s] ?? s;

/** company spec §5: INACTIVE → MAINTENANCE; latest reading not VALID → FAULT; recent connection → ONLINE; else OFFLINE. */
export function connectionStatus(s: { status: string; lastConnectedAt: Date | null; samplingIntervalSeconds: number | null }, latestQuality: string | null, now = new Date()) {
  if (s.status === "INACTIVE") return "MAINTENANCE";
  if (latestQuality && latestQuality !== "VALID") return "FAULT";
  const windowS = s.samplingIntervalSeconds ? Math.max(s.samplingIntervalSeconds * 3, 300) : 900;
  if (s.lastConnectedAt && now.getTime() - s.lastConnectedAt.getTime() <= windowS * 1000) return "ONLINE";
  return "OFFLINE";
}

export async function getMachines(user: CurrentUser, f: { q?: string; status?: string; department?: number }) {
  const where = {
    ...machineWhere(user),
    status: "ACTIVE",
    ...(f.status ? { operationalStatus: f.status === "STOPPED" ? { in: ["STOPPED", "OFFLINE"] } : f.status === "ERROR" ? { in: ["ERROR", "CRITICAL"] } : f.status } : {}),
    ...(f.department ? { productionLine: { departmentId: f.department } } : {}),
    ...(f.q ? { OR: [{ machineCode: { contains: f.q } }, { machineName: { contains: f.q } }] } : {}),
  };
  const [machines, last] = await Promise.all([
    db.machine.findMany({
      where,
      orderBy: { machineCode: "asc" },
      select: {
        machineId: true, machineCode: true, machineName: true, operationalStatus: true,
        machineType: { select: { machineTypeName: true } },
        productionLine: { select: { lineName: true, department: { select: { departmentName: true } } } },
        _count: { select: { sensors: { where: { status: "ACTIVE" } }, qrCodes: { where: { qrStatus: "ACTIVE" } }, alerts: { where: { status: OPEN } } } },
      },
    }),
    db.resourceUsage.groupBy({ by: ["machineId"], where: { ...usageWhere(user), machineId: { not: null } }, _max: { usageAt: true }, _count: true }),
  ]);
  const lastBy = new Map(last.map((l) => [l.machineId, l]));
  const rows = machines.map((m) => ({
    id: m.machineId, code: m.machineCode, name: m.machineName, type: m.machineType.machineTypeName,
    line: m.productionLine.lineName, department: m.productionLine.department.departmentName,
    status: normMachineStatus(m.operationalStatus),
    sensors: m._count.sensors, qr: m._count.qrCodes, openAlerts: m._count.alerts,
    lastReading: lastBy.get(m.machineId)?._max.usageAt ?? null, usages: lastBy.get(m.machineId)?._count ?? 0,
  }));
  return {
    rows,
    summary: {
      total: rows.length,
      withSensor: rows.filter((r) => r.sensors > 0).length,
      withQr: rows.filter((r) => r.qr > 0).length,
      withAlert: rows.filter((r) => r.openAlerts > 0).length,
      noData: rows.filter((r) => !r.lastReading).length,
    },
  };
}

export async function getMachine(user: CurrentUser, id: number) {
  const m = await db.machine.findFirst({
    where: { machineId: id, ...machineWhere(user) },
    include: {
      machineType: true,
      productionLine: { include: { department: { include: { building: { include: { factory: true } } } } } },
      sensors: { orderBy: { sensorCode: "asc" }, include: { sensorType: true, data: { orderBy: { measuredAt: "desc" }, take: 1, include: { unit: true } } } },
      qrCodes: { orderBy: { generatedAt: "desc" } },
      alerts: { where: ownedWhere(user), orderBy: { triggeredAt: "desc" }, take: 8 },
    },
  });
  if (!m) return null;
  const to = (await latestDataDay(user)) ?? bkkDay(new Date());
  const from = addDays(to, -29);
  const [rows, recent, usageCount] = await Promise.all([
    loadUsageRows(user, from, to, { machineId: id }),
    db.resourceUsage.findMany({
      where: { ...usageWhere(user), machineId: id },
      orderBy: { usageAt: "desc" },
      take: 12,
      select: { usageId: true, usageReference: true, usageAt: true, quantity: true, sourceType: true, resourceType: { select: { resourceCode: true, resourceName: true } }, unit: { select: { symbol: true } } },
    }),
    db.resourceUsage.count({ where: { ...usageWhere(user), machineId: id } }),
  ]);
  const days = dayList(from, to);
  const trends = sortGroups(sumByResourceUnit(rows)).map((g) => {
    const t = dailyTotals(rows.filter((r) => r.resourceCode === g.resourceCode && r.unit === g.unit), g.unit);
    return { ...g, days: days.map((day) => ({ day, value: t.get(day) ?? null })) };
  });
  const now = new Date();
  return {
    machine: m,
    from,
    to,
    trends,
    usageCount,
    recent: recent.map((r) => ({ ...r, usageId: String(r.usageId), quantity: Number(r.quantity) })),
    sensors: m.sensors.map((s) => {
      const d = s.data[0];
      return {
        id: s.sensorId, code: s.sensorCode, name: s.sensorName, type: s.sensorType.sensorTypeName, protocol: s.protocol,
        connection: connectionStatus(s, d?.qualityStatus ?? null, now),
        latest: d ? { value: Number(d.processedValue ?? d.rawValue), unit: d.unit.symbol, at: d.measuredAt, quality: d.qualityStatus } : null,
      };
    }),
  };
}

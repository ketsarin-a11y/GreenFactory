import "server-only";
import { db } from "@/server/db";
import { machineWhere, sensorWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { sensorConnection, type Connection } from "@/server/domain/readiness";
import type { Prisma } from "@/generated/prisma/client";

/** Sensors with their latest reading and connection status (spec §5 rule). */
export async function sensorsWithStatus(user: CurrentUser, where: Prisma.SensorWhereInput = {}) {
  const rows = await db.sensor.findMany({
    where: { AND: [sensorWhere(user), where] },
    orderBy: [{ machine: { machineCode: "asc" } }, { sensorCode: "asc" }],
    include: {
      sensorType: { select: { sensorTypeName: true } },
      machine: { select: { machineCode: true, machineName: true, productionLine: { select: { department: { select: { building: { select: { factory: { select: { factoryName: true } } } } } } } } } },
      data: { orderBy: { measuredAt: "desc" }, take: 1, include: { unit: { select: { symbol: true } } } },
    },
  });
  const now = new Date();
  return rows.map((s) => {
    const latest = s.data[0] ?? null;
    const connection: Connection = sensorConnection(
      { status: s.status, samplingIntervalSeconds: s.samplingIntervalSeconds, lastConnectedAt: s.lastConnectedAt, latestQuality: latest?.qualityStatus ?? null },
      now,
    );
    return { ...s, latest, connection };
  });
}

export function connectionSummary(list: { connection: Connection }[]) {
  const c = { total: list.length, ONLINE: 0, OFFLINE: 0, FAULT: 0, MAINTENANCE: 0 };
  for (const s of list) c[s.connection]++;
  return c;
}

/** Flat machine list, ACTIVE first, for sensor forms and filters. */
export const machineOptions = async (user: CurrentUser) =>
  (await db.machine.findMany({ where: machineWhere(user), orderBy: [{ status: "asc" }, { machineCode: "asc" }], select: { machineId: true, machineCode: true, machineName: true, status: true } }))
    .map((m) => ({ value: String(m.machineId), label: `${m.machineCode} · ${m.machineName}`, inactive: m.status !== "ACTIVE" }));

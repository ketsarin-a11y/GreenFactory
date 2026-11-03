import "server-only";
import { db } from "@/server/db";
import { machineWhere, sensorWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { sensorConnection, type Connection } from "@/server/domain/readiness";
import type { Prisma } from "@/generated/prisma/client";
import { num } from "@/lib/format";

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
    .map((m) => ({ value: String(m.machineId), label: `${m.machineCode} ${m.machineName}`, inactive: m.status !== "ACTIVE" }));

const BUCKET_MS = 10 * 60_000;

/**
 * One sensor's last 24 h as 10-minute averages (null = no reading in that bucket), in the
 * unit of its latest reading. Returns null when the sensor is outside the user's company.
 */
export async function sensorReadings24h(user: CurrentUser, sensorId: number, now = new Date()) {
  const sensor = await db.sensor.findFirst({ where: { sensorId, ...sensorWhere(user) }, select: { sensorId: true } });
  if (!sensor) return null;
  const since = new Date(now.getTime() - 24 * 3600_000);
  const rows = await db.sensorData.findMany({
    where: { sensorId, measuredAt: { gte: since, lte: now } },
    orderBy: { measuredAt: "asc" },
    select: { rawValue: true, processedValue: true, qualityStatus: true, measuredAt: true, unit: { select: { symbol: true } } },
  });
  const unit = rows.at(-1)?.unit.symbol ?? null;
  const start = Math.floor(since.getTime() / BUCKET_MS) * BUCKET_MS;
  const n = Math.ceil((now.getTime() - start) / BUCKET_MS);
  const sum = new Array<number>(n).fill(0), cnt = new Array<number>(n).fill(0);
  let min = Infinity, max = -Infinity;
  for (const r of rows) {
    if (r.unit.symbol !== unit || r.qualityStatus !== "VALID") continue;
    const v = num(r.processedValue ?? r.rawValue);
    const i = Math.min(n - 1, Math.floor((r.measuredAt.getTime() - start) / BUCKET_MS));
    sum[i] += v; cnt[i]++;
    min = Math.min(min, v); max = Math.max(max, v);
  }
  const last = rows.at(-1);
  return {
    unit,
    points: sum.map((s, i) => ({ at: new Date(start + i * BUCKET_MS).toISOString(), value: cnt[i] ? s / cnt[i] : null })),
    count: rows.length,
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
    latest: last ? { value: num(last.processedValue ?? last.rawValue), unit: last.unit.symbol, quality: last.qualityStatus, measuredAt: last.measuredAt.toISOString() } : null,
  };
}
export type SensorReadings = NonNullable<Awaited<ReturnType<typeof sensorReadings24h>>>;

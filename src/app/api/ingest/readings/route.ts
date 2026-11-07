import { createHash } from "node:crypto";
import { db } from "@/server/db";
import { ingestBody, measuredAtProblem } from "@/server/domain/ingest";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const json = (status: number, body: unknown) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Device endpoint: `POST /api/ingest/readings` with `Authorization: Bearer <sensor token>`.
 * Body: `{ "value": 42.1, "unit": "KW" }` or `{ "readings": [{ value, measuredAt, unit, quality }] }`.
 * The token identifies exactly one sensor; the sensor, its machine and its company must be ACTIVE.
 */
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(\S{20,200})$/i)?.[1];
  if (!token) return json(401, { error: "missing bearer token" });

  const sensor = await db.sensor.findUnique({
    where: { ingestTokenHash: sha256(token) },
    include: {
      machine: { select: { status: true, productionLine: { select: { department: { select: { building: { select: { factory: { select: { status: true, company: { select: { status: true } } } } } } } } } } } },
      data: { orderBy: { measuredAt: "desc" }, take: 1, select: { unitId: true } },
    },
  });
  const factory = sensor?.machine.productionLine.department.building.factory;
  if (!sensor || sensor.status !== "ACTIVE" || sensor.machine.status !== "ACTIVE" || factory?.status !== "ACTIVE" || factory.company.status !== "ACTIVE")
    return json(401, { error: "invalid or inactive sensor token" });

  const parsed = ingestBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json(400, { error: "invalid body", issues: parsed.error.issues.slice(0, 5).map((i) => i.message) });

  const now = new Date();
  const units = new Map((await db.unit.findMany({ where: { status: "ACTIVE" }, select: { unitId: true, unitCode: true } })).map((u) => [u.unitCode, u.unitId]));
  const rows = [];
  for (const [i, r] of parsed.data.readings.entries()) {
    const at = r.measuredAt ? new Date(r.measuredAt) : now;
    const problem = measuredAtProblem(at, now);
    if (problem) return json(422, { error: `readings[${i}]: ${problem}` });
    const unitId = r.unit ? units.get(r.unit) : sensor.data[0]?.unitId;
    if (!unitId) return json(422, { error: `readings[${i}]: unknown unit${r.unit ? ` ${r.unit}` : " (send unit on the first reading)"}` });
    rows.push({ sensorId: sensor.sensorId, unitId, rawValue: r.value, processedValue: r.value, qualityStatus: r.quality, measuredAt: at, receivedAt: now });
  }
  await db.$transaction([
    db.sensorData.createMany({ data: rows }),
    db.sensor.update({ where: { sensorId: sensor.sensorId }, data: { lastConnectedAt: now } }),
  ]);
  return json(202, { accepted: rows.length });
}

import { db } from "@/server/db";

/**
 * Demo deployments only (NEXT_PUBLIC_DEMO_MODE=true): records one reading per demo sensor so the
 * live dashboards stay "online" without field devices. Vercel Cron calls it with
 * `Authorization: Bearer $CRON_SECRET`; real devices use POST /api/ingest/readings instead.
 */
export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return new Response("demo mode off", { status: 404 });
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("unauthorized", { status: 401 });

  const skip = new Set((process.env.SIM_SKIP ?? "PM-CHL01").split(",")); // one stays offline on purpose
  const sensors = await db.sensor.findMany({
    where: { status: "ACTIVE", data: { some: {} } },
    select: { sensorId: true, sensorCode: true, data: { orderBy: { measuredAt: "desc" }, take: 20, select: { unitId: true, processedValue: true, rawValue: true } } },
  });
  const now = new Date();
  let n = 0;
  for (const s of sensors) {
    if (skip.has(s.sensorCode) || s.data.length === 0) continue;
    const vals = s.data.map((d) => Number(d.processedValue ?? d.rawValue));
    const v = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * (1 + (Math.random() * 2 - 1) * 0.04) * 100) / 100;
    await db.$transaction([
      db.sensorData.create({ data: { sensorId: s.sensorId, unitId: s.data[0].unitId, rawValue: v, processedValue: v, measuredAt: now, receivedAt: now } }),
      db.sensor.update({ where: { sensorId: s.sensorId }, data: { lastConnectedAt: now } }),
    ]);
    n++;
  }
  return Response.json({ recorded: n });
}

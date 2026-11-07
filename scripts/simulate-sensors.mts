// Dev/demo helper: acts like the field devices. Issues a fresh token for every ACTIVE sensor
// that has readings, then POSTs a reading per sensor to /api/ingest/readings every 15 s.
//   npm run sim:sensors            (needs `npm run dev` running)
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../prisma/seed/client";

if (process.env.NODE_ENV === "production") throw new Error("dev only");
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SKIP = new Set((process.env.SIM_SKIP ?? "PM-CHL01").split(","));  // keep one offline for the demo

const sensors = await prisma.sensor.findMany({
  where: { status: "ACTIVE", data: { some: {} } },
  include: { data: { orderBy: { measuredAt: "desc" }, take: 20, include: { unit: true } } },
});
const devices: { code: string; token: string; unit: string; mean: number }[] = [];
for (const s of sensors) {
  if (SKIP.has(s.sensorCode)) continue;
  const token = `gfs_${randomBytes(24).toString("base64url")}`;
  await prisma.sensor.update({ where: { sensorId: s.sensorId }, data: { ingestTokenHash: createHash("sha256").update(token).digest("hex") } });
  const vals = s.data.map((d) => Number(d.processedValue ?? d.rawValue));
  devices.push({ code: s.sensorCode, token, unit: s.data[0].unit.unitCode, mean: vals.reduce((a, b) => a + b, 0) / vals.length });
}
await prisma.$disconnect();
console.log(`Simulating ${devices.length} sensors → ${BASE}/api/ingest/readings (Ctrl+C to stop)`);

async function tick() {
  for (const d of devices) {
    const value = Math.round(d.mean * (1 + (Math.random() * 2 - 1) * 0.04) * 100) / 100;
    const res = await fetch(`${BASE}/api/ingest/readings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${d.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ value, unit: d.unit }),
    }).catch((e: Error) => ({ ok: false, status: 0, text: async () => e.message }));
    if (!res.ok) console.error(d.code, res.status, await res.text());
  }
  process.stdout.write(".");
}
await tick();
setInterval(tick, 15_000);

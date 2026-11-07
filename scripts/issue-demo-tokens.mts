// Issues device tokens for the demo sensors in the database pointed to by DATABASE_URL and prints
// them as JSON for the DEMO_SENSOR_TOKENS GitHub secret (used by .github/workflows/demo-sensors.yml).
//   DATABASE_URL=... npx tsx scripts/issue-demo-tokens.mts > tokens.json
// Running it again replaces the tokens (old ones stop working).
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../prisma/seed/client";

const SKIP = new Set((process.env.SIM_SKIP ?? "PM-CHL01").split(",")); // keep one offline for the demo
const sensors = await prisma.sensor.findMany({
  where: { status: "ACTIVE", data: { some: {} } },
  include: { data: { orderBy: { measuredAt: "desc" }, take: 20, include: { unit: true } } },
});
const out: { code: string; token: string; unit: string; mean: number }[] = [];
for (const s of sensors) {
  if (SKIP.has(s.sensorCode)) continue;
  const token = `gfs_${randomBytes(24).toString("base64url")}`;
  await prisma.sensor.update({ where: { sensorId: s.sensorId }, data: { ingestTokenHash: createHash("sha256").update(token).digest("hex") } });
  const vals = s.data.map((d) => Number(d.processedValue ?? d.rawValue));
  out.push({ code: s.sensorCode, token, unit: s.data[0].unit.unitCode, mean: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 });
}
await prisma.$disconnect();
process.stdout.write(JSON.stringify(out));

// Posts one reading per demo sensor to the live ingest API. No dependencies (plain Node 20+),
// so the scheduled workflow doesn't need `npm ci`.
//   APP_URL=https://... DEMO_SENSOR_TOKENS='[...]' node scripts/post-demo-readings.mjs
const base = process.env.APP_URL;
const devices = JSON.parse(process.env.DEMO_SENSOR_TOKENS || "[]");
if (!base || devices.length === 0) {
  console.log("APP_URL or DEMO_SENSOR_TOKENS not set; nothing to do.");
  process.exit(0);
}
let failed = 0;
for (const d of devices) {
  const value = Math.round(d.mean * (1 + (Math.random() * 2 - 1) * 0.04) * 100) / 100;
  const res = await fetch(`${base.replace(/\/$/, "")}/api/ingest/readings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${d.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value, unit: d.unit }),
  });
  if (!res.ok) { failed++; console.error(d.code, res.status, await res.text()); }
}
console.log(`posted ${devices.length - failed}/${devices.length} readings`);
process.exit(failed ? 1 : 0);

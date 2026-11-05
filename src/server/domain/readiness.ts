/**
 * Setup-readiness scores for the company admin (legacy formulas, spec company.md §1, §2, §4)
 * and the sensor connection rule (§5). Pure functions — no DB, no clock unless passed in.
 */

/** Whole-percent share; 0 when there is nothing to measure. */
export const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);
const clamp = (n: number) => Math.min(100, Math.max(0, n));

type Structure = { buildings: number; departments: number; lines: number };

/** 100 when building + department + line exist, 60 with only a building, else 20. */
export function structureScore(s: Structure) {
  if (s.buildings > 0 && s.departments > 0 && s.lines > 0) return 100;
  return s.buildings > 0 ? 60 : 20;
}

/** Dashboard readiness of one factory: structure 35%, sensor coverage 35%, QR coverage 30%. */
export function factoryReadiness(s: Structure & { machines: number; machinesWithSensor: number; machinesWithQr: number }) {
  return clamp(
    Math.round(structureScore(s) * 0.35 + pct(s.machinesWithSensor, s.machines) * 0.35 + pct(s.machinesWithQr, s.machines) * 0.3),
  );
}

export type CompanyCounts = Structure & {
  factories: number;
  users: number;
  activeUsers: number;
  machines: number;
  activeMachines: number;
  machinesWithSensor: number;
  machinesWithQr: number;
};

/** Company readiness with its weighted parts so the UI can explain the score. */
export function companyReadiness(c: CompanyCounts) {
  const organization = c.factories > 0 && c.buildings > 0 && c.departments > 0 && c.lines > 0 ? 100 : c.factories > 0 ? 65 : 20;
  const parts = [
    { key: "organization", label: "โครงสร้างองค์กร", weight: 0.25, score: organization },
    { key: "users", label: "บัญชีผู้ใช้ที่ใช้งานอยู่", weight: 0.2, score: pct(c.activeUsers, c.users) },
    { key: "assets", label: "เครื่องจักรที่เปิดใช้งาน", weight: 0.2, score: pct(c.activeMachines, c.machines) },
    { key: "sensors", label: "เครื่องจักรที่มีเซนเซอร์", weight: 0.2, score: pct(c.machinesWithSensor, c.activeMachines) },
    { key: "qr", label: "เครื่องจักรที่มี QR Code", weight: 0.15, score: pct(c.machinesWithQr, c.activeMachines) },
  ];
  return { score: clamp(Math.round(parts.reduce((a, p) => a + p.score * p.weight, 0))), parts };
}

type Check = { label: string; ok: boolean };
const score = (checks: Check[]) => ({ checks, score: pct(checks.filter((c) => c.ok).length, checks.length) });
const has = (v: unknown) => v !== null && v !== undefined && String(v).trim() !== "";

/** Factory profile completeness: 9 checks (spec §2). */
export function factoryProfile(f: {
  code: string | null; name: string | null; address: string | null; province: string | null; phone: string | null; email: string | null;
  latitude: unknown; longitude: unknown; googleMapUrl: string | null; buildings: number; departments: number; lines: number;
}) {
  return score([
    { label: "รหัสโรงงาน", ok: has(f.code) },
    { label: "ชื่อโรงงาน", ok: has(f.name) },
    { label: "ที่อยู่", ok: has(f.address) },
    { label: "จังหวัด", ok: has(f.province) },
    { label: "โทรศัพท์หรืออีเมล", ok: has(f.phone) || has(f.email) },
    { label: "พิกัดหรือลิงก์แผนที่", ok: (has(f.latitude) && has(f.longitude)) || has(f.googleMapUrl) },
    { label: "มีอาคาร", ok: f.buildings > 0 },
    { label: "มีแผนก", ok: f.departments > 0 },
    { label: "มีสายการผลิต", ok: f.lines > 0 },
  ]);
}

/** Machine profile completeness: 11 checks (spec §4). */
export function machineProfile(m: {
  code: string | null; name: string | null; typeId: number | null; lineId: number | null; manufacturer: string | null; model: string | null;
  serialNumber: string | null; installationDate: Date | null; locationNote: string | null; sensors: number; qrCodes: number;
}) {
  return score([
    { label: "รหัสเครื่อง", ok: has(m.code) },
    { label: "ชื่อเครื่อง", ok: has(m.name) },
    { label: "ประเภทเครื่อง", ok: m.typeId !== null },
    { label: "สายการผลิต", ok: m.lineId !== null },
    { label: "ผู้ผลิต", ok: has(m.manufacturer) },
    { label: "รุ่น", ok: has(m.model) },
    { label: "หมายเลขเครื่อง", ok: has(m.serialNumber) },
    { label: "วันที่ติดตั้ง", ok: m.installationDate !== null },
    { label: "ตำแหน่งติดตั้ง", ok: has(m.locationNote) },
    { label: "มีเซนเซอร์", ok: m.sensors > 0 },
    { label: "มี QR Code", ok: m.qrCodes > 0 },
  ]);
}

export type Connection = "ONLINE" | "OFFLINE" | "FAULT" | "MAINTENANCE";

/**
 * INACTIVE → MAINTENANCE; latest reading not VALID → FAULT; heard from within
 * max(interval × 3, 300 s) (900 s when no interval) → ONLINE; otherwise OFFLINE.
 */
export function sensorConnection(
  s: { status: string; samplingIntervalSeconds: number | null; lastConnectedAt: Date | null; latestQuality: string | null },
  now: Date,
): Connection {
  if (s.status !== "ACTIVE") return "MAINTENANCE";
  if (s.latestQuality !== null && s.latestQuality !== "VALID") return "FAULT";
  if (!s.lastConnectedAt) return "OFFLINE";
  const windowSec = s.samplingIntervalSeconds && s.samplingIntervalSeconds > 0 ? Math.max(s.samplingIntervalSeconds * 3, 300) : 900;
  return now.getTime() - s.lastConnectedAt.getTime() <= windowSec * 1000 ? "ONLINE" : "OFFLINE";
}

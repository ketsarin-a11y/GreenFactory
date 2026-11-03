// Fictional demo tenants. Every figure here is generated — never real customer data.
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./client";
import { processUsage } from "../../src/server/domain/process-usage";
import { evaluateKpi, periodBounds } from "../../src/server/domain/kpi";
import { addDays, bkkDay, endOfBkkDayExclusive, startOfBkkDay } from "../../src/lib/time";

const PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "Demo1234";

// Deterministic PRNG so every seed run produces the same demo.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20261103);
const jitter = (pct: number) => 1 + (rand() * 2 - 1) * pct;

const roleIds = new Map<string, number>();
const roleId = async (name: string) => {
  if (!roleIds.has(name)) roleIds.set(name, (await prisma.role.findUniqueOrThrow({ where: { roleName: name } })).roleId);
  return roleIds.get(name)!;
};
const resource = (code: string) => prisma.resourceTypeMaster.findUniqueOrThrow({ where: { resourceCode: code } });
const unit = (code: string) => prisma.unit.findUniqueOrThrow({ where: { unitCode: code } });

type UserDef = { email: string; username: string; firstName: string; lastName: string; role: string; employeeCode?: string; phone?: string; department?: string; factory?: string };
type MachineDef = { line: string; code: string; name: string; type: string; manufacturer: string; model: string; status?: string };
type SeriesDef = { target: string; resource: string; base: number; weekendFactor: number; noise: number; trendPct: number; mondaysOnly?: boolean; recorder: string; anomalies?: Record<number, number> };
type SensorDef = { machine: string; code: string; name: string; type: string; unit: string; value: number; noise: number; offlineHours?: number };
type PlantDef = {
  code: string; name: string; province: string; address: string; postalCode: string; lat: number; lng: number;
  buildings: { code: string; name: string; type: string; floors: number; departments: { code: string; name: string; lines: { code: string; name: string }[] }[] }[];
  machines: MachineDef[];
  checkpoints: { line: string; code: string; name: string; type: string }[];
  sensors: SensorDef[];
  series: SeriesDef[];
  kpis: { code: string; name: string; type: string; period: string; target: number; resource: string; machine?: string }[];
};
type CompanyDef = {
  code: string; name: string; industry: string; province: string; plan: string; status: string; email: string; phone: string; address: string; postalCode: string;
  days: number; users: UserDef[]; plants: PlantDef[];
};

async function seedCompany(def: CompanyDef, passwordHash: string) {
  const company = await prisma.company.create({
    data: {
      companyCode: def.code, companyName: def.name, industryType: def.industry, address: def.address, province: def.province, postalCode: def.postalCode,
      country: "Thailand", phone: def.phone, email: def.email, subscriptionPlan: def.plan, carbonStandard: "TGO", timezone: "Asia/Bangkok", currency: "THB", language: "th", status: def.status,
    },
  });
  const users = new Map<string, number>();
  const lines = new Map<string, { lineId: number; departmentId: number; buildingId: number; factoryId: number }>();
  const machines = new Map<string, { machineId: number; lineId: number }>();
  const checkpoints = new Map<string, { checkpointId: number; lineId: number }>();
  const qrOf = new Map<string, bigint>();
  const factories = new Map<string, number>();
  const departments = new Map<string, number>();

  for (const p of def.plants) {
    const f = await prisma.factory.create({
      data: { companyId: company.companyId, factoryCode: p.code, factoryName: p.name, address: p.address, province: p.province, postalCode: p.postalCode, country: "Thailand", latitude: p.lat, longitude: p.lng, mapZoom: 16, timezone: "Asia/Bangkok", phone: def.phone, email: def.email },
    });
    factories.set(p.code, f.factoryId);
    for (const b of p.buildings) {
      const bd = await prisma.building.create({ data: { factoryId: f.factoryId, buildingCode: b.code, buildingName: b.name, buildingType: b.type, floorCount: b.floors } });
      for (const d of b.departments) {
        const dp = await prisma.department.create({ data: { buildingId: bd.buildingId, departmentCode: d.code, departmentName: d.name } });
        departments.set(`${p.code}:${d.code}`, dp.departmentId);
        for (const l of d.lines) {
          const ln = await prisma.productionLine.create({ data: { departmentId: dp.departmentId, lineCode: l.code, lineName: l.name } });
          lines.set(`${p.code}:${l.code}`, { lineId: ln.lineId, departmentId: dp.departmentId, buildingId: bd.buildingId, factoryId: f.factoryId });
        }
      }
    }
    for (const m of p.machines) {
      const line = lines.get(`${p.code}:${m.line}`)!;
      const mt = await prisma.machineType.findUniqueOrThrow({ where: { machineTypeCode: m.type } });
      const mc = await prisma.machine.create({
        data: {
          lineId: line.lineId, machineTypeId: mt.machineTypeId, machineCode: m.code, machineName: m.name, manufacturer: m.manufacturer, model: m.model,
          serialNumber: `SN-${p.code}-${m.code}`, installationDate: new Date("2022-03-15"), locationNote: mt.machineTypeCode.match(/COMPRESSOR|CHILLER|GENERATOR|DI_|RO_|WWTP|BOILER|COOLING/) ? "ห้องเครื่องสาธารณูปโภค" : "พื้นที่ผลิต",
          operationalStatus: m.status ?? "NORMAL",
        },
      });
      machines.set(`${p.code}:${m.code}`, { machineId: mc.machineId, lineId: line.lineId });
      const qr = await prisma.qRCode.create({ data: { machineId: mc.machineId, qrCode: `QR-${p.code}-${m.code}`, qrToken: randomUUID() } });
      qrOf.set(`${p.code}:${m.code}`, qr.qrId);
    }
    for (const c of p.checkpoints) {
      const line = lines.get(`${p.code}:${c.line}`)!;
      const cp = await prisma.checkpoint.create({ data: { lineId: line.lineId, checkpointCode: c.code, checkpointName: c.name, checkpointType: c.type } });
      checkpoints.set(`${p.code}:${c.code}`, { checkpointId: cp.checkpointId, lineId: line.lineId });
      const qr = await prisma.qRCode.create({ data: { checkpointId: cp.checkpointId, qrCode: `QR-${p.code}-${c.code}`, qrToken: randomUUID() } });
      qrOf.set(`${p.code}:${c.code}`, qr.qrId);
    }
  }

  for (const u of def.users) {
    const { role, department, factory, ...rest } = u;
    const plant = factory ?? def.plants[0].code;
    const created = await prisma.user.create({
      data: {
        ...rest, roleId: await roleId(role), passwordHash, passwordChangedAt: new Date(), companyId: company.companyId,
        factoryId: role === "COMPANY_ADMIN" ? null : factories.get(plant),
        departmentId: department ? departments.get(`${plant}:${department}`) : null,
      },
    });
    users.set(u.email, created.userId);
  }

  // ---------- Sensors + 48h of readings at 15 min ----------
  const now = new Date();
  for (const p of def.plants) {
    for (const s of p.sensors) {
      const m = machines.get(`${p.code}:${s.machine}`)!;
      const st = await prisma.sensorType.findUniqueOrThrow({ where: { sensorTypeCode: s.type } });
      const lastAt = new Date(now.getTime() - (s.offlineHours ?? 0) * 3600_000);
      const sensor = await prisma.sensor.create({
        data: {
          machineId: m.machineId, sensorTypeId: st.sensorTypeId, sensorCode: s.code, sensorName: s.name, manufacturer: "Schneider Electric", protocol: "MQTT",
          dataTopic: `${def.code.toLowerCase()}/${p.code.toLowerCase()}/${s.code.toLowerCase()}`, samplingIntervalSeconds: 60, lastConnectedAt: lastAt,
          installationDate: new Date("2023-01-10"), lastCalibrationDate: new Date("2026-05-01"), nextCalibrationDate: new Date("2027-05-01"),
        },
      });
      const u = await unit(s.unit);
      const rows = [];
      for (let t = lastAt.getTime() - 48 * 3600_000; t <= lastAt.getTime(); t += 15 * 60_000) {
        const hour = new Date(t + 7 * 3600_000).getUTCHours();
        const shift = s.type === "TEMPERATURE" || s.type === "PRESSURE" ? 1 : hour >= 8 && hour < 20 ? 1 : 0.45;
        const v = Math.round(s.value * shift * jitter(s.noise) * 100) / 100;
        rows.push({ sensorId: sensor.sensorId, unitId: u.unitId, rawValue: v, processedValue: v, measuredAt: new Date(t), receivedAt: new Date(t) });
      }
      await prisma.sensorData.createMany({ data: rows });
    }
  }

  // ---------- Daily meter readings ----------
  const today = bkkDay(now);
  const firstDay = addDays(today, -(def.days - 1));
  const lookups = new Map<string, { resourceTypeId: number; unitId: number }>();
  const usageIds: bigint[] = [];
  for (const p of def.plants) {
    for (const s of p.series) {
      if (!lookups.has(s.resource)) {
        const rt = await resource(s.resource);
        lookups.set(s.resource, { resourceTypeId: rt.resourceTypeId, unitId: rt.defaultUnitId });
      }
      const m = machines.get(`${p.code}:${s.target}`);
      const c = checkpoints.get(`${p.code}:${s.target}`);
      const line = [...lines.values()].find((l) => l.lineId === (m ?? c)!.lineId)!;
      const recorder = users.get(s.recorder)!;
      const { resourceTypeId, unitId } = lookups.get(s.resource)!;
      for (let i = 0; i < def.days; i++) {
        const day = addDays(firstDay, i);
        const daysAgo = def.days - 1 - i;
        const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
        const weekend = dow === 0 || dow === 6;
        if (s.mondaysOnly && dow !== 1) continue;
        if (weekend && s.weekendFactor === 0) continue;
        let qty = s.base * (weekend ? s.weekendFactor : 1) * (1 + s.trendPct * (i / (def.days - 1))) * jitter(s.noise);
        qty *= s.anomalies?.[daysAgo] ?? 1;
        qty = Math.round(qty * 100) / 100;
        const usageAt = new Date(startOfBkkDay(day).getTime() + (7.5 + rand() * 1.5) * 3600_000);
        if (usageAt > now) continue;
        const viaQr = rand() < 0.78;
        const scan = viaQr
          ? await prisma.qRScanLog.create({ data: { qrId: qrOf.get(`${p.code}:${s.target}`)!, userId: recorder, scanResult: "SUCCESS", scannedAt: new Date(usageAt.getTime() - 60_000), device: "Mobile" } })
          : null;
        const u = await prisma.resourceUsage.create({
          data: {
            usageReference: `USG-${usageAt.getTime()}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`,
            companyId: company.companyId, factoryId: line.factoryId, buildingId: line.buildingId, departmentId: line.departmentId, lineId: line.lineId,
            machineId: m?.machineId ?? null, checkpointId: c?.checkpointId ?? null, resourceTypeId, unitId, qrScanId: scan?.scanId ?? null,
            scopeType: m ? "MACHINE" : "CHECKPOINT", quantity: qty, usageAt, sourceType: viaQr ? "QR" : "MANUAL", recordedBy: recorder, createdAt: usageAt,
          },
        });
        usageIds.push(u.usageId);
      }
    }
  }
  for (const id of usageIds) await processUsage(prisma, id);

  // Alerts older than 14 days were handled; acknowledge one recent one so all statuses show.
  const managerId = [...users.entries()].find(([e]) => e.startsWith("manager"))?.[1] ?? null;
  const cutoff = startOfBkkDay(addDays(today, -14));
  await prisma.alert.updateMany({ where: { companyId: company.companyId, triggeredAt: { lt: cutoff } }, data: { status: "RESOLVED", acknowledgedAt: cutoff, resolvedAt: cutoff, resolvedBy: managerId } });
  const oldestOpen = await prisma.alert.findFirst({ where: { companyId: company.companyId, status: "OPEN" }, orderBy: { triggeredAt: "asc" } });
  if (oldestOpen) await prisma.alert.update({ where: { alertId: oldestOpen.alertId }, data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date() } });

  // ---------- KPIs with results for closed periods ----------
  for (const p of def.plants) {
    for (const k of p.kpis) {
      const rt = await resource(k.resource);
      const resourceTypeId = rt.resourceTypeId, unitId = rt.defaultUnitId;
      const factoryId = factories.get(p.code)!;
      const machineId = k.machine ? machines.get(`${p.code}:${k.machine}`)!.machineId : undefined;
      const scope = { factoryId, ...(machineId ? { machineId } : {}) };
      const kpi = await prisma.kPI.create({
        data: { companyId: company.companyId, ...scope, resourceTypeId, unitId, kpiCode: k.code, kpiName: k.name, kpiType: k.type, scopeType: machineId ? "MACHINE" : "FACTORY", targetValue: k.target, targetOperator: "<=", periodType: k.period, effectiveFrom: new Date(`${firstDay}T00:00:00Z`) },
      });
      const seen = new Set<string>();
      for (let i = 0; i < def.days; i++) {
        const per = periodBounds(k.period, startOfBkkDay(addDays(firstDay, i)));
        if (seen.has(per.start) || per.end >= today || per.start < firstDay) continue;
        seen.add(per.start);
        const agg = await prisma.resourceUsage.aggregate({
          _sum: { quantity: true }, _count: true,
          where: { companyId: company.companyId, status: "ACTIVE", resourceTypeId, unitId, ...scope, usageAt: { gte: startOfBkkDay(per.start), lt: endOfBkkDayExclusive(per.end) } },
        });
        if (agg._count === 0) continue;
        const actual = Number(agg._sum.quantity ?? 0);
        const r = evaluateKpi(actual, k.target, "<=");
        await prisma.kPIResult.create({
          data: { kpiId: kpi.kpiId, actualValue: actual, varianceValue: r.variance, achievementPercent: r.achievement, periodStart: new Date(`${per.start}T00:00:00Z`), periodEnd: new Date(`${per.end}T00:00:00Z`), resultStatus: r.pass ? "PASS" : "FAIL" },
        });
      }
    }
  }

  // ---------- 30 days of login history ----------
  const logs = [];
  for (const [email, userId] of users) {
    for (let d = 30; d >= 0; d--) {
      if (rand() < 0.3) continue;
      const at = new Date(startOfBkkDay(addDays(today, -d)).getTime() + (7 + rand() * 3) * 3600_000);
      if (at > now) continue;
      if (rand() < 0.06) logs.push({ userId, attemptedEmail: email, loginAt: new Date(at.getTime() - 120_000), loginStatus: "FAILED", loginMethod: "PASSWORD", failureReason: "INVALID_CREDENTIALS", ipAddress: "10.20.1.15", userAgent: UA[Math.floor(rand() * UA.length)] });
      logs.push({ userId, attemptedEmail: email, loginAt: at, logoutAt: new Date(at.getTime() + (1 + rand() * 7) * 3600_000), loginStatus: "SUCCESS", loginMethod: "PASSWORD", ipAddress: `10.20.1.${10 + Math.floor(rand() * 40)}`, userAgent: UA[Math.floor(rand() * UA.length)] });
    }
  }
  await prisma.loginLog.createMany({ data: logs });
  for (const [, userId] of users) {
    const last = logs.filter((l) => l.userId === userId && l.loginStatus === "SUCCESS").at(-1);
    if (last) await prisma.user.update({ where: { userId }, data: { lastLogin: last.loginAt } });
  }
  return { company, users, usages: usageIds.length };
}

const UA = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (Linux; Android 15; SM-T636B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
];

const smt = (n: number) => ({ code: `SMT-L${n}`, name: `สายการผลิต SMT ${n}` });

const VOLTERA: CompanyDef = {
  code: "VOLTERA", name: "บริษัท วอลเทรา อิเล็กทรอนิกส์ จำกัด", industry: "การผลิตอุปกรณ์อิเล็กทรอนิกส์", province: "ชลบุรี", plan: "STANDARD", status: "ACTIVE",
  email: "contact@voltera.example", phone: "038-000-000", address: "700/123 นิคมอุตสาหกรรมอมตะซิตี้ ชลบุรี ถ.บางนา-ตราด", postalCode: "20000", days: 120,
  users: [
    { email: "admin@voltera.example", username: "voltera.admin", firstName: "ชยานิน", lastName: "ศรีสุข", role: "COMPANY_ADMIN", employeeCode: "VT-CA-001", phone: "081-000-0001" },
    { email: "manager@voltera.example", username: "voltera.manager", firstName: "พีรพัฒน์", lastName: "วงศ์ใหญ่", role: "MANAGER", employeeCode: "VT-MG-001", phone: "081-000-0002", factory: "VT-CB1" },
    { email: "manager.rayong@voltera.example", username: "voltera.manager.ry", firstName: "ศิริพร", lastName: "แสงทอง", role: "MANAGER", employeeCode: "VT-MG-002", factory: "VT-RY2" },
    { email: "operator@voltera.example", username: "voltera.operator", firstName: "มนัสวี", lastName: "ทองดี", role: "OPERATOR", employeeCode: "VT-OP-001", department: "SMT", factory: "VT-CB1" },
    { email: "operator2@voltera.example", username: "voltera.operator2", firstName: "ธนากร", lastName: "แก้วมณี", role: "OPERATOR", employeeCode: "VT-OP-002", department: "UTL", factory: "VT-CB1" },
    { email: "operator.rayong@voltera.example", username: "voltera.operator.ry", firstName: "อนุชา", lastName: "บุญมา", role: "OPERATOR", employeeCode: "VT-OP-003", department: "PRD", factory: "VT-RY2" },
  ],
  plants: [
    {
      code: "VT-CB1", name: "โรงงานชลบุรี", province: "ชลบุรี", address: "700/123 นิคมอุตสาหกรรมอมตะซิตี้ ชลบุรี", postalCode: "20000", lat: 13.4186, lng: 101.0257,
      buildings: [
        { code: "B1", name: "อาคารผลิต 1", type: "Production", floors: 2, departments: [
          { code: "SMT", name: "ฝ่ายประกอบแผงวงจร (SMT)", lines: [smt(1), smt(2)] },
          { code: "ASM", name: "ฝ่ายประกอบขั้นสุดท้าย", lines: [{ code: "ASM-L1", name: "สายประกอบ 1" }] },
        ] },
        { code: "B2", name: "อาคารสาธารณูปโภค", type: "Utility", floors: 1, departments: [{ code: "UTL", name: "ฝ่ายสาธารณูปโภค", lines: [{ code: "UTL-01", name: "ระบบสาธารณูปโภคกลาง" }] }] },
      ],
      machines: [
        { line: "SMT-L1", code: "RF-01", name: "เตาอบรีโฟลว์ SMT 1", type: "REFLOW_OVEN", manufacturer: "Heller", model: "1913 MK5" },
        { line: "SMT-L1", code: "PP-01", name: "เครื่องวางชิ้นส่วน SMT 1", type: "PICK_AND_PLACE", manufacturer: "Fuji", model: "NXT III" },
        { line: "SMT-L2", code: "RF-02", name: "เตาอบรีโฟลว์ SMT 2", type: "REFLOW_OVEN", manufacturer: "Heller", model: "1913 MK5" },
        { line: "SMT-L2", code: "PP-02", name: "เครื่องวางชิ้นส่วน SMT 2", type: "PICK_AND_PLACE", manufacturer: "Fuji", model: "NXT III" },
        { line: "SMT-L2", code: "AOI-02", name: "เครื่องตรวจสอบด้วยภาพ SMT 2", type: "AOI", manufacturer: "Koh Young", model: "Zenith" },
        { line: "ASM-L1", code: "WS-01", name: "เครื่องบัดกรีแบบคลื่น", type: "WAVE_SOLDER", manufacturer: "ERSA", model: "POWERFLOW" },
        { line: "ASM-L1", code: "CO-01", name: "เตาอบบ่มชิ้นงาน (LPG)", type: "CURING_OVEN", manufacturer: "Despatch", model: "LCC" },
        { line: "UTL-01", code: "CMP-01", name: "เครื่องอัดอากาศหลัก", type: "AIR_COMPRESSOR", manufacturer: "Atlas Copco", model: "GA 90 VSD+" },
        { line: "UTL-01", code: "CHL-01", name: "ชิลเลอร์ระบายความร้อน", type: "CHILLER", manufacturer: "Trane", model: "RTAF" },
        { line: "UTL-01", code: "GEN-01", name: "เครื่องกำเนิดไฟฟ้าสำรอง", type: "GENERATOR", manufacturer: "Cummins", model: "C500D5", status: "STOPPED" },
        { line: "UTL-01", code: "DI-01", name: "ระบบผลิตน้ำ DI", type: "DI_SYSTEM", manufacturer: "Veolia", model: "Ionpure" },
      ],
      checkpoints: [{ line: "UTL-01", code: "CP-W01", name: "มิเตอร์น้ำประปาหลัก", type: "WATER_METER" }],
      sensors: [
        { machine: "RF-01", code: "PM-RF01", name: "มิเตอร์ไฟฟ้า เตารีโฟลว์ 1", type: "POWER_METER", unit: "KW", value: 34, noise: 0.08 },
        { machine: "RF-02", code: "PM-RF02", name: "มิเตอร์ไฟฟ้า เตารีโฟลว์ 2", type: "POWER_METER", unit: "KW", value: 33, noise: 0.08 },
        { machine: "CMP-01", code: "PM-CMP01", name: "มิเตอร์ไฟฟ้า เครื่องอัดอากาศ", type: "POWER_METER", unit: "KW", value: 52, noise: 0.06 },
        { machine: "CMP-01", code: "PR-CMP01", name: "แรงดันลมอัด", type: "PRESSURE", unit: "BAR", value: 7.1, noise: 0.02 },
        { machine: "CHL-01", code: "TP-CHL01", name: "อุณหภูมิน้ำเย็นขาออก", type: "TEMPERATURE", unit: "CELSIUS", value: 7.4, noise: 0.04 },
        { machine: "CHL-01", code: "PM-CHL01", name: "มิเตอร์ไฟฟ้า ชิลเลอร์", type: "POWER_METER", unit: "KW", value: 61, noise: 0.07, offlineHours: 30 },
      ],
      series: [
        { target: "RF-01", resource: "ELECTRICITY", base: 610, weekendFactor: 0.3, noise: 0.06, trendPct: -0.08, recorder: "operator@voltera.example" },
        { target: "PP-01", resource: "ELECTRICITY", base: 205, weekendFactor: 0.3, noise: 0.05, trendPct: -0.03, recorder: "operator@voltera.example" },
        { target: "RF-02", resource: "ELECTRICITY", base: 595, weekendFactor: 0.3, noise: 0.06, trendPct: -0.05, recorder: "operator@voltera.example", anomalies: { 3: 1.75 } },
        { target: "PP-02", resource: "ELECTRICITY", base: 200, weekendFactor: 0.3, noise: 0.05, trendPct: 0, recorder: "operator@voltera.example" },
        { target: "AOI-02", resource: "ELECTRICITY", base: 95, weekendFactor: 0.3, noise: 0.05, trendPct: 0, recorder: "operator@voltera.example" },
        { target: "WS-01", resource: "ELECTRICITY", base: 380, weekendFactor: 0.25, noise: 0.07, trendPct: -0.04, recorder: "operator@voltera.example" },
        { target: "CO-01", resource: "LPG", base: 42, weekendFactor: 0, noise: 0.08, trendPct: 0.02, recorder: "operator@voltera.example" },
        { target: "CMP-01", resource: "ELECTRICITY", base: 940, weekendFactor: 0.6, noise: 0.05, trendPct: -0.1, recorder: "operator2@voltera.example", anomalies: { 9: 1.5 } },
        { target: "CMP-01", resource: "COMPRESSED_AIR", base: 8200, weekendFactor: 0.55, noise: 0.05, trendPct: -0.06, recorder: "operator2@voltera.example" },
        { target: "CHL-01", resource: "ELECTRICITY", base: 1100, weekendFactor: 0.8, noise: 0.06, trendPct: 0.05, recorder: "operator2@voltera.example", anomalies: { 12: 0.4 } },
        { target: "GEN-01", resource: "DIESEL", base: 60, weekendFactor: 1, noise: 0.1, trendPct: 0, mondaysOnly: true, recorder: "operator2@voltera.example" },
        { target: "DI-01", resource: "DI_WATER", base: 24, weekendFactor: 0.4, noise: 0.07, trendPct: 0, recorder: "operator2@voltera.example" },
        { target: "CP-W01", resource: "TAP_WATER", base: 85, weekendFactor: 0.5, noise: 0.08, trendPct: -0.04, recorder: "operator2@voltera.example", anomalies: { 1: 1.9 } },
      ],
      kpis: [
        { code: "CB1-ELEC-M", name: "ไฟฟ้ารวมโรงงานชลบุรีต่อเดือน", type: "ENERGY", period: "MONTHLY", target: 98_000, resource: "ELECTRICITY" },
        { code: "CB1-RF01-D", name: "ไฟฟ้าเตารีโฟลว์ SMT 1 ต่อวัน", type: "ENERGY", period: "DAILY", target: 640, resource: "ELECTRICITY", machine: "RF-01" },
        { code: "CB1-WATER-W", name: "น้ำประปาโรงงานชลบุรีต่อสัปดาห์", type: "WATER", period: "WEEKLY", target: 520, resource: "TAP_WATER" },
      ],
    },
    {
      code: "VT-RY2", name: "โรงงานระยอง", province: "ระยอง", address: "88 นิคมอุตสาหกรรมเหมราช อีสเทิร์นซีบอร์ด ระยอง", postalCode: "21140", lat: 12.9938, lng: 101.1105,
      buildings: [
        { code: "R1", name: "อาคารผลิตระยอง", type: "Production", floors: 1, departments: [
          { code: "PRD", name: "ฝ่ายผลิต", lines: [{ code: "PRD-L1", name: "สายประกอบโมดูล 1" }, { code: "PRD-L2", name: "สายประกอบโมดูล 2" }] },
          { code: "FAC", name: "ฝ่ายอาคารและสาธารณูปโภค", lines: [{ code: "FAC-01", name: "สาธารณูปโภคระยอง" }] },
        ] },
      ],
      machines: [
        { line: "PRD-L1", code: "RF-11", name: "เตาอบรีโฟลว์ระยอง 1", type: "REFLOW_OVEN", manufacturer: "Rehm", model: "VisionXP+" },
        { line: "PRD-L1", code: "ICT-11", name: "เครื่องทดสอบวงจร ICT", type: "ICT", manufacturer: "Keysight", model: "i3070" },
        { line: "PRD-L2", code: "RF-12", name: "เตาอบรีโฟลว์ระยอง 2", type: "REFLOW_OVEN", manufacturer: "Rehm", model: "VisionXP+" },
        { line: "PRD-L2", code: "BI-12", name: "ห้องทดสอบ Burn-in", type: "BURN_IN", manufacturer: "Espec", model: "BIR-4" },
        { line: "FAC-01", code: "AHU-01", name: "ระบบปรับอากาศ AHU", type: "AHU", manufacturer: "Daikin", model: "AHU-D" },
        { line: "FAC-01", code: "CMP-11", name: "เครื่องอัดอากาศระยอง", type: "AIR_COMPRESSOR", manufacturer: "Kaeser", model: "SFC 55" },
      ],
      checkpoints: [{ line: "FAC-01", code: "CP-W11", name: "มิเตอร์น้ำประปาระยอง", type: "WATER_METER" }],
      sensors: [
        { machine: "AHU-01", code: "TP-AHU01", name: "อุณหภูมิห้องผลิต", type: "TEMPERATURE", unit: "CELSIUS", value: 23.5, noise: 0.02 },
        { machine: "CMP-11", code: "PM-CMP11", name: "มิเตอร์ไฟฟ้า เครื่องอัดอากาศ", type: "POWER_METER", unit: "KW", value: 31, noise: 0.06 },
      ],
      series: [
        // LED + VSD retrofit ~6 weeks ago: visible step down on the Rayong plant.
        { target: "RF-11", resource: "ELECTRICITY", base: 560, weekendFactor: 0.2, noise: 0.06, trendPct: -0.14, recorder: "operator.rayong@voltera.example" },
        { target: "ICT-11", resource: "ELECTRICITY", base: 120, weekendFactor: 0.2, noise: 0.05, trendPct: -0.02, recorder: "operator.rayong@voltera.example" },
        { target: "RF-12", resource: "ELECTRICITY", base: 540, weekendFactor: 0.2, noise: 0.06, trendPct: -0.12, recorder: "operator.rayong@voltera.example" },
        { target: "BI-12", resource: "ELECTRICITY", base: 430, weekendFactor: 0.9, noise: 0.05, trendPct: 0.03, recorder: "operator.rayong@voltera.example", anomalies: { 5: 1.6 } },
        { target: "AHU-01", resource: "ELECTRICITY", base: 780, weekendFactor: 0.7, noise: 0.07, trendPct: -0.18, recorder: "operator.rayong@voltera.example" },
        { target: "CMP-11", resource: "ELECTRICITY", base: 520, weekendFactor: 0.5, noise: 0.05, trendPct: -0.2, recorder: "operator.rayong@voltera.example" },
        { target: "CP-W11", resource: "TAP_WATER", base: 41, weekendFactor: 0.5, noise: 0.08, trendPct: 0, recorder: "operator.rayong@voltera.example" },
      ],
      kpis: [{ code: "RY2-ELEC-M", name: "ไฟฟ้ารวมโรงงานระยองต่อเดือน", type: "ENERGY", period: "MONTHLY", target: 68_000, resource: "ELECTRICITY" }],
    },
  ],
};

const SIAMFOOD: CompanyDef = {
  code: "SIAMFOOD", name: "บริษัท สยามฟู้ด โปรเซสซิ่ง จำกัด", industry: "อาหารแปรรูป", province: "นครปฐม", plan: "ENTERPRISE", status: "ACTIVE",
  email: "contact@siamfood.example", phone: "034-000-000", address: "55 ถ.เพชรเกษม อ.สามพราน นครปฐม", postalCode: "73110", days: 90,
  users: [
    { email: "admin@siamfood.example", username: "siamfood.admin", firstName: "ปิยะนุช", lastName: "เรืองศรี", role: "COMPANY_ADMIN", employeeCode: "SF-CA-001" },
    { email: "manager@siamfood.example", username: "siamfood.manager", firstName: "วิชัย", lastName: "ประเสริฐ", role: "MANAGER", employeeCode: "SF-MG-001" },
    { email: "operator@siamfood.example", username: "siamfood.operator", firstName: "สุนิสา", lastName: "จันทร์เพ็ญ", role: "OPERATOR", employeeCode: "SF-OP-001", department: "UTL" },
  ],
  plants: [
    {
      code: "SF-NP1", name: "โรงงานนครปฐม", province: "นครปฐม", address: "55 ถ.เพชรเกษม อ.สามพราน นครปฐม", postalCode: "73110", lat: 13.7346, lng: 100.2245,
      buildings: [
        { code: "P1", name: "อาคารแปรรูป", type: "Production", floors: 1, departments: [{ code: "PRC", name: "ฝ่ายแปรรูป", lines: [{ code: "PRC-L1", name: "สายนึ่งและบรรจุ" }] }] },
        { code: "U1", name: "อาคารหม้อไอน้ำและห้องเย็น", type: "Utility", floors: 1, departments: [{ code: "UTL", name: "ฝ่ายวิศวกรรมโรงงาน", lines: [{ code: "UTL-1", name: "หม้อไอน้ำและห้องเย็น" }] }] },
      ],
      machines: [
        { line: "UTL-1", code: "CHL-21", name: "ห้องเย็นแช่แข็ง", type: "CHILLER", manufacturer: "Bitzer", model: "CSH" },
        { line: "UTL-1", code: "CT-21", name: "หอผึ่งเย็น", type: "COOLING_TOWER", manufacturer: "Liang Chi", model: "LBC" },
        { line: "PRC-L1", code: "CMP-21", name: "เครื่องอัดอากาศสายบรรจุ", type: "AIR_COMPRESSOR", manufacturer: "Atlas Copco", model: "GA 37" },
        { line: "UTL-1", code: "WW-21", name: "ระบบบำบัดน้ำเสีย", type: "WWTP", manufacturer: "Aqua", model: "SBR" },
      ],
      checkpoints: [
        { line: "UTL-1", code: "BLR-21", name: "หม้อไอน้ำ (มิเตอร์ก๊าซ)", type: "GAS_METER" },
        { line: "UTL-1", code: "CP-W21", name: "มิเตอร์น้ำบาดาล", type: "WATER_METER" },
      ],
      sensors: [{ machine: "CHL-21", code: "TP-CHL21", name: "อุณหภูมิห้องเย็น", type: "TEMPERATURE", unit: "CELSIUS", value: -18.5, noise: 0.03 }],
      series: [
        { target: "CHL-21", resource: "ELECTRICITY", base: 2100, weekendFactor: 0.95, noise: 0.05, trendPct: 0.04, recorder: "operator@siamfood.example" },
        { target: "CT-21", resource: "ELECTRICITY", base: 260, weekendFactor: 0.9, noise: 0.06, trendPct: 0, recorder: "operator@siamfood.example" },
        { target: "CMP-21", resource: "ELECTRICITY", base: 410, weekendFactor: 0.4, noise: 0.05, trendPct: -0.03, recorder: "operator@siamfood.example" },
        { target: "BLR-21", resource: "NATURAL_GAS", base: 1150, weekendFactor: 0.5, noise: 0.06, trendPct: -0.02, recorder: "operator@siamfood.example", anomalies: { 2: 1.55 } },
        { target: "CP-W21", resource: "GROUNDWATER", base: 310, weekendFactor: 0.6, noise: 0.07, trendPct: 0, recorder: "operator@siamfood.example" },
        { target: "WW-21", resource: "INDUSTRIAL_WASTEWATER", base: 240, weekendFactor: 0.6, noise: 0.08, trendPct: 0, recorder: "operator@siamfood.example" },
      ],
      kpis: [{ code: "NP1-ELEC-M", name: "ไฟฟ้ารวมโรงงานนครปฐมต่อเดือน", type: "ENERGY", period: "MONTHLY", target: 92_000, resource: "ELECTRICITY" }],
    },
  ],
};

export default async function seedDemo() {
  if (await prisma.company.findUnique({ where: { companyCode: "VOLTERA" } })) {
    console.log("Demo data already present — skipping (drop the DB to reseed).");
    return;
  }
  console.log("Seeding demo tenants…");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: "admin@greenfactory.dev" },
    update: {},
    create: { email: "admin@greenfactory.dev", username: "platform.admin", firstName: "ผู้ดูแล", lastName: "แพลตฟอร์ม", roleId: await roleId("PLATFORM_ADMIN"), passwordHash, passwordChangedAt: new Date() },
  });

  // Sample factors, clearly labelled. Verify against current TGO values before real use.
  const SOURCE = "ค่าตัวอย่างสำหรับเดโม ตรวจสอบค่าล่าสุดกับ อบก. (TGO) ก่อนใช้งานจริง";
  for (const [code, factor, factorUnit, scope] of [
    ["ELECTRICITY", 0.4999, "kgCO2e/kWh", "SCOPE 2"],
    ["DIESEL", 2.7078, "kgCO2e/L", "SCOPE 1"],
    ["LPG", 3.1133, "kgCO2e/kg", "SCOPE 1"],
    ["NATURAL_GAS", 2.0254, "kgCO2e/m3", "SCOPE 1"],
  ] as const) {
    await prisma.emissionFactor.create({ data: { resourceTypeId: (await resource(code)).resourceTypeId, factor, factorUnit, scope, region: "TH", source: SOURCE, effectiveDate: new Date("2024-01-01") } });
  }

  const v = await seedCompany(VOLTERA, passwordHash);
  const s = await seedCompany(SIAMFOOD, passwordHash);
  await prisma.company.create({
    data: { companyCode: "SIAMPACK", companyName: "บริษัท สยามแพ็คเกจจิ้ง จำกัด", industryType: "บรรจุภัณฑ์", province: "สมุทรปราการ", country: "Thailand", email: "contact@siampack.example", subscriptionPlan: "TRIAL", carbonStandard: "TGO", timezone: "Asia/Bangkok", currency: "THB", language: "th", status: "PENDING" },
  }).then(async (c) => prisma.user.create({ data: { email: "admin@siampack.example", username: "siampack.admin", firstName: "วรรณา", lastName: "พูลสวัสดิ์", employeeCode: "SP-CA-001", roleId: await roleId("COMPANY_ADMIN"), companyId: c.companyId, passwordHash } }));

  const op = (email: string) => (v.users.get(email) ?? s.users.get(email))!;
  await prisma.supportTicket.createMany({
    data: [
      { ticketReference: "SUP-DEMO-000001", reporterId: op("operator@voltera.example"), companyId: v.company.companyId, subject: "กล้องสแกน QR ไม่เปิดบนแท็บเล็ต", category: "QR", priority: "NORMAL", description: "แท็บเล็ตประจำไลน์ SMT 2 กดสแกนแล้วกล้องไม่เปิด", pageUrl: "/operator/scan" },
      { ticketReference: "SUP-DEMO-000002", reporterId: op("admin@voltera.example"), companyId: v.company.companyId, subject: "ขอเพิ่มประเภทเครื่องจักร Conformal Coating", category: "GENERAL", priority: "LOW", description: "ต้องการลงทะเบียนเครื่องเคลือบแผงวงจร", status: "IN_PROGRESS" },
      { ticketReference: "SUP-DEMO-000003", reporterId: op("manager@siamfood.example"), companyId: s.company.companyId, subject: "ขอรายงานก๊าซธรรมชาติแยกตามกะ", category: "REPORT", priority: "HIGH", description: "ฝ่ายบัญชีต้องการต้นทุนก๊าซต่อกะการผลิต", status: "OPEN" },
    ],
  });
  const [alerts, carbon] = await Promise.all([prisma.alert.count(), prisma.carbonResult.count()]);
  console.log(`  ${v.usages + s.usages} readings, ${carbon} carbon results, ${alerts} alerts.`);
  console.log(`  Demo password: ${PASSWORD === "Demo1234" ? "Demo1234 (set SEED_DEMO_PASSWORD to change)" : "(from SEED_DEMO_PASSWORD)"}`);
}

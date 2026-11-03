// Fictional demo tenant. Every figure here is generated — never real customer data.
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./client";
import { processUsage } from "../../src/server/domain/process-usage";
import { evaluateKpi, periodBounds } from "../../src/server/domain/kpi";
import { addDays, bkkDay, endOfBkkDayExclusive, startOfBkkDay } from "../../src/lib/time";

const DAYS = 120;
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

const roleId = async (name: string) => (await prisma.role.findUniqueOrThrow({ where: { roleName: name } })).roleId;
const unit = async (code: string) => prisma.unit.findUniqueOrThrow({ where: { unitCode: code } });
const resource = async (code: string) => prisma.resourceTypeMaster.findUniqueOrThrow({ where: { resourceCode: code } });
const machineType = async (code: string) => prisma.machineType.findUniqueOrThrow({ where: { machineTypeCode: code } });
const sensorType = async (code: string) => prisma.sensorType.findUniqueOrThrow({ where: { sensorTypeCode: code } });

async function upsertUser(data: {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: number;
  factoryId?: number;
  departmentId?: number;
  employeeCode?: string;
  phone?: string;
}, passwordHash: string) {
  const { role, ...rest } = data;
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: { ...rest, roleId: await roleId(role), passwordHash, passwordChangedAt: new Date() },
  });
}

export default async function seedDemo() {
  if (await prisma.company.findUnique({ where: { companyCode: "VOLTERA" } })) {
    console.log("Demo data already present — skipping (drop the DB to reseed).");
    return;
  }
  console.log("Seeding demo tenant…");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  await upsertUser(
    { email: "admin@greenfactory.dev", username: "platform.admin", firstName: "ผู้ดูแล", lastName: "แพลตฟอร์ม", role: "PLATFORM_ADMIN" },
    passwordHash,
  );

  // ---------- Demo emission factors (labelled as samples) ----------
  const EF_SOURCE = "ค่าตัวอย่างสำหรับเดโม — ตรวจสอบค่าล่าสุดกับ อบก. (TGO) ก่อนใช้งานจริง";
  for (const [code, factor, factorUnit, scope] of [
    ["ELECTRICITY", 0.4999, "kgCO2e/kWh", "SCOPE 2"],
    ["DIESEL", 2.7078, "kgCO2e/L", "SCOPE 1"],
    ["LPG", 3.1133, "kgCO2e/kg", "SCOPE 1"],
  ] as const) {
    const rt = await resource(code);
    await prisma.emissionFactor.create({
      data: { resourceTypeId: rt.resourceTypeId, factor, factorUnit, scope, region: "TH", source: EF_SOURCE, effectiveDate: new Date("2024-01-01") },
    });
  }

  // ---------- Second (empty) tenant, to make tenancy visible to the platform admin ----------
  await prisma.company.create({
    data: {
      companyCode: "SIAMPACK",
      companyName: "บริษัท สยามแพ็คเกจจิ้ง จำกัด",
      industryType: "บรรจุภัณฑ์",
      province: "สมุทรปราการ",
      country: "Thailand",
      email: "contact@siampack.example",
      subscriptionPlan: "TRIAL",
      carbonStandard: "TGO",
      timezone: "Asia/Bangkok",
      currency: "THB",
      language: "th",
      status: "PENDING",
    },
  });

  // ---------- Main demo tenant ----------
  const company = await prisma.company.create({
    data: {
      companyCode: "VOLTERA",
      companyName: "บริษัท วอลเทรา อิเล็กทรอนิกส์ จำกัด",
      industryType: "การผลิตอุปกรณ์อิเล็กทรอนิกส์",
      address: "700/123 นิคมอุตสาหกรรมอมตะซิตี้ ชลบุรี ถ.บางนา-ตราด",
      province: "ชลบุรี",
      postalCode: "20000",
      country: "Thailand",
      phone: "038-000-000",
      email: "contact@voltera.example",
      subscriptionPlan: "STANDARD",
      carbonStandard: "TGO",
      timezone: "Asia/Bangkok",
      currency: "THB",
      language: "th",
    },
  });
  const factory = await prisma.factory.create({
    data: {
      companyId: company.companyId,
      factoryCode: "VT-CB1",
      factoryName: "โรงงานชลบุรี 1",
      address: "700/123 นิคมอุตสาหกรรมอมตะซิตี้ ชลบุรี",
      province: "ชลบุรี",
      postalCode: "20000",
      country: "Thailand",
      latitude: 13.4186,
      longitude: 101.0257,
      mapZoom: 16,
      phone: "038-000-001",
      email: "plant1@voltera.example",
      timezone: "Asia/Bangkok",
    },
  });
  const b1 = await prisma.building.create({
    data: { factoryId: factory.factoryId, buildingCode: "B1", buildingName: "อาคารผลิต 1", buildingType: "Production", floorCount: 2 },
  });
  const b2 = await prisma.building.create({
    data: { factoryId: factory.factoryId, buildingCode: "B2", buildingName: "อาคารสาธารณูปโภค", buildingType: "Utility", floorCount: 1 },
  });
  const dSmt = await prisma.department.create({
    data: { buildingId: b1.buildingId, departmentCode: "SMT", departmentName: "ฝ่ายประกอบแผงวงจร (SMT)" },
  });
  const dAsm = await prisma.department.create({
    data: { buildingId: b1.buildingId, departmentCode: "ASM", departmentName: "ฝ่ายประกอบขั้นสุดท้าย" },
  });
  const dUtl = await prisma.department.create({
    data: { buildingId: b2.buildingId, departmentCode: "UTL", departmentName: "ฝ่ายสาธารณูปโภค" },
  });
  const line = async (departmentId: number, lineCode: string, lineName: string) =>
    prisma.productionLine.create({ data: { departmentId, lineCode, lineName } });
  const l1 = await line(dSmt.departmentId, "SMT-L1", "สายการผลิต SMT 1");
  const l2 = await line(dSmt.departmentId, "SMT-L2", "สายการผลิต SMT 2");
  const l3 = await line(dAsm.departmentId, "ASM-L1", "สายประกอบ 1");
  const l4 = await line(dUtl.departmentId, "UTL-01", "ระบบสาธารณูปโภคกลาง");

  // ---------- Users ----------
  const companyAdmin = await upsertUser(
    { email: "admin@voltera.example", username: "voltera.admin", firstName: "ชยานิน", lastName: "ศรีสุข", role: "COMPANY_ADMIN", companyId: company.companyId, employeeCode: "VT-CA-001", phone: "081-000-0001" },
    passwordHash,
  );
  const manager = await upsertUser(
    { email: "manager@voltera.example", username: "voltera.manager", firstName: "พีรพัฒน์", lastName: "วงศ์ใหญ่", role: "MANAGER", companyId: company.companyId, factoryId: factory.factoryId, employeeCode: "VT-MG-001", phone: "081-000-0002" },
    passwordHash,
  );
  const op1 = await upsertUser(
    { email: "operator@voltera.example", username: "voltera.operator", firstName: "มนัสวี", lastName: "ทองดี", role: "OPERATOR", companyId: company.companyId, factoryId: factory.factoryId, departmentId: dSmt.departmentId, employeeCode: "VT-OP-001" },
    passwordHash,
  );
  const op2 = await upsertUser(
    { email: "operator2@voltera.example", username: "voltera.operator2", firstName: "ธนากร", lastName: "แก้วมณี", role: "OPERATOR", companyId: company.companyId, factoryId: factory.factoryId, departmentId: dUtl.departmentId, employeeCode: "VT-OP-002" },
    passwordHash,
  );
  await upsertUser(
    { email: "admin@siampack.example", username: "siampack.admin", firstName: "วรรณา", lastName: "พูลสวัสดิ์", role: "COMPANY_ADMIN", companyId: (await prisma.company.findUniqueOrThrow({ where: { companyCode: "SIAMPACK" } })).companyId, employeeCode: "SP-CA-001" },
    passwordHash,
  );

  // ---------- Machines ----------
  type M = { lineId: number; code: string; name: string; type: string; manufacturer: string; model: string };
  const machineDefs: M[] = [
    { lineId: l1.lineId, code: "RF-01", name: "เตาอบรีโฟลว์ SMT 1", type: "REFLOW_OVEN", manufacturer: "Heller", model: "1913 MK5" },
    { lineId: l1.lineId, code: "PP-01", name: "เครื่องวางชิ้นส่วน SMT 1", type: "PICK_AND_PLACE", manufacturer: "Fuji", model: "NXT III" },
    { lineId: l2.lineId, code: "RF-02", name: "เตาอบรีโฟลว์ SMT 2", type: "REFLOW_OVEN", manufacturer: "Heller", model: "1913 MK5" },
    { lineId: l2.lineId, code: "PP-02", name: "เครื่องวางชิ้นส่วน SMT 2", type: "PICK_AND_PLACE", manufacturer: "Fuji", model: "NXT III" },
    { lineId: l2.lineId, code: "AOI-02", name: "เครื่องตรวจสอบด้วยภาพ SMT 2", type: "AOI", manufacturer: "Koh Young", model: "Zenith" },
    { lineId: l3.lineId, code: "WS-01", name: "เครื่องบัดกรีแบบคลื่น", type: "WAVE_SOLDER", manufacturer: "ERSA", model: "POWERFLOW" },
    { lineId: l3.lineId, code: "CO-01", name: "เตาอบบ่มชิ้นงาน (LPG)", type: "CURING_OVEN", manufacturer: "Despatch", model: "LCC" },
    { lineId: l4.lineId, code: "CMP-01", name: "เครื่องอัดอากาศหลัก", type: "AIR_COMPRESSOR", manufacturer: "Atlas Copco", model: "GA 90 VSD+" },
    { lineId: l4.lineId, code: "CHL-01", name: "ชิลเลอร์ระบายความร้อน", type: "CHILLER", manufacturer: "Trane", model: "RTAF" },
    { lineId: l4.lineId, code: "GEN-01", name: "เครื่องกำเนิดไฟฟ้าสำรอง", type: "GENERATOR", manufacturer: "Cummins", model: "C500D5" },
    { lineId: l4.lineId, code: "DI-01", name: "ระบบผลิตน้ำ DI", type: "DI_SYSTEM", manufacturer: "Veolia", model: "Ionpure" },
  ];
  const machines: Record<string, Awaited<ReturnType<typeof prisma.machine.create>>> = {};
  for (const m of machineDefs) {
    machines[m.code] = await prisma.machine.create({
      data: {
        lineId: m.lineId,
        machineTypeId: (await machineType(m.type)).machineTypeId,
        machineCode: m.code,
        machineName: m.name,
        manufacturer: m.manufacturer,
        model: m.model,
        serialNumber: `SN-${m.code}-${2021 + (m.code.length % 3)}`,
        installationDate: new Date("2022-03-15"),
        locationNote: m.lineId === l4.lineId ? "ห้องเครื่อง อาคาร B2" : "พื้นที่ผลิต ชั้น 1",
      },
    });
  }
  await prisma.machine.update({ where: { machineId: machines["GEN-01"].machineId }, data: { operationalStatus: "STOPPED" } });
  const checkpoint = await prisma.checkpoint.create({
    data: { lineId: l4.lineId, checkpointCode: "CP-W01", checkpointName: "มิเตอร์น้ำประปาหลัก", checkpointType: "WATER_METER", description: "มิเตอร์น้ำประปาทางเข้าโรงงาน" },
  });

  // ---------- QR codes (every target) ----------
  const qrByMachine: Record<number, bigint> = {};
  for (const m of Object.values(machines)) {
    const qr = await prisma.qRCode.create({ data: { machineId: m.machineId, qrCode: `QR-${m.machineCode}`, qrToken: randomUUID() } });
    qrByMachine[m.machineId] = qr.qrId;
  }
  const cpQr = await prisma.qRCode.create({ data: { checkpointId: checkpoint.checkpointId, qrCode: "QR-CP-W01", qrToken: randomUUID() } });

  // ---------- Sensors ----------
  const now = new Date();
  const sensors: [string, string, string, string, number | null][] = [
    ["RF-01", "PM-RF01", "มิเตอร์ไฟฟ้า เตารีโฟลว์ 1", "POWER_METER", 0],
    ["RF-02", "PM-RF02", "มิเตอร์ไฟฟ้า เตารีโฟลว์ 2", "POWER_METER", 0],
    ["CMP-01", "PM-CMP01", "มิเตอร์ไฟฟ้า เครื่องอัดอากาศ", "POWER_METER", 0],
    ["CMP-01", "PR-CMP01", "เซนเซอร์แรงดันลมอัด", "PRESSURE", 0],
    ["CHL-01", "TP-CHL01", "เซนเซอร์อุณหภูมิน้ำเย็นขาออก", "TEMPERATURE", 0],
    ["CHL-01", "PM-CHL01", "มิเตอร์ไฟฟ้า ชิลเลอร์", "POWER_METER", 2 * 86400],
    ["DI-01", "CD-DI01", "เซนเซอร์ค่าการนำไฟฟ้า น้ำ DI", "CONDUCTIVITY", null],
  ];
  const sensorUnits: Record<string, string> = { POWER_METER: "KW", PRESSURE: "BAR", TEMPERATURE: "CELSIUS", CONDUCTIVITY: "PERCENT" };
  const sensorValue: Record<string, number> = { POWER_METER: 42, PRESSURE: 7.1, TEMPERATURE: 7.4, CONDUCTIVITY: 0.1 };
  for (const [m, code, name, type, ageSeconds] of sensors) {
    const s = await prisma.sensor.create({
      data: {
        machineId: machines[m].machineId,
        sensorTypeId: (await sensorType(type)).sensorTypeId,
        sensorCode: code,
        sensorName: name,
        manufacturer: "Schneider Electric",
        protocol: "Modbus TCP",
        connectionAddress: `10.20.4.${10 + Object.keys(machines).indexOf(m)}:502`,
        samplingIntervalSeconds: 60,
        lastConnectedAt: ageSeconds === null ? null : new Date(now.getTime() - ageSeconds * 1000),
        installationDate: new Date("2023-01-10"),
        lastCalibrationDate: new Date("2026-05-01"),
        nextCalibrationDate: new Date("2027-05-01"),
      },
    });
    if (ageSeconds !== null) {
      const u = await unit(sensorUnits[type]);
      const v = sensorValue[type];
      await prisma.sensorData.create({
        data: { sensorId: s.sensorId, unitId: u.unitId, rawValue: v, processedValue: v, measuredAt: new Date(now.getTime() - ageSeconds * 1000) },
      });
    }
  }

  // ---------- 120 days of daily meter readings ----------
  type Series = {
    machine?: string;
    resource: string;
    base: number;
    weekendFactor: number;
    noise: number;
    trendPct: number; // change from first to last day
    everyNDays?: number;
    recorder: number;
  };
  const series: Series[] = [
    { machine: "RF-01", resource: "ELECTRICITY", base: 610, weekendFactor: 0.3, noise: 0.06, trendPct: -0.08, recorder: op1.userId },
    { machine: "PP-01", resource: "ELECTRICITY", base: 205, weekendFactor: 0.3, noise: 0.05, trendPct: -0.03, recorder: op1.userId },
    { machine: "RF-02", resource: "ELECTRICITY", base: 595, weekendFactor: 0.3, noise: 0.06, trendPct: -0.05, recorder: op1.userId },
    { machine: "PP-02", resource: "ELECTRICITY", base: 200, weekendFactor: 0.3, noise: 0.05, trendPct: 0, recorder: op1.userId },
    { machine: "AOI-02", resource: "ELECTRICITY", base: 95, weekendFactor: 0.3, noise: 0.05, trendPct: 0, recorder: op1.userId },
    { machine: "WS-01", resource: "ELECTRICITY", base: 380, weekendFactor: 0.25, noise: 0.07, trendPct: -0.04, recorder: op1.userId },
    { machine: "CO-01", resource: "LPG", base: 42, weekendFactor: 0, noise: 0.08, trendPct: 0.02, recorder: op1.userId },
    { machine: "CMP-01", resource: "ELECTRICITY", base: 940, weekendFactor: 0.6, noise: 0.05, trendPct: -0.1, recorder: op2.userId },
    { machine: "CMP-01", resource: "COMPRESSED_AIR", base: 8200, weekendFactor: 0.55, noise: 0.05, trendPct: -0.06, recorder: op2.userId },
    { machine: "CHL-01", resource: "ELECTRICITY", base: 1100, weekendFactor: 0.8, noise: 0.06, trendPct: 0.05, recorder: op2.userId },
    { machine: "GEN-01", resource: "DIESEL", base: 60, weekendFactor: 1, noise: 0.1, trendPct: 0, everyNDays: 7, recorder: op2.userId },
    { machine: "DI-01", resource: "DI_WATER", base: 24, weekendFactor: 0.4, noise: 0.07, trendPct: 0, recorder: op2.userId },
    { resource: "TAP_WATER", base: 85, weekendFactor: 0.5, noise: 0.08, trendPct: -0.04, recorder: op2.userId },
  ];
  // Injected anomalies (days ago → multiplier)
  const anomalies: Record<string, Record<number, number>> = {
    "RF-02:ELECTRICITY": { 3: 1.75 },
    "CMP-01:ELECTRICITY": { 9: 1.5 },
    "CHL-01:ELECTRICITY": { 12: 0.4 },
    "CP-W01:TAP_WATER": { 1: 1.9 },
  };

  const today = bkkDay(now);
  const firstDay = addDays(today, -(DAYS - 1));
  const lookups = new Map<string, { resourceTypeId: number; unitId: number }>();
  for (const s of series) {
    if (!lookups.has(s.resource)) {
      const rt = await resource(s.resource);
      lookups.set(s.resource, { resourceTypeId: rt.resourceTypeId, unitId: rt.defaultUnitId });
    }
  }

  let created = 0;
  const usageIds: bigint[] = [];
  for (let i = 0; i < DAYS; i++) {
    const day = addDays(firstDay, i);
    const daysAgo = DAYS - 1 - i;
    const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
    const weekend = dow === 0 || dow === 6;
    for (const s of series) {
      if (s.everyNDays && dow !== 1) continue; // generator test run every Monday
      if (weekend && s.weekendFactor === 0) continue;
      const target = s.machine ? machines[s.machine] : null;
      const key = `${s.machine ?? "CP-W01"}:${s.resource}`;
      const trend = 1 + s.trendPct * (i / (DAYS - 1));
      let qty = s.base * (weekend ? s.weekendFactor : 1) * trend * jitter(s.noise);
      qty *= anomalies[key]?.[daysAgo] ?? 1;
      qty = Math.round(qty * 100) / 100;

      // Readings taken between 07:30 and 09:00 Bangkok
      const usageAt = new Date(startOfBkkDay(day).getTime() + (7.5 + rand() * 1.5) * 3600_000);
      if (usageAt > now) continue;

      const viaQr = rand() < 0.75;
      const qrId = target ? qrByMachine[target.machineId] : cpQr.qrId;
      const scan = viaQr
        ? await prisma.qRScanLog.create({ data: { qrId, userId: s.recorder, scanResult: "SUCCESS", scannedAt: new Date(usageAt.getTime() - 60_000), device: "Mobile" } })
        : null;
      const { resourceTypeId, unitId } = lookups.get(s.resource)!;
      const u = await prisma.resourceUsage.create({
        data: {
          usageReference: `USG-${usageAt.getTime()}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`,
          companyId: company.companyId,
          factoryId: factory.factoryId,
          buildingId: target ? (target.lineId === l4.lineId ? b2.buildingId : b1.buildingId) : b2.buildingId,
          departmentId: target ? (target.lineId === l4.lineId ? dUtl.departmentId : target.lineId === l3.lineId ? dAsm.departmentId : dSmt.departmentId) : dUtl.departmentId,
          lineId: target ? target.lineId : l4.lineId,
          machineId: target?.machineId ?? null,
          checkpointId: target ? null : checkpoint.checkpointId,
          resourceTypeId,
          unitId,
          qrScanId: scan?.scanId ?? null,
          scopeType: target ? "MACHINE" : "CHECKPOINT",
          quantity: qty,
          usageAt,
          sourceType: viaQr ? "QR" : "MANUAL",
          recordedBy: s.recorder,
          createdAt: usageAt,
        },
      });
      usageIds.push(u.usageId);
      created++;
    }
  }
  console.log(`  ${created} resource usage records; processing carbon + anomalies…`);
  for (const usageId of usageIds) await processUsage(prisma, usageId);
  // Older alerts are already dealt with: keep only the last 14 days open.
  const cutoff = startOfBkkDay(addDays(today, -14));
  await prisma.alert.updateMany({
    where: { companyId: company.companyId, triggeredAt: { lt: cutoff } },
    data: { status: "RESOLVED", acknowledgedAt: cutoff, resolvedAt: cutoff, resolvedBy: manager.userId },
  });

  // ---------- KPIs ----------
  const elec = lookups.get("ELECTRICITY")!;
  const water = lookups.get("TAP_WATER")!;
  const kpis = [
    { kpiCode: "KPI-ELEC-M", kpiName: "ไฟฟ้ารวมทั้งโรงงานต่อเดือน", kpiType: "ENERGY", periodType: "MONTHLY", target: 98_000, ...elec, scope: { factoryId: factory.factoryId }, scopeType: "FACTORY" },
    { kpiCode: "KPI-SMT1-D", kpiName: "ไฟฟ้าเตารีโฟลว์ SMT 1 ต่อวัน", kpiType: "ENERGY", periodType: "DAILY", target: 640, ...elec, scope: { factoryId: factory.factoryId, machineId: machines["RF-01"].machineId }, scopeType: "MACHINE" },
    { kpiCode: "KPI-WATER-W", kpiName: "น้ำประปาต่อสัปดาห์", kpiType: "WATER", periodType: "WEEKLY", target: 520, ...water, scope: { factoryId: factory.factoryId }, scopeType: "FACTORY" },
  ];
  for (const k of kpis) {
    const kpi = await prisma.kPI.create({
      data: {
        companyId: company.companyId,
        ...k.scope,
        resourceTypeId: k.resourceTypeId,
        unitId: k.unitId,
        kpiCode: k.kpiCode,
        kpiName: k.kpiName,
        kpiType: k.kpiType,
        scopeType: k.scopeType,
        targetValue: k.target,
        targetOperator: "<=",
        periodType: k.periodType,
        effectiveFrom: new Date(`${firstDay}T00:00:00Z`),
      },
    });
    const seen = new Set<string>();
    for (let i = 0; i < DAYS; i++) {
      const p = periodBounds(k.periodType, startOfBkkDay(addDays(firstDay, i)));
      const key = p.start;
      if (seen.has(key) || p.end >= today) continue; // only closed periods
      seen.add(key);
      const agg = await prisma.resourceUsage.aggregate({
        _sum: { quantity: true },
        where: {
          companyId: company.companyId,
          status: "ACTIVE",
          resourceTypeId: k.resourceTypeId,
          unitId: k.unitId,
          ...k.scope,
          usageAt: { gte: startOfBkkDay(p.start), lt: endOfBkkDayExclusive(p.end) },
        },
      });
      const actual = Number(agg._sum.quantity ?? 0);
      const r = evaluateKpi(actual, k.target, "<=");
      await prisma.kPIResult.create({
        data: {
          kpiId: kpi.kpiId,
          actualValue: actual,
          varianceValue: r.variance,
          achievementPercent: r.achievement,
          periodStart: new Date(`${p.start}T00:00:00Z`),
          periodEnd: new Date(`${p.end}T00:00:00Z`),
          resultStatus: r.pass ? "PASS" : "FAIL",
        },
      });
    }
  }

  // ---------- A couple of support tickets ----------
  await prisma.supportTicket.create({
    data: { ticketReference: "SUP-DEMO-000001", reporterId: op1.userId, companyId: company.companyId, subject: "กล้องสแกน QR ไม่เปิดบนแท็บเล็ต", category: "QR", priority: "NORMAL", description: "แท็บเล็ตประจำไลน์ SMT 2 กดสแกนแล้วกล้องไม่เปิด", pageUrl: "/operator/scan" },
  });
  await prisma.supportTicket.create({
    data: { ticketReference: "SUP-DEMO-000002", reporterId: companyAdmin.userId, companyId: company.companyId, subject: "ขอเพิ่มประเภทเครื่องจักร Conformal Coating", category: "GENERAL", priority: "LOW", description: "ต้องการลงทะเบียนเครื่องเคลือบแผงวงจร", status: "IN_PROGRESS" },
  });

  const [alerts, carbon] = await Promise.all([
    prisma.alert.count({ where: { companyId: company.companyId } }),
    prisma.carbonResult.count(),
  ]);
  console.log(`  ${alerts} alerts, ${carbon} carbon results.`);
  console.log(`Demo password for all demo users: ${PASSWORD === "Demo1234" ? "Demo1234 (set SEED_DEMO_PASSWORD to change)" : "(from SEED_DEMO_PASSWORD)"}`);
}

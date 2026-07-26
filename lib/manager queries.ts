import "server-only";
import { prisma } from "@/lib/prisma";
import type { ResourceType } from "@/generated/prisma/client";

export interface KpiWithTrend {
  total: number;
  unit: string;
  changePct: number; // + = เพิ่มขึ้นจากช่วงก่อนหน้า, - = ลดลง
}

export interface TrendPoint {
  dateLabel: string;
  [department: string]: number | string;
}

export interface DepartmentShare {
  department: string;
  value: number;
  percent: number;
}

export interface ResourceDetailData {
  total: number;
  unit: string;
  changePct: number;
  trend: TrendPoint[];
  departments: string[];
  breakdown: DepartmentShare[];
  lastUpdatedAt: string | null;
}

export interface ManagerDashboardData {
  energy: KpiWithTrend;
  water: KpiWithTrend;
  trend: TrendPoint[];
  departments: string[];
  breakdown: DepartmentShare[];
  lastUpdatedAt: string | null;
}

export const WATER_TYPES: ResourceType[] = ["WATER", "DI_WATER", "CHILLED_WATER"];
export const ENERGY_TYPES: ResourceType[] = ["ELECTRICITY"];

/**
 * ค่าสัมประสิทธิ์การปล่อยคาร์บอน (kgCO2e ต่อหน่วย) — เป็นค่าประมาณทั่วไป
 * ยังไม่ใช่ค่าที่บริษัทยืนยันอย่างเป็นทางการ (เช่น emission factor ไฟฟ้าไทย
 * จาก TGO จริงจะเปลี่ยนทุกปี) **ห้ามใช้ตัวเลขนี้ในการรายงานที่ต้องผ่านการ
 * ตรวจสอบ (audit) จริง** ควรเปลี่ยนเป็นค่าที่บริษัทยืนยันแล้ว หรือทำเป็นตาราง
 * ที่แก้ไขได้ผ่านหน้า Admin แทนการ hardcode แบบนี้
 */
export const EMISSION_FACTORS_KGCO2E: Record<string, number> = {
  ELECTRICITY: 0.4999, // kgCO2e / kWh (Thailand grid mix โดยประมาณ)
  WATER: 0.344, // kgCO2e / m3 (ประมาณการ)
  DI_WATER: 0.344,
  CHILLED_WATER: 0.4,
  COMPRESSED_AIR: 0.15,
  NITROGEN: 0.2,
  GAS: 3.0, // kgCO2e / kg (LPG โดยประมาณ)
  STEAM: 0.2,
  DIESEL: 2.68, // kgCO2e / L
};

/**
 * จัดหมวด Scope ตามมาตรฐาน GHG Protocol สำหรับโรงงานอิเล็กทรอนิกส์:
 * - Scope 1 (ปล่อยตรงจากแหล่งที่บริษัทเป็นเจ้าของ): ดีเซล (เครื่องปั่นไฟ),
 *   แก๊ส LPG (เตา Reflow/Wave Soldering), ไอน้ำ (Boiler), ไนโตรเจน (ถ้าผลิต
 *   เองในโรงงานด้วยเครื่อง Nitrogen Generator)
 * - Scope 2 (ไฟฟ้าที่ซื้อจากภายนอก): ไฟฟ้า
 * - Scope 3 (ปล่อยทางอ้อมจากห่วงโซ่อุปทาน เช่น น้ำประปา/น้ำ DI ที่ผ่านการ
 *   บำบัดจากภายนอก, ลมอัดที่นับรวมพลังงานการผลิต/ขนส่งอุปกรณ์)
 *
 * นี่คือการจัดหมวดแบบทั่วไปตามหลักการ ไม่ใช่ผลการประเมินที่บริษัทยืนยันแล้ว
 */
export const SCOPE_MAP: Record<string, "Scope 1" | "Scope 2" | "Scope 3"> = {
  DIESEL: "Scope 1",
  GAS: "Scope 1",
  STEAM: "Scope 1",
  NITROGEN: "Scope 1",
  ELECTRICITY: "Scope 2",
  WATER: "Scope 3",
  DI_WATER: "Scope 3",
  CHILLED_WATER: "Scope 3",
  COMPRESSED_AIR: "Scope 3",
};

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

/**
 * แกนกลางที่ใช้ร่วมกัน: สรุปยอดรวม + % เปลี่ยนแปลง + แนวโน้มรายวันแยกตามแผนก +
 * สัดส่วนแยกตามแผนก สำหรับ "กลุ่มประเภททรัพยากร" ที่กำหนด (เช่น พลังงาน =
 * [ELECTRICITY], น้ำ = [WATER, DI_WATER, CHILLED_WATER])
 * ใช้ทั้งใน Overview (energy/water) และหน้ารายละเอียดแยก (/manager/energy,
 * /manager/water)
 */
export async function computeResourceMetrics(
  companyId: number | null,
  resourceTypes: ResourceType[],
  startDate: Date,
  endDate: Date,
  unit: string,
): Promise<ResourceDetailData> {
  if (companyId === null) {
    return { total: 0, unit, changePct: 0, trend: [], departments: [], breakdown: [], lastUpdatedAt: null };
  }

  const rangeDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - rangeDays);
  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [currentRecords, previousRecords, latestRecord] = await Promise.all([
    prisma.resourceRecord.findMany({
      where: { recordedAt: { gte: startDate, lte: endOfDay }, equipment: { companyId, resourceType: { in: resourceTypes } } },
      select: { value: true, recordedAt: true, equipment: { select: { department: true } } },
    }),
    prisma.resourceRecord.findMany({
      where: { recordedAt: { gte: prevStart, lte: prevEnd }, equipment: { companyId, resourceType: { in: resourceTypes } } },
      select: { value: true },
    }),
    prisma.resourceRecord.findFirst({
      where: { equipment: { companyId, resourceType: { in: resourceTypes } } },
      orderBy: { recordedAt: "desc" },
      select: { recordedAt: true },
    }),
  ]);

  const sum = (records: { value: number }[]) => records.reduce((s, r) => s + r.value, 0);
  const currentTotal = sum(currentRecords);
  const previousTotal = sum(previousRecords);

  const departmentSet = new Set<string>();
  const trendMap = new Map<string, Record<string, number>>();
  const deptTotals = new Map<string, number>();

  for (const rec of currentRecords) {
    const dept = rec.equipment.department ?? "ไม่ระบุแผนก";
    departmentSet.add(dept);
    deptTotals.set(dept, (deptTotals.get(dept) ?? 0) + rec.value);

    const dateKey = rec.recordedAt.toISOString().slice(0, 10);
    const dayEntry = trendMap.get(dateKey) ?? {};
    dayEntry[dept] = (dayEntry[dept] ?? 0) + rec.value;
    trendMap.set(dateKey, dayEntry);
  }

  const departments = Array.from(departmentSet);
  const trend: TrendPoint[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, values]) => ({
      dateLabel: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(dateKey)),
      ...values,
    }));

  const breakdown: DepartmentShare[] = Array.from(deptTotals.entries())
    .map(([department, value]) => ({
      department,
      value: Math.round(value * 100) / 100,
      percent: currentTotal > 0 ? Math.round((value / currentTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    total: Math.round(currentTotal * 100) / 100,
    unit,
    changePct: pctChange(currentTotal, previousTotal),
    trend,
    departments,
    breakdown,
    lastUpdatedAt: latestRecord?.recordedAt.toISOString() ?? null,
  };
}

/**
 * สรุปข้อมูลจริงสำหรับ Manager Overview: พลังงาน + น้ำ รวมกันในเรียกเดียว
 * (ของเสีย, Carbon, OEE, คุณภาพอากาศ ไม่มีอยู่ในนี้เพราะไม่มี schema รองรับ —
 * ทำเป็น mock ในหน้า UI แทน ดู MANAGER_DASHBOARD_NOTES.md)
 */
export async function getManagerDashboardData(companyId: number | null, startDate: Date, endDate: Date): Promise<ManagerDashboardData> {
  const [energyDetail, waterDetail] = await Promise.all([
    computeResourceMetrics(companyId, ENERGY_TYPES, startDate, endDate, "kWh"),
    computeResourceMetrics(companyId, WATER_TYPES, startDate, endDate, "m³"),
  ]);

  return {
    energy: { total: energyDetail.total, unit: energyDetail.unit, changePct: energyDetail.changePct },
    water: { total: waterDetail.total, unit: waterDetail.unit, changePct: waterDetail.changePct },
    trend: energyDetail.trend,
    departments: energyDetail.departments,
    breakdown: energyDetail.breakdown,
    lastUpdatedAt: energyDetail.lastUpdatedAt,
  };
}

export interface DepartmentSummary {
  department: string;
  equipmentCount: number;
  energyTotal: number;
  waterTotal: number;
}

/**
 * สรุปรายแผนก: จำนวนเครื่องจักร + ยอดพลังงาน/น้ำรวมในช่วงที่เลือก (ข้อมูลจริง)
 * ใช้ในหน้า /manager/departments
 */
export async function getDepartmentSummaries(companyId: number | null, startDate: Date, endDate: Date): Promise<DepartmentSummary[]> {
  if (companyId === null) return [];

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [equipmentList, records] = await Promise.all([
    prisma.equipment.findMany({ where: { companyId }, select: { department: true } }),
    prisma.resourceRecord.findMany({
      where: { recordedAt: { gte: startDate, lte: endOfDay }, equipment: { companyId } },
      select: { value: true, equipment: { select: { department: true, resourceType: true } } },
    }),
  ]);

  const summaryMap = new Map<string, DepartmentSummary>();
  const ensure = (dept: string) => {
    if (!summaryMap.has(dept)) summaryMap.set(dept, { department: dept, equipmentCount: 0, energyTotal: 0, waterTotal: 0 });
    return summaryMap.get(dept)!;
  };

  for (const eq of equipmentList) {
    ensure(eq.department ?? "ไม่ระบุแผนก").equipmentCount += 1;
  }
  for (const rec of records) {
    const entry = ensure(rec.equipment.department ?? "ไม่ระบุแผนก");
    if (ENERGY_TYPES.includes(rec.equipment.resourceType)) entry.energyTotal += rec.value;
    if (WATER_TYPES.includes(rec.equipment.resourceType)) entry.waterTotal += rec.value;
  }

  return Array.from(summaryMap.values())
    .map((d) => ({ ...d, energyTotal: Math.round(d.energyTotal * 100) / 100, waterTotal: Math.round(d.waterTotal * 100) / 100 }))
    .sort((a, b) => b.equipmentCount - a.equipmentCount);
}

export interface CarbonBreakdownItem {
  resourceType: string;
  label: string;
  usageValue: number;
  unit: string;
  carbonKg: number;
  percent: number;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
}

export interface ScopeTotal {
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  carbonKg: number;
  percent: number;
}

export interface CarbonFootprintData {
  totalKgCO2e: number;
  changePct: number;
  breakdown: CarbonBreakdownItem[];
  scopeTotals: ScopeTotal[];
  lastUpdatedAt: string | null;
}

/**
 * คำนวณ Carbon Footprint จริงจากข้อมูลการใช้ทรัพยากรจริง คูณด้วยค่าสัมประสิทธิ์
 * ประมาณการ (EMISSION_FACTORS_KGCO2E) — "จริง" ในแง่ที่ยอดการใช้ทรัพยากรมาจาก
 * ResourceRecord จริง แต่ตัวคูณเป็นค่าประมาณ ไม่ใช่ค่าที่บริษัทยืนยันแล้ว
 * (ดูหมายเหตุที่ EMISSION_FACTORS_KGCO2E ด้านบน)
 */
export async function getCarbonFootprint(companyId: number | null, startDate: Date, endDate: Date): Promise<CarbonFootprintData> {
  if (companyId === null) {
    return { totalKgCO2e: 0, changePct: 0, breakdown: [], scopeTotals: [], lastUpdatedAt: null };
  }

  const rangeDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - rangeDays);
  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [currentRecords, previousRecords, latestRecord] = await Promise.all([
    prisma.resourceRecord.findMany({
      where: { recordedAt: { gte: startDate, lte: endOfDay }, equipment: { companyId } },
      select: { value: true, unit: true, equipment: { select: { resourceType: true } } },
    }),
    prisma.resourceRecord.findMany({
      where: { recordedAt: { gte: prevStart, lte: prevEnd }, equipment: { companyId } },
      select: { value: true, equipment: { select: { resourceType: true } } },
    }),
    prisma.resourceRecord.findFirst({ where: { equipment: { companyId } }, orderBy: { recordedAt: "desc" }, select: { recordedAt: true } }),
  ]);

  function toCarbonTotal(records: { value: number; equipment: { resourceType: string } }[]) {
    return records.reduce((sum, r) => sum + r.value * (EMISSION_FACTORS_KGCO2E[r.equipment.resourceType] ?? 0), 0);
  }

  const currentCarbon = toCarbonTotal(currentRecords);
  const previousCarbon = toCarbonTotal(previousRecords);

  const usageByType = new Map<string, { value: number; unit: string }>();
  for (const rec of currentRecords) {
    const key = rec.equipment.resourceType;
    const entry = usageByType.get(key) ?? { value: 0, unit: rec.unit };
    entry.value += rec.value;
    usageByType.set(key, entry);
  }

  const breakdown: CarbonBreakdownItem[] = Array.from(usageByType.entries())
    .map(([resourceType, { value, unit }]) => {
      const carbonKg = value * (EMISSION_FACTORS_KGCO2E[resourceType] ?? 0);
      return {
        resourceType,
        label: resourceType,
        usageValue: Math.round(value * 100) / 100,
        unit,
        carbonKg: Math.round(carbonKg * 100) / 100,
        percent: currentCarbon > 0 ? Math.round((carbonKg / currentCarbon) * 1000) / 10 : 0,
        scope: SCOPE_MAP[resourceType] ?? "Scope 3",
      };
    })
    .sort((a, b) => b.carbonKg - a.carbonKg);

  const scopeTotalsMap = new Map<"Scope 1" | "Scope 2" | "Scope 3", number>();
  for (const item of breakdown) {
    scopeTotalsMap.set(item.scope, (scopeTotalsMap.get(item.scope) ?? 0) + item.carbonKg);
  }
  const scopeTotals: ScopeTotal[] = (["Scope 1", "Scope 2", "Scope 3"] as const)
    .map((scope) => {
      const carbonKg = Math.round((scopeTotalsMap.get(scope) ?? 0) * 100) / 100;
      return { scope, carbonKg, percent: currentCarbon > 0 ? Math.round((carbonKg / currentCarbon) * 1000) / 10 : 0 };
    })
    .filter((s) => s.carbonKg > 0);

  return {
    totalKgCO2e: Math.round(currentCarbon * 100) / 100,
    changePct: pctChange(currentCarbon, previousCarbon),
    breakdown,
    scopeTotals,
    lastUpdatedAt: latestRecord?.recordedAt.toISOString() ?? null,
  };
}

export interface BuildingSummary {
  location: string;
  equipmentCount: number;
  energyTotal: number;
  waterTotal: number;
}

/**
 * สรุปรายอาคาร — ใช้ Equipment.location (เช่น "อาคารผลิต ชั้น 1") แทนแนวคิด
 * "อาคาร A/B/C/D" เพราะระบบยังไม่มีตาราง Building แยกต่างหาก แต่ location
 * ก็เป็นข้อมูลจริงที่กรอกไว้ตอนสร้าง Equipment แต่ละตัว
 */
export async function getBuildingSummaries(companyId: number | null, startDate: Date, endDate: Date): Promise<BuildingSummary[]> {
  if (companyId === null) return [];

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [equipmentList, records] = await Promise.all([
    prisma.equipment.findMany({ where: { companyId }, select: { location: true } }),
    prisma.resourceRecord.findMany({
      where: { recordedAt: { gte: startDate, lte: endOfDay }, equipment: { companyId } },
      select: { value: true, equipment: { select: { location: true, resourceType: true } } },
    }),
  ]);

  const summaryMap = new Map<string, BuildingSummary>();
  const ensure = (loc: string) => {
    if (!summaryMap.has(loc)) summaryMap.set(loc, { location: loc, equipmentCount: 0, energyTotal: 0, waterTotal: 0 });
    return summaryMap.get(loc)!;
  };

  for (const eq of equipmentList) {
    ensure(eq.location || "ไม่ระบุตำแหน่ง").equipmentCount += 1;
  }
  for (const rec of records) {
    const entry = ensure(rec.equipment.location || "ไม่ระบุตำแหน่ง");
    if (ENERGY_TYPES.includes(rec.equipment.resourceType as ResourceType)) entry.energyTotal += rec.value;
    if (WATER_TYPES.includes(rec.equipment.resourceType as ResourceType)) entry.waterTotal += rec.value;
  }

  return Array.from(summaryMap.values())
    .map((b) => ({ ...b, energyTotal: Math.round(b.energyTotal * 100) / 100, waterTotal: Math.round(b.waterTotal * 100) / 100 }))
    .sort((a, b) => b.equipmentCount - a.equipmentCount);
}

export interface ComparisonPeriodResult {
  label: string;
  from: string;
  to: string;
  energy: number;
  water: number;
}

/**
 * เทียบยอดพลังงาน+น้ำระหว่าง 2 ช่วงเวลาที่เลือกเอง (ข้อมูลจริงทั้งคู่)
 * ใช้ในหน้า /manager/overview/compare
 */
export async function getComparisonMetrics(
  companyId: number | null,
  periods: { label: string; from: Date; to: Date }[],
): Promise<ComparisonPeriodResult[]> {
  const results = await Promise.all(
    periods.map(async (p) => {
      const endOfDay = new Date(p.to);
      endOfDay.setHours(23, 59, 59, 999);

      if (companyId === null) {
        return { label: p.label, from: p.from.toISOString().slice(0, 10), to: p.to.toISOString().slice(0, 10), energy: 0, water: 0 };
      }

      const records = await prisma.resourceRecord.findMany({
        where: { recordedAt: { gte: p.from, lte: endOfDay }, equipment: { companyId } },
        select: { value: true, equipment: { select: { resourceType: true } } },
      });

      const energy = records.filter((r) => ENERGY_TYPES.includes(r.equipment.resourceType as ResourceType)).reduce((s, r) => s + r.value, 0);
      const water = records.filter((r) => WATER_TYPES.includes(r.equipment.resourceType as ResourceType)).reduce((s, r) => s + r.value, 0);

      return {
        label: p.label,
        from: p.from.toISOString().slice(0, 10),
        to: p.to.toISOString().slice(0, 10),
        energy: Math.round(energy * 100) / 100,
        water: Math.round(water * 100) / 100,
      };
    }),
  );

  return results;
}

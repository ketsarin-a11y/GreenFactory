import "server-only";
import { prisma } from "@/lib/prisma";
import { RESOURCE_META } from "@/lib/resource-meta";

export interface EquipmentListItem {
  equipmentId: number;
  name: string;
  equipmentCode: string | null;
  equipmentType: string | null;
  productionLine: string | null;
  department: string | null;
  location: string;
  status: string;
  resourceType: string;
  resourceUnit: string;
}

/**
 * รายการเครื่องจักร/จุดตรวจของบริษัทนี้ (ใช้แสดงในตาราง "เลือกเครื่องจักร/จุดตรวจ")
 * search ค้นจากชื่อเครื่อง, รหัสเครื่อง, ประเภทเครื่องจักร (แบบ contains)
 */
export async function getEquipmentList(companyId: number | null, search?: string): Promise<EquipmentListItem[]> {
  if (companyId === null) return [];

  const equipment = await prisma.equipment.findMany({
    where: {
      companyId,
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { equipmentCode: { contains: search } },
              { equipmentType: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return equipment.map((eq) => ({
    equipmentId: eq.equipmentId,
    name: eq.name,
    equipmentCode: eq.equipmentCode,
    equipmentType: eq.equipmentType,
    productionLine: eq.productionLine,
    department: eq.department,
    location: eq.location,
    status: eq.status,
    resourceType: eq.resourceType,
    resourceUnit: RESOURCE_META[eq.resourceType]?.unit ?? "",
  }));
}

export interface TodayUsageTotal {
  key: string;
  label: string;
  unit: string;
  total: number;
  recordCount: number;
}

/**
 * สรุปยอดที่บันทึกไปแล้ว "วันนี้" ของทั้งบริษัท แยกตามประเภททรัพยากร
 * (การ์ด "สรุปการบันทึกวันนี้" ฝั่งขวาของหน้า)
 */
export async function getTodayUsageTotals(companyId: number | null): Promise<TodayUsageTotal[]> {
  if (companyId === null) return [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const records = await prisma.resourceRecord.findMany({
    where: {
      recordedAt: { gte: startOfToday, lte: endOfToday },
      equipment: { companyId },
    },
    select: { value: true, equipment: { select: { resourceType: true } } },
  });

  const totals = new Map<string, { total: number; count: number }>();
  for (const rec of records) {
    const key = rec.equipment.resourceType;
    const current = totals.get(key) ?? { total: 0, count: 0 };
    totals.set(key, { total: current.total + rec.value, count: current.count + 1 });
  }

  return Array.from(totals.entries()).map(([key, agg]) => ({
    key: key.toLowerCase(),
    label: RESOURCE_META[key]?.label ?? key,
    unit: RESOURCE_META[key]?.unit ?? "",
    total: Math.round(agg.total * 100) / 100,
    recordCount: agg.count,
  }));
}

export interface CreateRecordInput {
  equipmentId: number;
  recordedById: number;
  companyId: number;
  value: number;
  recordedAt: Date;
  note?: string;
  attachmentUrl?: string | null;
}

/**
 * บันทึกการใช้ทรัพยากรใหม่ 1 รายการ
 * ตรวจก่อนว่า equipment ที่เลือกเป็นของบริษัทเดียวกับผู้บันทึกจริง (กัน company อื่นยิงข้าม)
 */
export async function createResourceRecord(input: CreateRecordInput) {
  const equipment = await prisma.equipment.findFirst({
    where: { equipmentId: input.equipmentId, companyId: input.companyId },
  });

  if (!equipment) {
    throw new Error("ไม่พบเครื่องจักร/จุดตรวจนี้ในบริษัทของคุณ");
  }

  const unit = RESOURCE_META[equipment.resourceType]?.unit ?? "";

  return prisma.resourceRecord.create({
    data: {
      equipmentId: input.equipmentId,
      recordedById: input.recordedById,
      value: input.value,
      unit,
      note: input.note?.trim() || null,
      attachmentUrl: input.attachmentUrl ?? null,
      status: "RECORDED",
      recordedAt: input.recordedAt,
    },
  });
}
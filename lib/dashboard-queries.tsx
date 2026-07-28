import "server-only";
import { prisma } from "@/lib/prisma";
import type { TodayTaskSummary, RecentRecord, ResourceIcon, TaskCategory } from "@/constants/dashboard";

// map ResourceType (DB) -> ไอคอน + label ที่ใช้แสดงผล
const RESOURCE_META: Record<string, { label: string; icon: ResourceIcon; unit: string }> = {
  ELECTRICITY: { label: "ไฟฟ้า (Electricity)", icon: "zap", unit: "kWh" },
  WATER: { label: "น้ำ (Water)", icon: "droplet", unit: "m³" },
  GAS: { label: "แก๊ส (Gas)", icon: "flame", unit: "kg" },
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * งานที่ต้องบันทึกวันนี้ = เครื่องจักร/อุปกรณ์ (Equipment) ของบริษัทนี้ ที่ยัง "ไม่มี"
 * ResourceRecord ของวันนี้ ถูกจัดกลุ่มตามประเภททรัพยากร (ไฟฟ้า/น้ำ/แก๊ส)
 *
 * companyId เป็น null ได้ (user บาง account ไม่ผูกกับบริษัท) — กรณีนั้นจะคืนค่าว่าง
 */
export async function getTodayTaskSummary(companyId: number | null): Promise<TodayTaskSummary> {
  if (companyId === null) {
    return { totalCount: 0, categories: [] };
  }

  const equipmentList = await prisma.equipment.findMany({
    where: { companyId, isActive: true },
    select: {
      equipmentId: true,
      resourceType: true,
      records: {
        where: { recordedAt: { gte: startOfToday(), lte: endOfToday() } },
        select: { recordId: true },
        take: 1,
      },
    },
  });

  const pendingByType = new Map<string, number>();
  for (const eq of equipmentList) {
    const alreadyRecordedToday = eq.records.length > 0;
    if (alreadyRecordedToday) continue;
    pendingByType.set(eq.resourceType, (pendingByType.get(eq.resourceType) ?? 0) + 1);
  }

  const categories: TaskCategory[] = Object.entries(RESOURCE_META)
    .map(([key, meta]) => ({
      key: key.toLowerCase(),
      label: meta.label,
      icon: meta.icon,
      count: pendingByType.get(key) ?? 0,
    }))
    .filter((cat) => cat.count > 0);

  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return { totalCount, categories };
}

/**
 * บันทึกล่าสุดของผู้ใช้คนนั้นๆ เรียงจากล่าสุดไปเก่าสุด
 */
export async function getRecentRecords(userId: number, limit = 5): Promise<RecentRecord[]> {
  const records = await prisma.resourceRecord.findMany({
    where: { recordedById: userId },
    orderBy: { recordedAt: "desc" },
    take: limit,
    include: { equipment: true },
  });

  return records.map((rec) => {
    const meta = RESOURCE_META[rec.equipment.resourceType] ?? RESOURCE_META.ELECTRICITY;
    return {
      id: String(rec.recordId),
      equipment: rec.equipment.name,
      location: rec.equipment.location,
      icon: meta.icon,
      iconColor: iconColorFor(meta.icon),
      dateLabel: formatThaiDateTime(rec.recordedAt),
      status: rec.status === "RECORDED" ? "บันทึกแล้ว" : "รอบันทึก",
    };
  });
}

function iconColorFor(icon: ResourceIcon): RecentRecord["iconColor"] {
  switch (icon) {
    case "zap":
      return "amber";
    case "droplet":
      return "blue";
    case "flame":
      return "purple";
    default:
      return "slate";
  }
}

function formatThaiDateTime(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
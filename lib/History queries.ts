import "server-only";
import { prisma } from "@/lib/prisma";
import { RESOURCE_META } from "@/lib/resource-meta";

export interface HistoryRecordItem {
  recordId: number;
  recordedAt: string; // ISO string (แปลงเป็น string เพื่อส่งจาก Server Component ไป Client Component ได้ตรงๆ)
  equipmentId: number;
  equipmentName: string;
  equipmentCode: string | null;
  equipmentType: string | null;
  productionLine: string | null;
  department: string | null;
  resourceType: string;
  resourceLabel: string;
  unit: string;
  value: number;
  recordedById: number;
  recordedByName: string;
  status: string; // RECORDED | PENDING (ดู หมายเหตุ ท้ายไฟล์)
  note: string | null;
  attachmentUrl: string | null;
}

export interface HistoryFilterOptions {
  productionLines: string[];
  departments: string[];
  equipmentTypes: string[];
  units: string[];
  recorders: { id: number; name: string }[];
}

/**
 * ดึงบันทึกทั้งหมดของบริษัทนี้ (join equipment + ผู้บันทึก) แล้วกรอง/แบ่งหน้าฝั่ง client
 * เหมือนแพทเทิร์นเดียวกับหน้า "บันทึกการใช้ทรัพยากร" — เหมาะกับข้อมูลระดับพันรายการ
 * ถ้าข้อมูลเยอะกว่านี้มากในอนาคต ค่อยเปลี่ยนเป็น filter/paginate ฝั่ง server แทน
 */
export async function getAllHistoryRecords(companyId: number | null): Promise<HistoryRecordItem[]> {
  if (companyId === null) return [];

  const records = await prisma.resourceRecord.findMany({
    where: { equipment: { companyId } },
    orderBy: { recordedAt: "desc" },
    include: { equipment: true, recordedBy: true },
  });

  return records.map((rec) => {
    const meta = RESOURCE_META[rec.equipment.resourceType];
    return {
      recordId: rec.recordId,
      recordedAt: rec.recordedAt.toISOString(),
      equipmentId: rec.equipmentId,
      equipmentName: rec.equipment.name,
      equipmentCode: rec.equipment.equipmentCode,
      equipmentType: rec.equipment.equipmentType,
      productionLine: rec.equipment.productionLine,
      department: rec.equipment.department,
      resourceType: rec.equipment.resourceType,
      resourceLabel: meta?.label ?? rec.equipment.resourceType,
      unit: rec.unit,
      value: rec.value,
      recordedById: rec.recordedById,
      recordedByName: `${rec.recordedBy.firstName} ${rec.recordedBy.lastName}`.trim(),
      status: rec.status,
      note: rec.note,
      attachmentUrl: rec.attachmentUrl,
    };
  });
}

export async function getHistoryFilterOptions(companyId: number | null): Promise<HistoryFilterOptions> {
  if (companyId === null) {
    return { productionLines: [], departments: [], equipmentTypes: [], units: [], recorders: [] };
  }

  const [equipmentList, records] = await Promise.all([
    prisma.equipment.findMany({ where: { companyId }, select: { productionLine: true, department: true, equipmentType: true } }),
    prisma.resourceRecord.findMany({
      where: { equipment: { companyId } },
      select: { unit: true, recordedBy: { select: { userId: true, firstName: true, lastName: true } } },
      distinct: ["recordedById"],
    }),
  ]);

  const productionLines = [...new Set(equipmentList.map((e) => e.productionLine).filter((v): v is string => Boolean(v)))];
  const departments = [...new Set(equipmentList.map((e) => e.department).filter((v): v is string => Boolean(v)))];
  const equipmentTypes = [...new Set(equipmentList.map((e) => e.equipmentType).filter((v): v is string => Boolean(v)))];
  const units = [...new Set(records.map((r) => r.unit))];
  const recorders = records.map((r) => ({
    id: r.recordedBy.userId,
    name: `${r.recordedBy.firstName} ${r.recordedBy.lastName}`.trim(),
  }));

  return { productionLines, departments, equipmentTypes, units, recorders };
}

/**
 * หมายเหตุเรื่องสถานะ:
 * enum RecordStatus ตอนนี้มีแค่ PENDING / RECORDED (แปลว่า "ยังไม่บันทึก" / "บันทึกแล้ว")
 * mockup หน้านี้มี 3 สถานะ: บันทึกแล้ว / รออนุมัติ / ปฏิเสธ ซึ่งเป็น "ระบบอนุมัติ" (approval
 * workflow) ที่ยังไม่มีใน schema ปัจจุบัน — หน้านี้เลยแสดงแค่ 2 สถานะที่มีจริง
 * (RECORDED -> "บันทึกแล้ว", PENDING -> "รออนุมัติ") และไม่มีการ์ด "ปฏิเสธ"
 * ถ้าต้องการระบบอนุมัติจริง (Supervisor กดอนุมัติ/ปฏิเสธ) บอกได้ จะออกแบบ schema เพิ่มให้
 * (เช่นเพิ่ม APPROVED/REJECTED ใน enum + field approvedById/approvedAt)
 */
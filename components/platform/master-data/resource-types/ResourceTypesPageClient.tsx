"use client";

import { Ban, Database, Leaf, Zap } from "lucide-react";
import MasterDataPage from "../common/MasterDataPage";
import type { MasterColumn } from "../common/types";
import { MOCK_ITEMS } from "./mock";

const columns: MasterColumn[] = [
  { key: "name", label: "ชื่อทรัพยากร" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "หมวดหมู่" },
  { key: "unit", label: "หน่วย" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "รายการใช้งาน" },
  { key: "status", label: "สถานะ" }
];

const stats = [
  {
    label: "ประเภททรัพยากร",
    value: 16,
    unit: "ประเภท",
    helper: "ครอบคลุม 5 หมวดหมู่",
    icon: <Zap className="h-5 w-5" />,
    iconClassName: "bg-[#fff4e5] text-[#d28718]",
  },
  {
    label: "รายการใช้งาน",
    value: 314,
    unit: "รายการ",
    helper: "เดือนนี้ 76 รายการ",
    icon: <Database className="h-5 w-5" />,
    iconClassName: "bg-[#eaf3ff] text-[#3478da]",
  },
  {
    label: "เชื่อม Factor",
    value: 13,
    unit: "ประเภท",
    helper: "พร้อมคำนวณ",
    icon: <Leaf className="h-5 w-5" />,
    iconClassName: "bg-[#eaf7f1] text-[#168662]",
  },
  {
    label: "ไม่ใช้งาน",
    value: 1,
    unit: "ประเภท",
    helper: "รอตรวจสอบ",
    icon: <Ban className="h-5 w-5" />,
    iconClassName: "bg-[#fff0f1] text-[#d65a66]",
  }
];

export function ResourceTypesPageClient() {
  return (
    <MasterDataPage
      title="ประเภททรัพยากร"
      description="กำหนดประเภททรัพยากรสำหรับ RESOURCE_USAGE พร้อมหมวดหมู่ หน่วย และ Emission Factor"
      actionLabel="เพิ่มประเภททรัพยากร"
      drawerTitle="รายละเอียดประเภททรัพยากร"
      iconType="resource"
      rows={MOCK_ITEMS}
      columns={columns}
      stats={stats}
      categoryLabel="หมวดหมู่ทรัพยากรทั้งหมด"
    />
  );
}

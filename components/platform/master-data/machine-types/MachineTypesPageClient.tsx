"use client";

import { Activity, Ban, CheckCircle2, Factory } from "lucide-react";
import MasterDataPage from "../common/MasterDataPage";
import type { MasterColumn } from "../common/types";
import { MOCK_ITEMS } from "./mock";

const columns: MasterColumn[] = [
  { key: "name", label: "ชื่อเครื่องจักร" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "หมวดหมู่" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "จุดตรวจ" },
  { key: "status", label: "สถานะ" }
];

const stats = [
  {
    label: "ประเภททั้งหมด",
    value: 24,
    unit: "ประเภท",
    helper: "เพิ่มขึ้น 2 ประเภท",
    icon: <Factory className="h-5 w-5" />,
    iconClassName: "bg-[#eaf7f1] text-[#168662]",
  },
  {
    label: "จุดตรวจทั้งหมด",
    value: 58,
    unit: "จุด",
    helper: "ใช้งานอยู่ 52 จุด",
    icon: <Activity className="h-5 w-5" />,
    iconClassName: "bg-[#eaf3ff] text-[#3478da]",
  },
  {
    label: "ใช้งานอยู่",
    value: 22,
    unit: "รายการ",
    helper: "พร้อมใช้งาน",
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconClassName: "bg-[#fff4e5] text-[#d28718]",
  },
  {
    label: "ไม่ใช้งาน",
    value: 2,
    unit: "รายการ",
    helper: "รอตรวจสอบ",
    icon: <Ban className="h-5 w-5" />,
    iconClassName: "bg-[#fff0f1] text-[#d65a66]",
  }
];

export function MachineTypesPageClient() {
  return (
    <MasterDataPage
      title="ประเภทเครื่องจักรและจุดตรวจ"
      description="จัดการประเภทเครื่องจักร หมวดหมู่ และจำนวนจุดตรวจ เพื่อเชื่อมกับตาราง MACHINE และ INSPECTION_POINT"
      actionLabel="เพิ่มประเภทเครื่องจักร"
      drawerTitle="รายละเอียดประเภทเครื่องจักร"
      iconType="machine"
      rows={MOCK_ITEMS}
      columns={columns}
      stats={stats}
      categoryLabel="หมวดหมู่ทั้งหมด"
    />
  );
}

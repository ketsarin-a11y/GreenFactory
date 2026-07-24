"use client";

import { Ban, RadioTower, Ruler, Waves } from "lucide-react";
import MasterDataPage from "../common/MasterDataPage";
import type { MasterColumn } from "../common/types";
import { MOCK_ITEMS } from "./mock";

const columns: MasterColumn[] = [
  { key: "name", label: "ชื่อเซนเซอร์" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "กลุ่ม" },
  { key: "unit", label: "หน่วย" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "จำนวนเซนเซอร์" },
  { key: "status", label: "สถานะ" }
];

const stats = [
  {
    label: "ประเภทเซนเซอร์",
    value: 18,
    unit: "ประเภท",
    helper: "เพิ่มขึ้น 3 ประเภท",
    icon: <Waves className="h-5 w-5" />,
    iconClassName: "bg-[#eaf3ff] text-[#3478da]",
  },
  {
    label: "เซนเซอร์เชื่อมโยง",
    value: 94,
    unit: "ตัว",
    helper: "ออนไลน์ 86 ตัว",
    icon: <RadioTower className="h-5 w-5" />,
    iconClassName: "bg-[#eaf7f1] text-[#168662]",
  },
  {
    label: "หน่วยวัด",
    value: 12,
    unit: "หน่วย",
    helper: "ครอบคลุมทุกประเภท",
    icon: <Ruler className="h-5 w-5" />,
    iconClassName: "bg-[#f2edff] text-[#7c56c4]",
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

export function SensorTypesPageClient() {
  return (
    <MasterDataPage
      title="ประเภทเซนเซอร์"
      description="จัดการชนิดเซนเซอร์ หน่วยวัด และจำนวนเซนเซอร์ที่เชื่อมโยงกับตาราง SENSOR"
      actionLabel="เพิ่มประเภทเซนเซอร์"
      drawerTitle="รายละเอียดประเภทเซนเซอร์"
      iconType="sensor"
      rows={MOCK_ITEMS}
      columns={columns}
      stats={stats}
      categoryLabel="กลุ่มเซนเซอร์ทั้งหมด"
    />
  );
}

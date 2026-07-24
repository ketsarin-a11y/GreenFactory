"use client";

import { Ban, CheckCircle2, Database, Ruler } from "lucide-react";
import MasterDataPage from "../common/MasterDataPage";
import type { MasterColumn } from "../common/types";
import { MOCK_ITEMS } from "./mock";

const columns: MasterColumn[] = [
  { key: "name", label: "ชื่อหน่วย" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "กลุ่มมิติ" },
  { key: "unit", label: "สัญลักษณ์" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "การอ้างอิง" },
  { key: "status", label: "สถานะ" }
];

const stats = [
  {
    label: "หน่วยวัดทั้งหมด",
    value: 22,
    unit: "หน่วย",
    helper: "ครอบคลุม 7 กลุ่ม",
    icon: <Ruler className="h-5 w-5" />,
    iconClassName: "bg-[#e9f8f7] text-[#118b8a]",
  },
  {
    label: "ถูกใช้งาน",
    value: 19,
    unit: "หน่วย",
    helper: "อ้างอิงในข้อมูลจริง",
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconClassName: "bg-[#eaf7f1] text-[#168662]",
  },
  {
    label: "การอ้างอิง",
    value: 50,
    unit: "จุด",
    helper: "จากเซนเซอร์และทรัพยากร",
    icon: <Database className="h-5 w-5" />,
    iconClassName: "bg-[#eaf3ff] text-[#3478da]",
  },
  {
    label: "ไม่ใช้งาน",
    value: 3,
    unit: "หน่วย",
    helper: "รอตรวจสอบ",
    icon: <Ban className="h-5 w-5" />,
    iconClassName: "bg-[#fff0f1] text-[#d65a66]",
  }
];

export function UnitsPageClient() {
  return (
    <MasterDataPage
      title="หน่วยวัด"
      description="กำหนดหน่วยมาตรฐานสำหรับ SENSOR_DATA, RESOURCE_USAGE และ EMISSION_FACTOR"
      actionLabel="เพิ่มหน่วยวัด"
      drawerTitle="รายละเอียดหน่วยวัด"
      iconType="unit"
      rows={MOCK_ITEMS}
      columns={columns}
      stats={stats}
      categoryLabel="กลุ่มมิติทั้งหมด"
    />
  );
}

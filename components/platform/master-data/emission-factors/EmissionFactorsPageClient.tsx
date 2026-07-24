"use client";

import { Database, Factory, Leaf, Zap } from "lucide-react";
import MasterDataPage from "../common/MasterDataPage";
import type { MasterColumn } from "../common/types";
import { MOCK_ITEMS } from "./mock";

const columns: MasterColumn[] = [
  { key: "name", label: "ชื่อรายการ" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "Scope" },
  { key: "value", label: "ค่า Factor" },
  { key: "unit", label: "หน่วย" },
  { key: "source", label: "แหล่งอ้างอิง" },
  { key: "status", label: "สถานะ" }
];

const stats = [
  {
    label: "Emission Factor",
    value: 42,
    unit: "รายการ",
    helper: "อัปเดตล่าสุด 6 รายการ",
    icon: <Leaf className="h-5 w-5" />,
    iconClassName: "bg-[#eaf7f1] text-[#168662]",
  },
  {
    label: "Scope 1",
    value: 18,
    unit: "รายการ",
    helper: "การปล่อยโดยตรง",
    icon: <Factory className="h-5 w-5" />,
    iconClassName: "bg-[#fff4e5] text-[#d28718]",
  },
  {
    label: "Scope 2",
    value: 8,
    unit: "รายการ",
    helper: "พลังงานที่ซื้อ",
    icon: <Zap className="h-5 w-5" />,
    iconClassName: "bg-[#eaf3ff] text-[#3478da]",
  },
  {
    label: "Scope 3",
    value: 16,
    unit: "รายการ",
    helper: "กิจกรรมทางอ้อม",
    icon: <Database className="h-5 w-5" />,
    iconClassName: "bg-[#f2edff] text-[#7c56c4]",
  }
];

export function EmissionFactorsPageClient() {
  return (
    <MasterDataPage
      title="ค่า Emission Factor"
      description="จัดการค่าปัจจัยการปล่อยตามทรัพยากร Scope หน่วย และแหล่งอ้างอิง เพื่อใช้คำนวณ CARBON_RESULT"
      actionLabel="เพิ่ม Emission Factor"
      drawerTitle="รายละเอียด Emission Factor"
      iconType="emission"
      rows={MOCK_ITEMS}
      columns={columns}
      stats={stats}
      categoryLabel="Scope ทั้งหมด"
    />
  );
}

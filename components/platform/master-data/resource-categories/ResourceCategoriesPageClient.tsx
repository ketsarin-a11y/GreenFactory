"use client";

import { Boxes, Factory, Leaf, Zap } from "lucide-react";
import MasterDataPage from "../common/MasterDataPage";
import type { MasterColumn } from "../common/types";
import { MOCK_ITEMS } from "./mock";

const columns: MasterColumn[] = [
  { key: "name", label: "ชื่อหมวดหมู่" },
  { key: "code", label: "รหัส" },
  { key: "category", label: "Scope" },
  { key: "description", label: "คำอธิบาย" },
  { key: "relatedCount", label: "ประเภททรัพยากร" },
  { key: "status", label: "สถานะ" }
];

const stats = [
  {
    label: "หมวดหมู่ทั้งหมด",
    value: 6,
    unit: "หมวดหมู่",
    helper: "ใช้งานอยู่ 5 หมวดหมู่",
    icon: <Boxes className="h-5 w-5" />,
    iconClassName: "bg-[#f2edff] text-[#7c56c4]",
  },
  {
    label: "Scope 1",
    value: 2,
    unit: "หมวดหมู่",
    helper: "การปล่อยโดยตรง",
    icon: <Factory className="h-5 w-5" />,
    iconClassName: "bg-[#eaf7f1] text-[#168662]",
  },
  {
    label: "Scope 2",
    value: 1,
    unit: "หมวดหมู่",
    helper: "พลังงานที่ซื้อ",
    icon: <Zap className="h-5 w-5" />,
    iconClassName: "bg-[#fff4e5] text-[#d28718]",
  },
  {
    label: "Scope 3",
    value: 3,
    unit: "หมวดหมู่",
    helper: "กิจกรรมทางอ้อม",
    icon: <Leaf className="h-5 w-5" />,
    iconClassName: "bg-[#eaf3ff] text-[#3478da]",
  }
];

export function ResourceCategoriesPageClient() {
  return (
    <MasterDataPage
      title="หมวดหมู่ทรัพยากร"
      description="จัดกลุ่ม RESOURCE_TYPE เพื่อใช้ในรายงาน การค้นหา และการคำนวณคาร์บอนตาม Scope"
      actionLabel="เพิ่มหมวดหมู่ทรัพยากร"
      drawerTitle="รายละเอียดหมวดหมู่ทรัพยากร"
      iconType="category"
      rows={MOCK_ITEMS}
      columns={columns}
      stats={stats}
      categoryLabel="Scope ทั้งหมด"
    />
  );
}

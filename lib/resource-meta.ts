import { Zap, Droplet, Droplets, Snowflake, Wind, Atom, Flame, Waves, Fuel, type LucideIcon } from "lucide-react";
import type { ResourceIcon } from "@/constants/dashboard";

export interface ResourceMeta {
  label: string;
  icon: ResourceIcon;
  unit: string;
  unitLabel: string; // เช่น "kWh (กิโลวัตต์-ชั่วโมง)"
}

// ประเภททรัพยากรทั้งหมดที่ระบบรองรับ — ครอบคลุม utility ของโรงงานอิเล็กทรอนิกส์
// ตรงกับ enum ResourceType ใน schema.prisma (ดู prisma/resource-type-expansion-update.md)
export const RESOURCE_META: Record<string, ResourceMeta> = {
  ELECTRICITY: { label: "ไฟฟ้า (Electricity)", icon: "zap", unit: "kWh", unitLabel: "kWh (กิโลวัตต์-ชั่วโมง)" },
  WATER: { label: "น้ำประปา (Water)", icon: "droplet", unit: "m3", unitLabel: "m³ (ลูกบาศก์เมตร)" },
  DI_WATER: { label: "น้ำ DI (Deionized Water)", icon: "droplets", unit: "m3", unitLabel: "m³ (ลูกบาศก์เมตร)" },
  CHILLED_WATER: { label: "น้ำเย็น (Chilled Water)", icon: "snowflake", unit: "m3", unitLabel: "m³ (ลูกบาศก์เมตร)" },
  COMPRESSED_AIR: { label: "ลมอัด (Compressed Air)", icon: "wind", unit: "m3", unitLabel: "m³ (ลูกบาศก์เมตร)" },
  NITROGEN: { label: "ไนโตรเจน (Nitrogen)", icon: "atom", unit: "m3", unitLabel: "m³ (ลูกบาศก์เมตร)" },
  GAS: { label: "แก๊ส LPG (Gas)", icon: "flame", unit: "kg", unitLabel: "kg (กิโลกรัม)" },
  STEAM: { label: "ไอน้ำ (Steam)", icon: "waves", unit: "kg", unitLabel: "kg (กิโลกรัม)" },
  DIESEL: { label: "ดีเซล (Diesel)", icon: "fuel", unit: "L", unitLabel: "L (ลิตร)" },
};

// รวม icon component ไว้ที่เดียว — ทุกหน้าที่ต้องโชว์ไอคอนตามประเภททรัพยากร
// ให้ import ตัวนี้แทนการประกาศ ICONS ของตัวเองซ้ำในแต่ละไฟล์
export const RESOURCE_ICONS: Record<ResourceIcon, LucideIcon> = {
  zap: Zap,
  droplet: Droplet,
  droplets: Droplets,
  snowflake: Snowflake,
  wind: Wind,
  atom: Atom,
  flame: Flame,
  waves: Waves,
  fuel: Fuel,
};

export function iconColorFor(icon: ResourceIcon): "amber" | "blue" | "slate" | "purple" {
  switch (icon) {
    case "zap":
      return "amber";
    case "droplet":
    case "droplets":
    case "snowflake":
      return "blue";
    case "flame":
    case "fuel":
    case "waves":
      return "purple";
    default:
      return "slate"; // wind, atom
  }
}

export function formatThaiDateTime(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
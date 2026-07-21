// ไอคอนที่ใช้แทนแต่ละประเภททรัพยากร — ครอบคลุม utility ของโรงงานอิเล็กทรอนิกส์
// (ดูการแมปจริงไปยัง lucide-react component ที่ lib/resource-meta.ts -> RESOURCE_ICONS)
export type ResourceIcon = "zap" | "droplet" | "droplets" | "snowflake" | "wind" | "atom" | "flame" | "waves" | "fuel";

export interface TaskCategory {
  key: string;
  label: string;
  icon: ResourceIcon;
  count: number;
}

export interface TodayTaskSummary {
  totalCount: number;
  categories: TaskCategory[];
}

export interface RecentRecord {
  id: string;
  equipment: string;
  location: string;
  icon: ResourceIcon;
  iconColor: "amber" | "blue" | "slate" | "purple";
  dateLabel: string;
  status: string;
}
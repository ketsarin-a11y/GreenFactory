export type ResourceIcon = "zap" | "droplet" | "flame" | "wind";

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
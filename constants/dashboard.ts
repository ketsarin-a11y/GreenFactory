export type ResourceIcon =
  | "zap"
  | "droplet"
  | "droplets"
  | "snowflake"
  | "wind"
  | "atom"
  | "flame"
  | "waves"
  | "fuel";

export type TaskCategory = {
  key: string;
  label: string;
  icon: ResourceIcon;
  count: number;
};

export type TodayTaskSummary = {
  totalCount: number;
  categories: TaskCategory[];
};

export type RecentRecordIconColor =
  | "amber"
  | "blue"
  | "slate"
  | "purple";

export type RecentRecord = {
  id: string;
  equipment: string;
  location: string;
  icon: ResourceIcon;
  iconColor: RecentRecordIconColor;
  dateLabel: string;
  status: string;
};
export type MasterStatus = "ACTIVE" | "INACTIVE";

export type MasterTone =
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "teal"
  | "rose"
  | "slate";

export type MasterItem = {
  id: number;
  code: string;
  nameTh: string;
  nameEn?: string;
  description: string;
  category?: string;
  unit?: string;
  value?: number;
  source?: string;
  relatedCount?: number;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
  tone: MasterTone;
};

export type MasterColumnKey =
  | "name"
  | "code"
  | "category"
  | "unit"
  | "value"
  | "source"
  | "description"
  | "relatedCount"
  | "status";

export type MasterColumn = {
  key: MasterColumnKey;
  label: string;
};

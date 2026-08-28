export type PermissionLevel = "FULL" | "VIEW" | "NONE";

export type RoleKey =
  | "PLATFORM_ADMIN"
  | "COMPANY_ADMIN"
  | "FACTORY_MANAGER"
  | "ENVIRONMENT_OFFICER";

export type Role = {
  id: number;
  key: RoleKey;
  name: string;
  description: string;
  userCount: number;
  icon: "shield" | "users" | "factory" | "leaf";
  tone: {
    iconBg: string;
    iconText: string;
    activeBg: string;
    activeBorder: string;
  };
};

export type PermissionItem = {
  id: string;
  label: string;
  icon:
    | "dashboard"
    | "chart"
    | "target"
    | "bell"
    | "sparkles"
    | "file"
    | "building"
    | "users"
    | "shield"
    | "settings"
    | "factory"
    | "sensor"
    | "zap"
    | "boxes"
    | "ruler"
    | "leaf"
    | "database"
    | "clipboard"
    | "search";
};

export type PermissionGroup = {
  id: string;
  label: string;
  items: PermissionItem[];
};

export type PermissionMatrixState = Record<
  string,
  Record<RoleKey, PermissionLevel>
>;

import type { PermissionLevel, RoleKey } from "./types";

export const permissionLevelConfig: Record<
  PermissionLevel,
  { label: string; className: string; symbol: string }
> = {
  FULL: {
    label: "เข้าถึงและใช้งานได้",
    className: "bg-[#0f8a5f] text-white ring-[#0f8a5f]",
    symbol: "check",
  },
  VIEW: {
    label: "เข้าถึงได้ (เฉพาะดูข้อมูล)",
    className: "bg-[#3f7cff] text-white ring-[#3f7cff]",
    symbol: "eye",
  },
  NONE: {
    label: "ไม่สามารถเข้าถึงได้",
    className: "bg-[#ef4354] text-white ring-[#ef4354]",
    symbol: "minus",
  },
};

export const roleOrder: RoleKey[] = [
  "PLATFORM_ADMIN",
  "COMPANY_ADMIN",
  "FACTORY_MANAGER",
  "ENVIRONMENT_OFFICER",
];

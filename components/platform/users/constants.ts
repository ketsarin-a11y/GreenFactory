import type { UserRole, UserStatus } from "./types";

export const roleConfig: Record<
  UserRole,
  { label: string; className: string }
> = {
  PLATFORM_ADMIN: {
    label: "Platform Admin",
    className: "bg-[#f1edff] text-[#6f4fc4] ring-[#ddd3fb]",
  },
  COMPANY_ADMIN: {
    label: "Company Admin",
    className: "bg-[#eaf3ff] text-[#3366a4] ring-[#d4e3f8]",
  },
  MANAGER: {
    label: "Manager",
    className: "bg-[#fff4e5] text-[#a66314] ring-[#f2ddb9]",
  },
  OPERATOR: {
    label: "Operator",
    className: "bg-[#eaf8f2] text-[#087a57] ring-[#cdeedf]",
  },
  VIEWER: {
    label: "Viewer",
    className: "bg-[#f1f3f5] text-[#5f6870] ring-[#dde1e5]",
  },
};

export const statusConfig: Record<
  UserStatus,
  { label: string; className: string; dot: string }
> = {
  ACTIVE: {
    label: "ใช้งานอยู่",
    className: "bg-[#eaf8f2] text-[#087a57] ring-[#cdeedf]",
    dot: "bg-[#18a978]",
  },
  SUSPENDED: {
    label: "ระงับการใช้งาน",
    className: "bg-[#fff4e6] text-[#a96512] ring-[#f7dfbd]",
    dot: "bg-[#e59a37]",
  },
  EXPIRED: {
    label: "หมดอายุ",
    className: "bg-[#fff0f1] text-[#b83b4b] ring-[#f4d4d8]",
    dot: "bg-[#dc5b6a]",
  },
};

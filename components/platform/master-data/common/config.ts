import type { MasterStatus, MasterTone } from "./types";

export const statusConfig: Record<
  MasterStatus,
  { label: string; badge: string; dot: string }
> = {
  ACTIVE: {
    label: "ใช้งานอยู่",
    badge: "bg-[#eaf8f2] text-[#087a57] ring-[#cdeedf]",
    dot: "bg-[#18a978]",
  },
  INACTIVE: {
    label: "ไม่ใช้งาน",
    badge: "bg-[#fff0f1] text-[#b83b4b] ring-[#f4d4d8]",
    dot: "bg-[#dc5b6a]",
  },
};

export const toneConfig: Record<
  MasterTone,
  { bg: string; text: string }
> = {
  blue: { bg: "bg-[#eaf3ff]", text: "text-[#3478da]" },
  green: { bg: "bg-[#eaf7f1]", text: "text-[#168662]" },
  orange: { bg: "bg-[#fff2e7]", text: "text-[#e17422]" },
  purple: { bg: "bg-[#f2edff]", text: "text-[#7c56c4]" },
  teal: { bg: "bg-[#e9f8f7]", text: "text-[#118b8a]" },
  rose: { bg: "bg-[#fff0f4]", text: "text-[#cb5574]" },
  slate: { bg: "bg-[#eef1f5]", text: "text-[#667484]" },
};

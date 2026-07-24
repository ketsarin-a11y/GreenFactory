import { ChevronRight, Users } from "lucide-react";
import type { Role } from "./types";
import RoleIcon from "./RoleIcon";

export default function RoleCard({
  role,
  active,
  onClick,
}: {
  role: Role;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[16px] border px-4 py-4 text-left transition ${
        active
          ? `${role.tone.activeBg} ${role.tone.activeBorder} shadow-[0_10px_28px_rgba(39,58,49,0.06)]`
          : "border-transparent bg-white hover:border-[#e6e8e6] hover:bg-[#fbfcfb]"
      }`}
    >
      <RoleIcon role={role} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-[#28322d]">
          {role.name}
        </span>
        <span className="mt-1 block truncate text-[10px] font-semibold text-[#16845f]">
          {role.description}
        </span>
        <span className="mt-1.5 block truncate text-[10px] text-[#919995]">
          ควบคุมการเข้าถึงตามบทบาท
        </span>
      </span>

      <span className="text-right">
        <span className="flex items-center justify-end gap-1 text-[12px] font-bold text-[#3f4c46]">
          <Users className="h-3.5 w-3.5 text-[#8b9490]" />
          {role.userCount}
        </span>
        <span className="mt-1 block text-[9px] text-[#989f9c]">ผู้ใช้</span>
      </span>

      <ChevronRight className="h-4 w-4 text-[#9da5a1]" />
    </button>
  );
}

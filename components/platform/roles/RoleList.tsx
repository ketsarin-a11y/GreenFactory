import { Plus } from "lucide-react";
import type { Role, RoleKey } from "./types";
import RoleCard from "./RoleCard";
import PermissionLegend from "./PermissionLegend";

export default function RoleList({
  roles,
  selectedRole,
  onSelectRole,
}: {
  roles: Role[];
  selectedRole: RoleKey;
  onSelectRole: (role: RoleKey) => void;
}) {
  return (
    <aside className="flex min-h-[680px] flex-col rounded-[20px] border border-[#e4e8e5] bg-white p-4 shadow-[0_14px_42px_rgba(36,49,43,0.045)]">
      <div className="flex items-center justify-between border-b border-[#edf0ee] pb-4">
        <div>
          <h3 className="text-[14px] font-bold text-[#26312c]">บทบาททั้งหมด</h3>
          <p className="mt-1 text-[10px] text-[#8b9490]">
            เลือกบทบาทเพื่อกำหนดสิทธิ์
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#cfe4da] bg-[#f4fbf8] px-3 text-[11px] font-semibold text-[#0f7b58] transition hover:bg-[#eaf7f1]"
        >
          <Plus className="h-3.5 w-3.5" />
          เพิ่มบทบาท
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {roles.map((role) => (
          <RoleCard
            key={role.key}
            role={role}
            active={selectedRole === role.key}
            onClick={() => onSelectRole(role.key)}
          />
        ))}
      </div>

      <div className="mt-auto pt-5">
        <PermissionLegend />
      </div>
    </aside>
  );
}

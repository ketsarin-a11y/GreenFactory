import { roleConfig } from "./constants";
import type { UserRole } from "./types";

export default function UserRoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}

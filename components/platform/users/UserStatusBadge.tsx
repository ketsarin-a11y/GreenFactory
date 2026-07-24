import { statusConfig } from "./constants";
import type { UserStatus } from "./types";

export default function UserStatusBadge({ status }: { status: UserStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

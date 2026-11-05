import Link from "next/link";
import { Bell } from "lucide-react";
import type { CurrentUser } from "@/server/auth/current-user";
import { openAlertCount } from "@/server/queries/manager/alerts";

/** Top-bar bell for managers: OPEN alert count, links to the alerts page. Server component. */
export async function AlertsBell({ user }: { user: CurrentUser }) {
  const n = await openAlertCount(user);
  const label = n ? `การแจ้งเตือนเปิดอยู่ ${n} รายการ` : "ไม่มีการแจ้งเตือนเปิดอยู่";
  return (
    <Link href="/manager/alerts?status=OPEN" aria-label={label} title={label} className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
      <Bell className="size-5" aria-hidden />
      {n > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-status-critical px-1 text-center text-[11px] leading-5 font-semibold text-white tabular">
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}

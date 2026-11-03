import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon = Inbox, title, description, action }: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div role="status" className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </span>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

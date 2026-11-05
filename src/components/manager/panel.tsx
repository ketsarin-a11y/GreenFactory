import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Flat white panel with an optional heading row (same header rhythm as ChartCard). */
export function Panel({ title, description, actions, children, className, bodyClassName }: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-[10px] border bg-card p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Page-header meta as separate pieces (factory first), never joined with dots. */
export function Meta({ factory, children }: { factory?: string; children?: ReactNode }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
      {factory && <span className="font-medium text-foreground">{factory}</span>}
      {children}
    </span>
  );
}

/** Small muted text link (no trailing arrow). */
export const linkCls = "text-sm text-primary underline-offset-4 hover:underline";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Flat panel for platform pages: title row (+ optional plain-text action), then content. */
export function Panel({ title, description, action, children, className, bodyClassName }: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-[10px] border bg-card p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0 text-sm">{action}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** One-line empty message for lists inside a panel (no nested dashed box). */
export function QuietEmpty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

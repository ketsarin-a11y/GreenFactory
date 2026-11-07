import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SummaryItem = { label: string; value: string; unit?: string; hint?: ReactNode; tone?: "default" | "attention" };

/**
 * Quiet one-panel summary for list pages (not a dashboard): a few counts divided by
 * hairlines instead of a grid of identical stat cards.
 */
export function SummaryStrip({ items, className }: { items: SummaryItem[]; className?: string }) {
  return (
    <dl className={cn("mb-6 grid grid-cols-2 overflow-hidden rounded-[10px] border bg-card sm:flex sm:divide-x", className)}>
      {items.map((i, n) => (
        <div key={i.label} className={cn("min-w-0 flex-1 px-4 py-3", n % 2 === 1 && "max-sm:border-l", n >= 2 && "max-sm:border-t")}>
          <dt className="truncate text-xs text-muted-foreground">{i.label}</dt>
          <dd className="mt-0.5 flex items-baseline gap-1">
            <span className={cn("font-display text-xl font-semibold tabular", i.tone === "attention" && "text-status-critical")}>{i.value}</span>
            {i.unit && <span className="text-xs text-muted-foreground">{i.unit}</span>}
          </dd>
          {i.hint && <dd className="mt-0.5 truncate text-xs text-muted-foreground">{i.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

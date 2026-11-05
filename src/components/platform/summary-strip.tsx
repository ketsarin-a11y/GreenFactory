import Link from "next/link";
import { cn } from "@/lib/utils";

export type SummaryItem = { label: string; value: string; unit?: string; href?: string; active?: boolean };

/**
 * Quiet one-panel row of counts divided by hairlines (list pages). Not a grid of cards:
 * dashboards get the InstrumentBand; list pages get this. An item with `href` filters the list.
 */
export function SummaryStrip({ items, className }: { items: SummaryItem[]; className?: string }) {
  return (
    <dl className={cn("mb-6 grid grid-cols-2 overflow-hidden rounded-[10px] border bg-card sm:flex sm:divide-x", className)}>
      {items.map((i) => {
        const body = (
          <>
            <dt className="text-sm text-muted-foreground">{i.label}</dt>
            <dd className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-2xl font-semibold tracking-tight tabular">{i.value}</span>
              {i.unit && <span className="text-sm text-muted-foreground">{i.unit}</span>}
            </dd>
          </>
        );
        const cls = cn("min-w-0 flex-1 border-b px-5 py-4 sm:border-b-0 max-sm:odd:border-r", i.active && "bg-muted/60");
        return i.href ? (
          <Link key={i.label} href={i.href} aria-current={i.active ? "true" : undefined} className={cn(cls, "block transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none")}>
            {body}
          </Link>
        ) : (
          <div key={i.label} className={cls}>{body}</div>
        );
      })}
    </dl>
  );
}

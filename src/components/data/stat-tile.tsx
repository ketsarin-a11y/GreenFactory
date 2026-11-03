import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/format";

/**
 * A headline number. `change` is % vs the previous period; `goodWhen` says whether going
 * down is good (energy, carbon) so the delta is colored by meaning, not by sign.
 */
export function StatTile({ label, value, unit, icon: Icon, change, goodWhen = "down", hint, className }: {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  change?: number | null;
  goodWhen?: "down" | "up" | "neutral";
  hint?: string;
  className?: string;
}) {
  const dir = change === null || change === undefined || change === 0 ? 0 : change > 0 ? 1 : -1;
  const good = goodWhen === "neutral" || dir === 0 ? null : (goodWhen === "down") === dir < 0;
  const Arrow = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;
  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="tabular text-3xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </p>
      {(change !== undefined || hint) && (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular",
                good === true && "text-[#0a7d0a] dark:text-status-good",
                good === false && "text-status-critical",
              )}
            >
              <Arrow className="size-3.5" aria-hidden />
              {change === null ? "ไม่มีข้อมูลเทียบ" : fmtPct(change)}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </p>
      )}
    </div>
  );
}

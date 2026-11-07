import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Small Δ% with arrow + text. For consumption, down is good. */
export function DeltaText({ change, goodWhen = "down", className }: { change: number | null; goodWhen?: "down" | "up"; className?: string }) {
  if (change === null) return <span className={cn("text-muted-foreground", className)}>ไม่มีข้อมูลเทียบ</span>;
  const Arrow = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  const good = change === 0 ? null : (goodWhen === "down") === change < 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 tabular font-medium", good === true && "text-[#0a7d0a] dark:text-status-good", good === false && "text-status-critical", className)}>
      <Arrow className="size-3.5" aria-hidden />{fmtPct(change)}
    </span>
  );
}

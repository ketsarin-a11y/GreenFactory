import { cn } from "@/lib/utils";

/** Score bar + number + word, so readiness is never color alone. */
export function Readiness({ score, className }: { score: number; className?: string }) {
  const [label, bar] = score >= 75 ? ["พร้อม", "bg-status-good"] : score >= 40 ? ["ต้องเพิ่ม", "bg-status-warning"] : ["เริ่มต้น", "bg-status-critical"];
  return (
    <div className={cn("flex min-w-[120px] items-center gap-2", className)}>
      <div className="h-1.5 flex-1 rounded-full bg-muted" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`ความพร้อม ${score}%`}>
        <div className={cn("h-1.5 rounded-full", bar)} style={{ width: `${score}%` }} />
      </div>
      <span className="tabular w-9 text-right text-xs font-medium">{score}%</span>
      <span className="w-14 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

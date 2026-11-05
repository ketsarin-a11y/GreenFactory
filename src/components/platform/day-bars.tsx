import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";

/**
 * Small per-day column chart (pure HTML, server-rendered) for counts such as failed logins.
 * Zero days keep a hairline stub so the time axis stays readable; each bar has a tooltip.
 */
export function DayBars({ labels, values, unit, color = "var(--primary)", className, label, minScale = 5 }: {
  labels: string[];
  values: number[];
  unit: string;
  color?: string;
  className?: string;
  label: string;
  /** Bars are scaled to at least this value, so a single event doesn't look like a spike. */
  minScale?: number;
}) {
  const max = Math.max(0, ...values);
  const scale = Math.max(max, minScale);
  return (
    <figure className={className}>
      <div className="flex h-16 items-end gap-[2px]" role="img" aria-label={`${label}: ${labels.map((l, i) => `${l} ${fmtNum(values[i], 0)} ${unit}`).join(", ")}`}>
        {values.map((v, i) => (
          <div
            key={labels[i]}
            title={`${labels[i]}: ${fmtNum(v, 0)} ${unit}`}
            className={cn("min-w-0 flex-1 rounded-t-[2px]", v === 0 && "bg-border")}
            style={{ height: v === 0 || max === 0 ? 1 : `${Math.max(8, (v / scale) * 100)}%`, background: v === 0 ? undefined : color }}
          />
        ))}
      </div>
      <figcaption className="mt-1.5 flex justify-between text-xs text-muted-foreground tabular">
        <span>{labels[0]}</span>
        <span>สูงสุด {fmtNum(max, 0)} {unit}/วัน</span>
        <span>{labels[labels.length - 1]}</span>
      </figcaption>
    </figure>
  );
}

import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";

/**
 * Value against a limit/target on one track. `goodWhen="below"` for consumption limits:
 * the bar turns critical once actual passes target. A tick marks the target.
 */
export function Meter({ value, target, unit, goodWhen = "below", label, onDark, className }: {
  value: number;
  target: number;
  unit?: string;
  goodWhen?: "below" | "above";
  label?: string;
  /** On the control-room band: light track and white fill. */
  onDark?: boolean;
  className?: string;
}) {
  const scale = Math.max(value, target) * 1.1 || 1;
  const ok = goodWhen === "below" ? value <= target : value >= target;
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          <span className="truncate">{label}</span>
          <span className="shrink-0 tabular text-muted-foreground">
            <span className="font-medium text-foreground">{fmtNum(value)}</span> / {fmtNum(target)} {unit}
          </span>
        </div>
      )}
      <div className={cn("relative h-2.5 rounded-full", onDark ? "bg-white/15" : "bg-muted")} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={scale} aria-label={label}>
        <div className={cn("h-2.5 rounded-full", onDark ? (ok ? "bg-brand-lime" : "bg-[#ffb4a8]") : ok ? "bg-primary" : "bg-status-critical")} style={{ width: `${(value / scale) * 100}%` }} />
        <div className={cn("absolute -top-1 h-4.5 w-0.5 rounded", onDark ? "bg-white/80" : "bg-foreground/70")} style={{ left: `${(target / scale) * 100}%` }} title={`เป้าหมาย ${fmtNum(target)} ${unit ?? ""}`} />
      </div>
    </div>
  );
}

/** Half-donut gauge for a single percentage (KPI achievement, readiness). */
export function Gauge({ percent, label, sublabel, tone = "primary", size = 140 }: {
  percent: number;
  label: string;
  sublabel?: string;
  tone?: "primary" | "critical" | "warning";
  size?: number;
}) {
  const p = Math.max(0, Math.min(100, percent));
  const r = 42, c = Math.PI * r;
  const color = tone === "critical" ? "var(--status-critical)" : tone === "warning" ? "var(--status-warning)" : "var(--primary)";
  return (
    <figure className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 100 56" className="w-full" role="img" aria-label={`${label} ${fmtNum(p, 0)}%`}>
        <path d="M8,50 A42,42 0 0 1 92,50" fill="none" stroke="var(--muted)" strokeWidth={9} strokeLinecap="round" />
        <path d="M8,50 A42,42 0 0 1 92,50" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${(p / 100) * c} ${c}`} />
        <text x="50" y="46" textAnchor="middle" className="fill-foreground text-[17px] font-semibold tabular">{fmtNum(p, 0)}%</text>
      </svg>
      <figcaption className="-mt-1 text-center">
        <span className="block text-sm font-medium">{label}</span>
        {sublabel && <span className="block text-xs text-muted-foreground">{sublabel}</span>}
      </figcaption>
    </figure>
  );
}

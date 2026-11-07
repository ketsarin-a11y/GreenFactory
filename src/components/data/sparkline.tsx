import { cn } from "@/lib/utils";

/**
 * Tiny inline trend (pure SVG, server-renderable). 2px line, end dot, no axes — context only;
 * the exact numbers live in the tile or table next to it.
 */
export function Sparkline({ values, className, color = "var(--primary)", label, zeroBase }: {
  values: number[];
  className?: string;
  color?: string;
  label?: string;
  /** Scale from 0 instead of the series minimum, so nearly flat series look flat. */
  zeroBase?: boolean;
}) {
  const pts = values.filter((v) => Number.isFinite(v));
  if (pts.length < 2) return null;
  const w = 100, h = 28, pad = 2;
  const min = zeroBase ? Math.min(0, ...pts) : Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
  const xy = pts.map((v, i) => [pad + (i / (pts.length - 1)) * (w - pad * 2), h - pad - ((v - min) / span) * (h - pad * 2)] as const);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = xy[xy.length - 1];
  // The line stretches with the box; the end dot is HTML so it stays round.
  return (
    <div className={cn("relative h-7 w-full", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        <path d={`${d} L${lx},${h} L${xy[0][0]},${h} Z`} fill={color} opacity={0.08} />
        <path d={d} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <span className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${lx}%`, top: `${(ly / h) * 100}%`, background: color }} />
    </div>
  );
}

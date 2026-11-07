import { fmtNum } from "@/lib/format";

/** Ranked horizontal bars (shares, breakdowns). Plain HTML: readable, accessible, no chart lib. */
export function BarList({ items, unit, max }: {
  items: { label: string; value: number; color?: string; hint?: string }[];
  unit?: string;
  max?: number;
}) {
  const top = max ?? Math.max(...items.map((i) => i.value), 0);
  const total = items.reduce((a, i) => a + i.value, 0);
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{i.label}</span>
            <span className="shrink-0 tabular text-muted-foreground">
              <span className="font-medium text-foreground">{fmtNum(i.value)}</span> {unit}
              {total > 0 && <span className="ml-2 text-xs">{fmtNum((i.value / total) * 100, 1)}%</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted" aria-hidden>
            <div className="h-2 rounded-full" style={{ width: `${top > 0 ? Math.max(2, (i.value / top) * 100) : 0}%`, background: i.color ?? "var(--chart-1)" }} />
          </div>
          {i.hint && <p className="mt-1 text-xs text-muted-foreground">{i.hint}</p>}
        </li>
      ))}
    </ul>
  );
}

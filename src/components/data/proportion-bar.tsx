import { fmtNum } from "@/lib/format";

/** Part-to-whole as one stacked 100% bar + labelled legend (instead of a pie). */
export function ProportionBar({ parts, unit }: { parts: { label: string; value: number; color: string }[]; unit?: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  if (total <= 0) return <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>;
  return (
    <div className="@container">
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label} ${fmtNum((p.value / total) * 100, 1)}%`).join(", ")}>
        {parts.filter((p) => p.value > 0).map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${fmtNum(p.value)} ${unit ?? ""}`} />
        ))}
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-1.5 text-sm @sm:grid-cols-2">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-sm" style={{ background: p.color }} /><span className="truncate">{p.label}</span></span>
            <span className="shrink-0 tabular text-muted-foreground">{fmtNum((p.value / total) * 100, 1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

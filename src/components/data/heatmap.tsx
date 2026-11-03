import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";

// Sequential forest-green ramp (one hue, light → dark), from DESIGN.md primary.
const RAMP = ["#dcebe2", "#cfe6d9", "#a6d1b9", "#74b693", "#3f9670", "#167553", "#0b5c43", "#073d2d"];
const RAMP_DARK = ["#16221c", "#1b3428", "#1f4a36", "#246245", "#2b7b55", "#379566", "#4fb07c", "#7ccf9e"];

/**
 * Matrix heatmap (rows × columns, e.g. machine × day). Magnitude is a single hue, darker = more.
 * Every cell has a tooltip and the whole grid has a screen-reader table equivalent via aria.
 * `values[r][c]` null = no reading (hatched, not zero).
 */
export function Heatmap({ rows, cols, values, unit, colLabelEvery = 1, className }: {
  rows: string[];
  cols: string[];
  values: (number | null)[][];
  unit?: string;
  colLabelEvery?: number;
  className?: string;
}) {
  const flat = values.flat().filter((v): v is number => v !== null);
  const max = flat.length ? Math.max(...flat) : 0;
  const step = (v: number) => (max <= 0 ? 0 : Math.min(RAMP.length - 1, Math.floor((v / max) * (RAMP.length - 1) + 0.0001)));
  return (
    <div className={cn("relative w-full overflow-x-auto", className)}>
      <table className="w-full border-separate border-spacing-[2px] text-xs" aria-label={`ตารางความร้อน หน่วย ${unit ?? ""}`}>
        <thead>
          <tr>
            <th className="sr-only">รายการ</th>
            {cols.map((c, i) => (
              <th key={c} scope="col" className="h-5 min-w-4 px-0 text-center align-bottom font-normal text-muted-foreground">
                <span className={i % colLabelEvery === 0 ? "" : "sr-only"}>{c}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r}>
              <th scope="row" className="max-w-40 truncate pr-2 text-left font-normal whitespace-nowrap text-foreground">{r}</th>
              {cols.map((c, ci) => {
                const v = values[ri]?.[ci] ?? null;
                const s = v === null ? -1 : step(v);
                return (
                  <td
                    key={c}
                    title={`${r}, ${c}: ${v === null ? "ไม่มีข้อมูล" : `${fmtNum(v)} ${unit ?? ""}`}`}
                    className="relative h-6 min-w-4 rounded-[3px] p-0"
                    style={v === null ? undefined : ({ "--hm": RAMP[s], "--hm-dark": RAMP_DARK[s] } as React.CSSProperties)}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 rounded-[3px]",
                        v === null
                          ? "bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_2px,transparent_2px,transparent_5px)]"
                          : "bg-(--hm) dark:bg-(--hm-dark)",
                      )}
                    />
                    <span className="sr-only">{v === null ? "ไม่มีข้อมูล" : `${fmtNum(v)} ${unit ?? ""}`}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground" aria-hidden>
        <span>น้อย</span>
        <span className="flex gap-0.5">{RAMP.map((c, i) => <span key={c} className="h-2.5 w-5 rounded-sm bg-(--hm) dark:bg-(--hm-dark)" style={{ "--hm": c, "--hm-dark": RAMP_DARK[i] } as React.CSSProperties} />)}</span>
        <span>มาก{max > 0 ? ` (${fmtNum(max)} ${unit ?? ""})` : ""}</span>
        <span className="ml-3 inline-block h-2.5 w-5 rounded-sm bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_2px,transparent_2px,transparent_5px)] ring-1 ring-border" /> <span>ไม่มีข้อมูล</span>
      </div>
    </div>
  );
}

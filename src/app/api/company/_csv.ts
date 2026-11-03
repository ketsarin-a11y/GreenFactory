import "server-only";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote, double inner quotes, and neutralize spreadsheet formula injection.
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replaceAll('"', '""')}"`;
};

/** UTF-8 CSV with BOM so Excel shows Thai correctly. */
export function csvResponse(fileName: string, header: string[], rows: unknown[][]) {
  const body = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}"`, "Cache-Control": "no-store" },
  });
}

/** "YYYY-MM-DD HH:mm" in Bangkok time, sortable in spreadsheets. */
export const bkkStamp = (d: Date) => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace("T", " ");
/** Up to 3 decimals, as a number. */
export const round3 = (n: number) => Math.round(n * 1000) / 1000;

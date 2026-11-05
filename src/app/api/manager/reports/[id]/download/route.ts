import ExcelJS from "exceljs";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/current-user";
import { buildReport, findReport, type ReportData, type Sheet } from "@/server/queries/manager/reports";

const err = (status: number, message: string) => Response.json({ error: message }, { status });
const NUM_FMT = { int: "#,##0", dec: "#,##0.00", pct: "0.0%" } as const;

/** Regenerates the report from its stored filterScope (no snapshot), as XLSX or CSV. PDF → printable page. */
export async function GET(req: Request, ctx: RouteContext<"/api/manager/reports/[id]/download">) {
  const user = await getCurrentUser();
  if (!user) return err(401, "กรุณาเข้าสู่ระบบ");
  if (user.role !== "MANAGER" || user.companyId === null) return err(403, "คุณไม่มีสิทธิ์ดาวน์โหลดรายงานนี้");
  const { id } = await ctx.params;
  if (!/^\d{1,19}$/.test(id)) return err(400, "รหัสรายงานไม่ถูกต้อง");
  const found = await findReport(user, id);
  if (!found) return err(404, "ไม่พบรายงาน");
  if (!found.scope) return err(422, "ขอบเขตของรายงานไม่ถูกต้อง กรุณาสร้างรายงานใหม่");
  const r = found.report;

  if (r.reportFormat === "PDF") return Response.redirect(new URL(`/manager/reports/${id}/print`, req.url), 303);

  const data = await buildReport(user, found.scope);
  await db.report.update({ where: { reportId: r.reportId }, data: { downloadCount: { increment: 1 } } });
  const base = `report-${r.reportType.toLowerCase()}-${found.scope.from}-${found.scope.to}`;

  if (r.reportFormat === "CSV") {
    return new Response(toCsv(data.sheets[data.sheets.length - 1]), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${base}.csv"`, "Cache-Control": "no-store" },
    });
  }
  const buf = await toXlsx(data);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

/** UTF-8 BOM + CRLF so Excel opens Thai text correctly. */
function toCsv(sheet: Sheet) {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`; // no formula injection
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [sheet.columns.map((c) => cell(c.header)).join(","), ...sheet.rows.map((row) => sheet.columns.map((c) => cell(row[c.key])).join(","))];
  return "﻿" + lines.join("\r\n") + "\r\n";
}

async function toXlsx(data: ReportData) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "GreenFactory Insight";
  const summary = wb.addWorksheet("สรุป");
  summary.columns = [{ width: 28 }, { width: 40 }];
  summary.addRow([data.title]).font = { bold: true, size: 14 };
  summary.addRow([]);
  for (const [k, v] of data.facts) {
    const row = summary.addRow([k, v]);
    row.getCell(1).font = { bold: true };
    if (typeof v === "number") row.getCell(2).numFmt = Number.isInteger(v) ? NUM_FMT.int : NUM_FMT.dec;
  }
  // Grouped by unit: one line per (unit, resource) — units are never added together.
  const first = data.sheets[0];
  summary.addRow([]);
  summary.addRow([first.name]).font = { bold: true };
  addTable(summary, first);
  if (data.notes.length) summary.addRow([]);
  for (const n of data.notes) summary.addRow([n]).font = { italic: true, color: { argb: "FF66726B" } };

  for (const s of data.sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31));
    ws.columns = s.columns.map((c) => ({ key: c.key, width: c.width ?? Math.max(12, c.header.length + 4) }));
    addTable(ws, s);
    ws.views = [{ state: "frozen", ySplit: 1 }];
  }
  return wb.xlsx.writeBuffer();
}

function addTable(ws: ExcelJS.Worksheet, s: Sheet) {
  const header = ws.addRow(s.columns.map((c) => c.header));
  header.font = { bold: true };
  header.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7F2EC" } }; });
  for (const r of s.rows) {
    const row = ws.addRow(s.columns.map((c) => r[c.key] ?? null));
    s.columns.forEach((c, i) => { if (c.num) row.getCell(i + 1).numFmt = NUM_FMT[c.num]; });
  }
}

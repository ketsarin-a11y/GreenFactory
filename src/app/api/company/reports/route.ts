import ExcelJS from "exceljs";
import { getCurrentUser } from "@/server/auth/current-user";
import { currentMonth, isMonth, monthlyReport } from "@/server/queries/company/reports";
import { csvResponse, round3 } from "../_csv";

const HEADER = ["รหัสโรงงาน", "โรงงาน", "ทรัพยากร", "หน่วย", "ปริมาณ", "จำนวนรายการ", "คาร์บอน (kgCO2e)"];
const bold = { bold: true };

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY_ADMIN") return new Response(null, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const month = isMonth(sp.get("month")) ? sp.get("month")! : currentMonth();
  const factoryId = Number(sp.get("factory")) || undefined;
  const r = await monthlyReport(user, month, factoryId);
  const rows = r.sections.flatMap((s) => s.rows.map((x) => [s.code, s.name, x.resource, x.unit, round3(x.quantity), x.records, round3(x.carbonKg)]));
  const scopeName = factoryId ? r.factories[0]?.code ?? "factory" : user.companyCode ?? "company";
  const name = `report_${scopeName}_${month}`;
  if (sp.get("format") !== "xlsx") return csvResponse(`${name}.csv`, HEADER, rows);

  const wb = new ExcelJS.Workbook();
  wb.creator = "GreenFactory Insight";
  const title = `สรุปการใช้ทรัพยากร ${user.companyName ?? ""} เดือน ${month}${factoryId && r.factories[0] ? ` ${r.factories[0].name}` : ""}`;

  // 1) Per factory × resource × unit.
  const ws = wb.addWorksheet("สรุปรายโรงงาน");
  ws.addRow([title]).font = { bold: true, size: 13 };
  ws.addRow([]);
  ws.addRow(HEADER).font = bold;
  rows.forEach((row) => ws.addRow(row));
  ws.addRow([]);
  ws.addRow(["", "คาร์บอนรวม", "", "", "", "", round3(r.carbonKg)]).font = bold;
  ws.columns.forEach((c, i) => { c.width = [12, 26, 26, 10, 16, 14, 18][i]; if (i >= 4) c.numFmt = "#,##0.00"; });
  ws.views = [{ state: "frozen", ySplit: 3 }];

  // 2) Comparison: one row per resource/unit, one column per factory.
  const cmp = wb.addWorksheet("เทียบโรงงาน");
  cmp.addRow([`เทียบโรงงาน เดือน ${month}`]).font = { bold: true, size: 13 };
  cmp.addRow([]);
  cmp.addRow(["ทรัพยากร", "หน่วย", ...r.factories.map((f) => f.name), "รวม"]).font = bold;
  for (const m of r.metrics) cmp.addRow([m.resource, m.unit, ...m.byFactory.map((b) => round3(b.quantity)), round3(m.total)]);
  cmp.addRow([]);
  cmp.addRow(["คาร์บอน", "kgCO2e", ...r.factories.map((f) => round3(r.sections.find((s) => s.factoryId === f.id)?.carbonKg ?? 0)), round3(r.carbonKg)]).font = bold;
  cmp.columns.forEach((c, i) => { c.width = i === 0 ? 26 : i === 1 ? 10 : 18; if (i >= 2) c.numFmt = "#,##0.00"; });
  cmp.views = [{ state: "frozen", xSplit: 2, ySplit: 3 }];

  // 3) Daily values for charts/pivots in Excel.
  const daily = wb.addWorksheet("รายวัน");
  daily.addRow(["วันที่", "โรงงาน", "ทรัพยากร", "หน่วย", "ปริมาณ"]).font = bold;
  for (const m of r.metrics)
    for (const b of m.byFactory) {
      const f = r.factories.find((x) => x.id === b.factoryId)!;
      b.daily.forEach((q, i) => { if (q) daily.addRow([r.days[i], f.name, m.resource, m.unit, round3(q)]); });
    }
  daily.columns.forEach((c, i) => { c.width = [12, 26, 26, 10, 16][i]; if (i === 4) c.numFmt = "#,##0.00"; });
  daily.views = [{ state: "frozen", ySplit: 1 }];

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

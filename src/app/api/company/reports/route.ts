import ExcelJS from "exceljs";
import { getCurrentUser } from "@/server/auth/current-user";
import { currentMonth, isMonth, monthlyReport } from "@/server/queries/company/reports";
import { csvResponse, round3 } from "../_csv";

const HEADER = ["โรงงาน", "ทรัพยากร", "หน่วย", "ปริมาณ", "จำนวนรายการ", "คาร์บอน (kgCO2e)"];

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY_ADMIN") return new Response(null, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const month = isMonth(sp.get("month")) ? sp.get("month")! : currentMonth();
  const r = await monthlyReport(user, month);
  const rows = r.sections.flatMap((s) => s.rows.map((x) => [s.factory, x.resource, x.unit, round3(x.quantity), x.records, round3(x.carbonKg)]));
  const name = `report_${user.companyCode ?? "company"}_${month}`;
  if (sp.get("format") !== "xlsx") return csvResponse(`${name}.csv`, HEADER, rows);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(month);
  ws.addRow([`สรุปการใช้ทรัพยากร ${user.companyName ?? ""} เดือน ${month}`]).font = { bold: true, size: 13 };
  ws.addRow([]);
  ws.addRow(HEADER).font = { bold: true };
  rows.forEach((row) => ws.addRow(row));
  ws.addRow([]);
  ws.addRow(["คาร์บอนรวมทั้งบริษัท", "", "", "", "", round3(r.carbonKg)]).font = { bold: true };
  ws.columns.forEach((c, i) => { c.width = [28, 24, 10, 16, 14, 18][i]; if (i >= 3) c.numFmt = "#,##0.00"; });
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

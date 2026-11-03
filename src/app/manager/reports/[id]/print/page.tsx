import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { requireTenantUser } from "@/server/auth/current-user";
import { factoryLabel } from "@/server/queries/context";
import { buildReport, findReport } from "@/server/queries/manager/reports";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { PrintButton } from "./print-button";

const PRINT_CSS = `
@page { size: A4; margin: 16mm 14mm 18mm; @bottom-center { content: "หน้า " counter(page) " จาก " counter(pages); font-size: 9pt; color: #66726b; } }
@media print {
  [data-slot="sidebar"], [data-slot="sidebar-gap"], [data-slot="sidebar-container"], [data-slot="sidebar-inset"] > header, .no-print { display: none !important; }
  [data-slot="sidebar-inset"] main { padding: 0 !important; max-width: none !important; }
  body { background: #fff !important; }
  .print-sheet { border: 0 !important; padding: 0 !important; }
  table { page-break-inside: auto; } tr { page-break-inside: avoid; } thead { display: table-header-group; }
}`;
const RAW_PRINT_LIMIT = 300;

export default async function Page({ params }: PageProps<"/manager/reports/[id]/print">) {
  const user = await requireTenantUser("MANAGER");
  const found = await findReport(user, (await params).id);
  if (!found || !found.scope) notFound();
  const [data, factory] = await Promise.all([buildReport(user, found.scope), factoryLabel(user)]);
  await db.report.update({ where: { reportId: found.report.reportId }, data: { downloadCount: { increment: 1 } } });

  return (
    <div className="print-sheet mx-auto max-w-[210mm] rounded-xl border bg-white p-8 text-[13px] text-[#16201b]">
      <style>{PRINT_CSS}</style>
      <div className="no-print mb-6 flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3 text-sm">
        <span className="text-muted-foreground">เลือก “บันทึกเป็น PDF” ในหน้าต่างพิมพ์เพื่อได้ไฟล์ PDF</span>
        <PrintButton />
      </div>
      <header className="mb-6 border-b pb-4">
        <p className="text-xs text-[#66726b]">GreenFactory Insight, {[factory.secondary, factory.primary].filter(Boolean).join(" ")}</p>
        <h1 className="mt-1 text-xl font-semibold">{data.title}</h1>
        <p className="mt-1 text-xs text-[#66726b]">พิมพ์เมื่อ {fmtDateTime(new Date())} (เวลาประเทศไทย)</p>
      </header>
      <dl className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1.5">
        {data.facts.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-dashed py-1"><dt className="text-[#46524b]">{k}</dt><dd className="tabular font-medium">{typeof v === "number" ? fmtNum(v) : v}</dd></div>
        ))}
      </dl>
      {data.sheets.map((s) => {
        const raw = s.name === "ข้อมูลดิบ";
        const rows = raw ? s.rows.slice(0, RAW_PRINT_LIMIT) : s.rows;
        return (
          <section key={s.name} className="mb-6">
            <h2 className="mb-2 text-sm font-semibold">{s.name}</h2>
            {rows.length === 0 ? <p className="text-[#66726b]">ไม่มีข้อมูล</p> : (
              <table className="w-full border-collapse text-[11px]">
                <thead><tr>{s.columns.map((c) => <th key={c.key} className={`border-b border-[#cdd6d0] bg-[#eef2ef] px-1.5 py-1 font-medium ${c.num ? "text-right" : "text-left"}`}>{c.header}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>{s.columns.map((c) => <td key={c.key} className={`border-b border-[#e2e8e4] px-1.5 py-1 ${c.num ? "text-right tabular" : ""}`}>{typeof r[c.key] === "number" ? fmtNum(r[c.key] as number) : (r[c.key] ?? "")}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            )}
            {raw && s.rows.length > RAW_PRINT_LIMIT && <p className="mt-1 text-[11px] text-[#66726b]">แสดง {RAW_PRINT_LIMIT} จาก {fmtNum(s.rows.length)} รายการ ดาวน์โหลดรูปแบบ Excel หรือ CSV เพื่อดูข้อมูลทั้งหมด</p>}
          </section>
        );
      })}
      {data.notes.map((n) => <p key={n} className="mt-2 text-[11px] text-[#66726b]">หมายเหตุ: {n}</p>)}
    </div>
  );
}

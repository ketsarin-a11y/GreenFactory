import Link from "next/link";
import { Download, FileBarChart, Printer } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { StatusBadge } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDateTime, addDays, bkkDay } from "@/lib/time";
import { requireTenantUser } from "@/server/auth/current-user";
import { latestDataDay } from "@/server/queries/manager/common";
import { listReports, REPORT_TYPE_LABEL } from "@/server/queries/manager/reports";
import { CreateReport } from "./_components/create-report";

export default async function Page() {
  const user = await requireTenantUser("MANAGER");
  const [reports, last] = await Promise.all([listReports(user), latestDataDay(user)]);
  const to = last ?? bkkDay(new Date());
  return (
    <>
      <PageHeader title="รายงาน" description="สร้างรายงานจากข้อมูลจริงของโรงงาน ทุกครั้งที่ดาวน์โหลดระบบจะสร้างไฟล์ใหม่จากข้อมูลล่าสุดในช่วงวันที่ที่เลือก" />
      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold">สร้างรายงานใหม่</h2>
        <CreateReport defaultFrom={addDays(to, -29)} defaultTo={to} />
      </section>
      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold">รายงานล่าสุด</h2>
        {reports.length === 0 ? (
          <EmptyState icon={FileBarChart} title="ยังไม่มีรายงาน" description="เลือกประเภท ช่วงวันที่ และรูปแบบไฟล์ด้านบน แล้วกดสร้างรายงาน" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>ชื่อรายงาน</TableHead><TableHead>ประเภท</TableHead><TableHead>รูปแบบ</TableHead><TableHead>สถานะ</TableHead><TableHead className="text-right">ดาวน์โหลด</TableHead><TableHead>สร้างเมื่อ</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{REPORT_TYPE_LABEL[r.type] ?? r.type}</TableCell>
                    <TableCell className="font-mono text-xs">{r.format}</TableCell>
                    <TableCell><StatusBadge tone={r.status === "COMPLETED" ? "good" : "warning"}>{r.status === "COMPLETED" ? "พร้อมดาวน์โหลด" : r.status}</StatusBadge></TableCell>
                    <TableCell className="text-right tabular">{r.downloads}</TableCell>
                    <TableCell className="text-sm tabular text-muted-foreground">{fmtDateTime(r.requestedAt)}<p className="text-xs">{r.by}</p></TableCell>
                    <TableCell className="text-right">
                      {r.format === "PDF" ? (
                        <Link href={`/manager/reports/${r.id}/print`} target="_blank" className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><Printer className="size-4" />เปิดเพื่อพิมพ์</Link>
                      ) : (
                        <a href={`/api/manager/reports/${r.id}/download`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><Download className="size-4" />ดาวน์โหลด</a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </>
  );
}

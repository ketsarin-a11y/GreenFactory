import { Download, FileBarChart, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireTenantUser } from "@/server/auth/current-user";
import { currentMonth, isMonth, monthlyReport } from "@/server/queries/company/reports";
import { fmtCarbon, fmtNum } from "@/lib/format";

const monthLabel = (m: string) => new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-01T00:00:00Z`));

export default async function Page({ searchParams }: PageProps<"/company/reports">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const month = isMonth(sp.month) ? sp.month : currentMonth();
  const r = await monthlyReport(user, month);
  const total = fmtCarbon(r.carbonKg);
  return (
    <>
      <PageHeader
        title="รายงาน"
        description={`สรุปการใช้ทรัพยากรและคาร์บอนรายเดือนของทุกโรงงาน · ${monthLabel(month)}`}
        actions={
          <>
            <Button variant="outline" className="h-10" asChild><a href={`/api/company/reports?month=${month}&format=csv`}><Download /> CSV</a></Button>
            <Button variant="outline" className="h-10" asChild><a href={`/api/company/reports?month=${month}&format=xlsx`}><FileSpreadsheet /> Excel</a></Button>
          </>
        }
      />
      <form className="mb-4 flex flex-wrap items-end gap-2" action="/company/reports">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          เดือน
          <Input type="month" name="month" defaultValue={month} className="h-10 w-[180px]" />
        </label>
        <Button type="submit" className="h-10">แสดงรายงาน</Button>
      </form>
      <div className="mb-4 rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">คาร์บอนรวมทั้งบริษัท</p>
        <p className="mt-1"><span className="tabular text-3xl font-semibold tracking-tight">{total.value}</span> <span className="text-sm text-muted-foreground">{total.unit}</span></p>
        <p className="mt-1 text-xs text-muted-foreground">คำนวณจากค่า Emission Factor ที่ใช้งานอยู่ ณ วันที่บันทึก</p>
      </div>
      {r.sections.length === 0 ? (
        <EmptyState icon={FileBarChart} title="ไม่มีข้อมูลในเดือนนี้" description="เลือกเดือนอื่น หรือรอให้ผู้ปฏิบัติงานบันทึกข้อมูลการใช้ทรัพยากร" />
      ) : (
        <div className="space-y-4">
          {r.sections.map((s) => (
            <section key={s.factory} className="overflow-x-auto rounded-xl border bg-card">
              <h2 className="border-b px-4 py-3 font-semibold">{s.factory}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ทรัพยากร</TableHead>
                    <TableHead>หน่วย</TableHead>
                    <TableHead className="text-right">ปริมาณ</TableHead>
                    <TableHead className="text-right">จำนวนรายการ</TableHead>
                    <TableHead className="text-right">คาร์บอน (kgCO₂e)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s.rows.map((x) => (
                    <TableRow key={`${x.code}-${x.unit}`}>
                      <TableCell>{x.resource}</TableCell>
                      <TableCell className="text-muted-foreground">{x.unit}</TableCell>
                      <TableCell className="tabular text-right">{fmtNum(x.quantity)}</TableCell>
                      <TableCell className="tabular text-right">{fmtNum(x.records)}</TableCell>
                      <TableCell className="tabular text-right">{x.carbonKg ? fmtNum(x.carbonKg) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>คาร์บอนรวมของโรงงาน</TableCell>
                    <TableCell className="tabular text-right font-semibold">{fmtNum(s.carbonKg)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

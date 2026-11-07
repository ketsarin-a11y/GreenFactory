import { Download, FileBarChart, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Nameplate } from "@/components/data/nameplate";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SummaryStrip } from "@/components/company/summary-strip";
import { monthLabel } from "@/components/company/labels";
import { requireTenantUser } from "@/server/auth/current-user";
import { defaultReportMonth, isMonth, monthlyReport, reportMonths } from "@/server/queries/company/reports";
import { factoryFilterOptions } from "@/server/queries/company/options";
import { fmtCarbon, fmtNum } from "@/lib/format";
import { ReportFilters } from "./_components/report-filters";
import { ReportCharts } from "./_components/report-charts";

export default async function Page({ searchParams }: PageProps<"/company/reports">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const [months, factoryOpts] = await Promise.all([reportMonths(user), factoryFilterOptions(user)]);
  const month = isMonth(sp.month) ? sp.month : defaultReportMonth(months);
  const factoryParam = typeof sp.factory === "string" && factoryOpts.some((f) => f.value === sp.factory) ? sp.factory : null;
  const r = await monthlyReport(user, month, factoryParam ? Number(factoryParam) : undefined);
  const total = fmtCarbon(r.carbonKg);
  const scope = factoryParam ? factoryOpts.find((f) => f.value === factoryParam)!.label : "ทุกโรงงาน";
  const qs = `month=${month}${factoryParam ? `&factory=${factoryParam}` : ""}`;
  const records = r.metrics.reduce((a, m) => a + m.byFactory.reduce((b, x) => b + x.records, 0), 0);
  const monthOpts = (months.includes(month) ? months : [month, ...months]).map((m) => ({ value: m, label: monthLabel(m) }));

  return (
    <>
      <PageHeader
        title="รายงานรายเดือน"
        description={`การใช้ทรัพยากรและคาร์บอน ${scope} เดือน${monthLabel(month)}`}
        actions={
          <>
            <Button variant="outline" className="h-10" asChild><a href={`/api/company/reports?${qs}&format=csv`}><Download /> ดาวน์โหลด CSV</a></Button>
            <Button className="h-10" asChild><a href={`/api/company/reports?${qs}&format=xlsx`}><FileSpreadsheet /> ดาวน์โหลด Excel</a></Button>
          </>
        }
      />
      <ReportFilters month={month} months={monthOpts} factory={factoryParam} factories={factoryOpts} />

      {r.metrics.length === 0 ? (
        <EmptyState icon={FileBarChart} title="ไม่มีข้อมูลในเดือนนี้" description="เลือกเดือนหรือโรงงานอื่น หรือรอให้ผู้ปฏิบัติงานบันทึกข้อมูลการใช้ทรัพยากร" />
      ) : (
        <>
          <SummaryStrip
            items={[
              { label: "คาร์บอนรวม", value: total.value, unit: total.unit, hint: "จาก Emission Factor ที่ใช้ ณ วันที่บันทึก" },
              { label: "รายการที่บันทึก", value: fmtNum(records), unit: "รายการ" },
              { label: "ทรัพยากรที่ใช้", value: fmtNum(r.metrics.length), unit: "ประเภท" },
              { label: "โรงงานที่มีข้อมูล", value: fmtNum(r.factories.length), unit: "แห่ง" },
            ]}
          />

          <section className="mb-6 overflow-x-auto rounded-[10px] border bg-card" aria-labelledby="cmp">
            <div className="border-b px-5 py-3">
              <h2 id="cmp" className="font-semibold">{r.factories.length > 1 ? "เทียบโรงงาน" : "สรุปตามทรัพยากร"}</h2>
              <p className="text-sm text-muted-foreground">ปริมาณแยกตามหน่วยที่บันทึก ไม่รวมข้ามหน่วย</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ทรัพยากร</TableHead>
                  {r.factories.map((f) => (
                    <TableHead key={f.id} className="text-right"><span className="inline-flex items-center gap-1.5">{f.name}<Nameplate>{f.code}</Nameplate></span></TableHead>
                  ))}
                  {r.factories.length > 1 && <TableHead className="text-right">รวม</TableHead>}
                  <TableHead className="text-right">คาร์บอน (kgCO₂e)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {r.metrics.map((m) => (
                  <TableRow key={`${m.code}-${m.unit}`}>
                    <TableCell>{m.resource} <span className="text-xs text-muted-foreground">{m.unit}</span></TableCell>
                    {m.byFactory.map((b) => <TableCell key={b.factoryId} className="tabular text-right">{b.quantity ? fmtNum(b.quantity) : "—"}</TableCell>)}
                    {r.factories.length > 1 && <TableCell className="tabular text-right font-medium">{fmtNum(m.total)}</TableCell>}
                    <TableCell className="tabular text-right">{m.carbonKg ? fmtNum(m.carbonKg) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>คาร์บอนรวม (kgCO₂e)</TableCell>
                  {r.factories.map((f) => <TableCell key={f.id} className="tabular text-right">{fmtNum(r.sections.find((s) => s.factoryId === f.id)?.carbonKg ?? 0)}</TableCell>)}
                  {r.factories.length > 1 && <TableCell />}
                  <TableCell className="tabular text-right font-semibold">{fmtNum(r.carbonKg)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </section>

          <h2 className="mb-3 font-semibold">รายวันตามทรัพยากร</h2>
          <ReportCharts metrics={r.metrics} days={r.days} factories={r.factories} />
        </>
      )}
    </>
  );
}

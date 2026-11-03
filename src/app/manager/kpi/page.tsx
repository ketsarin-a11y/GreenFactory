import { Gauge } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { EmptyState } from "@/components/data/empty-state";
import { StatusBadge } from "@/components/data/status-badge";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RangePicker } from "@/components/manager/range-picker";
import { fmtDayLong, fmtRange } from "@/components/manager/format";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { requireTenantUser } from "@/server/auth/current-user";
import { intParam, resolveRange } from "@/server/queries/manager/common";
import { getKpis, PAGE_SIZE } from "@/server/queries/manager/kpi";
import { RecalcButton } from "./_components/recalc-button";

const OP: Record<string, string> = { "<=": "≤", LTE: "≤", ">=": "≥", GTE: "≥", "<": "<", LT: "<", ">": ">", GT: ">", "=": "=", EQ: "=" };
const PERIOD: Record<string, string> = { DAILY: "รายวัน", WEEKLY: "รายสัปดาห์", MONTHLY: "รายเดือน", QUARTERLY: "รายไตรมาส", YEARLY: "รายปี" };
const period = (s: string, e: string) => (s === e ? fmtDayLong(s) : `${fmtDayLong(s)} – ${fmtDayLong(e)}`);
const Result = ({ status }: { status: string }) => <StatusBadge tone={status === "PASS" ? "good" : "critical"}>{status === "PASS" ? "ผ่านเป้า" : "ไม่ผ่านเป้า"}</StatusBadge>;

export default async function Page({ searchParams }: PageProps<"/manager/kpi">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const range = await resolveRange(user, sp, 90);
  const page = pageParam(sp.page);
  const d = await getKpis(user, range, { kpiId: intParam(sp.kpi), status: typeof sp.status === "string" ? sp.status : undefined, page });

  return (
    <>
      <PageHeader
        title="KPI"
        description={<>ผลเทียบเป้าหมายการใช้ทรัพยากร · {fmtRange(range.from, range.to)}</>}
        actions={<><RangePicker from={range.from} to={range.to} presets={[30, 90, 180]} /><RecalcButton from={range.from} to={range.to} /></>}
      />
      {d.kpis.length === 0 ? (
        <EmptyState icon={Gauge} title="ยังไม่มี KPI ของโรงงานนี้" description="ให้ผู้ดูแลระบบของบริษัทกำหนด KPI และเป้าหมายก่อน แล้วกดคำนวณผล KPI ใหม่" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="ผลทั้งหมดในช่วงนี้" value={fmtNum(d.summary.total)} unit="งวด" goodWhen="neutral" />
            <StatTile label="ผ่านเป้า" value={fmtNum(d.summary.pass)} unit="งวด" />
            <StatTile label="ไม่ผ่านเป้า" value={fmtNum(d.summary.fail)} unit="งวด" />
            <StatTile label="อัตราผ่านเป้า" value={d.summary.passRate === null ? "—" : fmtNum(d.summary.passRate, 1)} unit="%" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {d.kpis.map((k) => (
              <section key={k.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold">{k.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground"><span className="font-mono">{k.code}</span> · {k.resource} · {PERIOD[k.periodType] ?? k.periodType}</p>
                  </div>
                  {k.latest && <Result status={k.latest.status} />}
                </div>
                {k.latest ? (
                  <>
                    <p className="mt-4 flex items-baseline gap-1.5">
                      <span className="tabular text-2xl font-semibold">{fmtNum(k.latest.actual)}</span>
                      <span className="text-sm text-muted-foreground">{k.unit} · เป้า {OP[k.operator] ?? k.operator} {fmtNum(k.target)}</span>
                    </p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>ความสำเร็จ</span><span className="tabular font-medium text-foreground">{fmtNum(k.latest.achievement, 1)}%</span></div>
                      <div className="h-2 rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={k.latest.achievement} aria-label={`ความสำเร็จ ${k.name}`}>
                        <div className={cn("h-2 rounded-full", k.latest.status === "PASS" ? "bg-status-good" : "bg-status-critical")} style={{ width: `${Math.min(100, Math.max(2, k.latest.achievement))}%` }} />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">งวดล่าสุด {period(k.latest.start, k.latest.end)}</p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">ยังไม่มีผลในงวดที่ปิดแล้ว กดคำนวณผล KPI ใหม่</p>
                )}
              </section>
            ))}
          </div>

          <section className="mt-6 rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">ผลรายงวด</h2>
            <UrlFilters fields={[
              { type: "select", name: "kpi", label: "KPI", options: d.kpis.map((k) => ({ value: String(k.id), label: k.name })) },
              { type: "select", name: "status", label: "ผล", options: [{ value: "PASS", label: "ผ่านเป้า" }, { value: "FAIL", label: "ไม่ผ่านเป้า" }] },
            ]} />
            {d.results.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">ไม่มีผลตามตัวกรองนี้</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>งวด</TableHead><TableHead>KPI</TableHead>
                      <TableHead className="text-right">ค่าจริง</TableHead><TableHead className="text-right">เป้าหมาย</TableHead>
                      <TableHead className="text-right">ส่วนต่าง</TableHead><TableHead className="text-right">ความสำเร็จ</TableHead><TableHead>ผล</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.results.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap">{period(r.start, r.end)}</TableCell>
                        <TableCell>{r.kpiName}</TableCell>
                        <TableCell className="text-right tabular">{fmtNum(r.actual)} {r.unit}</TableCell>
                        <TableCell className="text-right tabular">{OP[r.operator] ?? r.operator} {fmtNum(r.target)}</TableCell>
                        <TableCell className="text-right tabular">{r.variance > 0 ? "+" : ""}{fmtNum(r.variance)}</TableCell>
                        <TableCell className="text-right tabular">{fmtNum(r.achievement, 1)}%</TableCell>
                        <TableCell><Result status={r.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Pagination page={page} totalPages={Math.ceil(d.total / PAGE_SIZE)} total={d.total} params={sp} pathname="/manager/kpi" />
          </section>
        </>
      )}
    </>
  );
}

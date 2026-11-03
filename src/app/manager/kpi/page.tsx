import { CheckCircle2, Gauge as GaugeIcon, XCircle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Gauge } from "@/components/data/meter";
import { Nameplate } from "@/components/data/nameplate";
import { Meta, Panel } from "@/components/manager/panel";
import { factoryLabel } from "@/server/queries/context";
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
const Result = ({ status }: { status: string }) => (
  <StatusBadge tone={status === "PASS" ? "good" : "critical"} icon={status === "PASS" ? CheckCircle2 : XCircle}>{status === "PASS" ? "ผ่านเป้า" : "ไม่ผ่านเป้า"}</StatusBadge>
);

export default async function Page({ searchParams }: PageProps<"/manager/kpi">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const range = await resolveRange(user, sp, 90);
  const page = pageParam(sp.page);
  const [d, factory] = await Promise.all([getKpis(user, range, { kpiId: intParam(sp.kpi), status: typeof sp.status === "string" ? sp.status : undefined, page }), factoryLabel(user)]);

  return (
    <>
      <PageHeader
        title="KPI"
        description={<Meta factory={factory.primary}><span>ผลเทียบเป้าหมายการใช้ทรัพยากร</span><span>{fmtRange(range.from, range.to)}</span></Meta>}
        actions={<><RangePicker from={range.from} to={range.to} presets={[30, 90, 180]} /><RecalcButton from={range.from} to={range.to} /></>}
      />
      {d.kpis.length === 0 ? (
        <EmptyState icon={GaugeIcon} title="ยังไม่มี KPI ของโรงงานนี้" description="ให้ผู้ดูแลระบบของบริษัทกำหนด KPI และเป้าหมายก่อน แล้วกดคำนวณผล KPI ใหม่" />
      ) : (
        <>
          <Panel
            title="ผลงวดล่าสุดที่ปิดแล้ว"
            description="ความสำเร็จเทียบเป้า และผล 12 งวดล่าสุดของแต่ละ KPI"
            actions={
              <dl className="flex gap-5 text-sm">
                <div><dt className="text-xs text-muted-foreground">ผ่านเป้า</dt><dd className="font-display text-lg font-semibold tabular">{fmtNum(d.summary.pass)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">ไม่ผ่านเป้า</dt><dd className="font-display text-lg font-semibold tabular">{fmtNum(d.summary.fail)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">อัตราผ่าน</dt><dd className="font-display text-lg font-semibold tabular">{d.summary.passRate === null ? "—" : `${fmtNum(d.summary.passRate, 1)}%`}</dd></div>
              </dl>
            }
          >
            <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {d.kpis.map((k) => (
                <li key={k.id} className="flex flex-col items-center text-center">
                  {k.latest ? (
                    <Gauge percent={k.latest.achievement} label="ความสำเร็จ" tone={k.latest.status === "PASS" ? "primary" : "critical"} size={160} />
                  ) : (
                    <div className="flex h-[110px] items-center text-sm text-muted-foreground">ยังไม่มีผล</div>
                  )}
                  <h3 className="mt-3 font-semibold">{k.name}</h3>
                  <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <Nameplate>{k.code}</Nameplate><span>{k.resource}</span><span>{PERIOD[k.periodType] ?? k.periodType}</span>
                  </p>
                  {k.latest ? (
                    <>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <Result status={k.latest.status} />
                        <span className="text-sm tabular"><span className="font-medium">{fmtNum(k.latest.actual)}</span> <span className="text-muted-foreground">/ เป้า {OP[k.operator] ?? k.operator} {fmtNum(k.target)} {k.unit}</span></span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">งวด {period(k.latest.start, k.latest.end)}</p>
                      <div className="mt-4 w-full max-w-60">
                        <ol className="flex gap-1" aria-label={`ผล ${k.history.length} งวดล่าสุด`}>
                          {k.history.map((h) => (
                            <li key={h.start} title={`${period(h.start, h.end)}: ${fmtNum(h.actual)} ${k.unit} ${h.status === "PASS" ? "ผ่านเป้า" : "ไม่ผ่านเป้า"}`}
                              className={cn("h-4 flex-1 rounded-[3px]", h.status === "PASS" ? "bg-primary" : "bg-status-critical")}>
                              <span className="sr-only">{period(h.start, h.end)} {h.status === "PASS" ? "ผ่านเป้า" : "ไม่ผ่านเป้า"}</span>
                            </li>
                          ))}
                          {Array.from({ length: 12 - k.history.length }, (_, i) => <li key={`e${i}`} aria-hidden className="h-4 flex-1 rounded-[3px] bg-muted" />)}
                        </ol>
                        <p className="mt-1.5 flex justify-between text-xs text-muted-foreground"><span>เก่า</span><span>{k.history.filter((h) => h.status === "PASS").length} จาก {k.history.length} งวดผ่านเป้า</span><span>ล่าสุด</span></p>
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">ยังไม่มีผลในงวดที่ปิดแล้ว กดคำนวณผล KPI ใหม่</p>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <section className="mt-6 rounded-[10px] border bg-card p-5">
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

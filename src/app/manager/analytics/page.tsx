import { AlertTriangle, BarChart3, Eye, Info, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ChartCard } from "@/components/data/chart-card";
import { BarList } from "@/components/data/bar-list";
import { EmptyState } from "@/components/data/empty-state";
import { Heatmap } from "@/components/data/heatmap";
import { RangePicker } from "@/components/manager/range-picker";
import { StructureFilters } from "@/components/manager/structure-filters";
import { DeltaText } from "@/components/manager/delta-text";
import { fmtDay, fmtDayLong, fmtRange } from "@/components/manager/format";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { weekGrid } from "@/server/domain/analytics";
import { factoryLabel } from "@/server/queries/context";
import { ForecastChart, type ForecastRow } from "@/components/manager/forecast-chart";
import { Meta, Panel } from "@/components/manager/panel";
import { resourceColor } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { resolveRange, structureFilter, structureFilterOptions } from "@/server/queries/manager/common";
import { getAnalytics } from "@/server/queries/manager/analytics";
import { DayDetail } from "./_components/day-detail";

const r2 = (v: number) => Math.round(v * 100) / 100;
const WEEKDAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

export default async function Page({ searchParams }: PageProps<"/manager/analytics">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const range = await resolveRange(user, sp, 30);
  const [options, d, factory] = await Promise.all([structureFilterOptions(user), getAnalytics(user, range, structureFilter(sp), typeof sp.metric === "string" ? sp.metric : undefined), factoryLabel(user)]);

  const metricOpts = d.metrics.map((m) => ({ value: m.key, label: `${m.resourceName} (${m.unit})` }));
  const header = (
    <>
      <PageHeader title="การใช้ทรัพยากร" description={<Meta factory={factory.primary}><span>{fmtRange(range.from, range.to)}</span>{range.isDefault && <span>30 วันล่าสุดที่มีข้อมูล</span>}</Meta>} actions={<RangePicker from={range.from} to={range.to} />} />
      <div className="mb-6">
        <StructureFilters options={options} extra={metricOpts.length ? [{ name: "metric", label: "ทรัพยากร", options: metricOpts, allowAll: false, value: d.selected?.key }] : []} />
      </div>
    </>
  );
  if (!d.selected) return <>{header}<EmptyState icon={BarChart3} title="ไม่มีข้อมูลตามตัวกรองนี้" description="ลองขยายช่วงวันที่หรือล้างตัวกรองโครงสร้าง" /></>;

  const { selected: s, band } = d;
  const color = resourceColor(s.resourceCode);
  const stats: [string, string][] = [
    ["รวม", `${fmtNum(s.total)} ${s.unit}`],
    ["เฉลี่ยต่อวัน", fmtNum(band.mean)],
    ["ต่ำสุด / สูงสุด", `${fmtNum(band.min)} / ${fmtNum(band.max)}`],
    ["ส่วนเบี่ยงเบน (σ)", fmtNum(band.sd)],
    ["ช่วงปกติ (μ ± 2σ)", `${fmtNum(band.lower)} – ${fmtNum(band.upper)}`],
    ["วันที่ผิดปกติ", `${band.anomalyDays} วัน`],
    ["|z| สูงสุด", fmtNum(band.maxAbsZ, 2)],
    ["วันที่มีข้อมูล", `${band.n} จาก ${range.days} วัน`],
  ];

  const fc = d.forecast;
  const chart: ForecastRow[] = d.points.map((p) => ({ label: fmtDay(p.day), value: p.value === null ? null : r2(p.value), band: band.n ? [r2(band.lower), r2(band.upper)] : undefined, anomaly: p.anomaly }));
  const last = chart[chart.length - 1];
  if (fc && last?.value != null) Object.assign(last, { predicted: last.value, spread: [last.value, last.value] });
  if (fc) chart.push(...fc.points.map((p) => ({ label: fmtDay(p.day), predicted: r2(p.predicted), spread: [r2(p.lower), r2(p.upper)] as [number, number] })));
  const grid = weekGrid(d.points);

  return (
    <>
      {header}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ChartCard
          title={fc ? `${s.resourceName} รายวันและคาดการณ์ 7 วัน` : `${s.resourceName} รายวัน`}
          description={`${s.unit} ต่อวัน แถบเทาคือช่วงปกติ μ ± 2σ จุดแดงคือวันที่ |z| ≥ 2${fc ? " เส้นประคือคาดการณ์" : ""}`}
          table={{
            columns: ["วันที่", `ค่า (${s.unit})`, "z-score", "สถานะ"],
            rows: [
              ...d.points.map((p) => [fmtDayLong(p.day), fmtNum(p.value), fmtNum(p.z, 2), p.value === null ? "ไม่มีข้อมูล" : p.anomaly ? "ผิดปกติ" : "ปกติ"]),
              ...(fc?.points.map((p) => [fmtDayLong(p.day), fmtNum(p.predicted), "—", `คาดการณ์ ${fmtNum(p.lower)}–${fmtNum(p.upper)}`]) ?? []),
            ],
          }}
        >
          <ForecastChart data={chart} color={color} label={s.resourceName} unit={s.unit} todayLabel={fc ? last?.label : undefined} />
          {fc ? (
            <dl className="mt-4 grid gap-4 border-t pt-4 text-sm sm:grid-cols-3">
              <div><dt className="text-muted-foreground">คาดการณ์รวม 7 วันข้างหน้า</dt><dd className="mt-0.5 font-display text-xl font-semibold tabular">{fmtNum(fc.next7Total)} <span className="text-sm font-normal text-muted-foreground">{s.unit}</span></dd></div>
              <div><dt className="text-muted-foreground">เทียบค่าเฉลี่ย 7 วันล่าสุด</dt><dd className="mt-1"><DeltaText change={fc.change} /></dd></div>
              <div><dt className="text-muted-foreground">ความเชื่อมั่น</dt><dd className="mt-0.5 tabular font-medium">{fc.confidence}%<span className="ml-1.5 text-xs font-normal text-muted-foreground">จาก {fc.n} วันที่มีข้อมูล</span></dd></div>
            </dl>
          ) : (
            <p className="mt-4 flex items-start gap-1.5 border-t pt-4 text-xs text-muted-foreground"><TrendingUp className="mt-0.5 size-3.5 shrink-0" aria-hidden />ยังคาดการณ์ไม่ได้ ต้องมีข้อมูลอย่างน้อย 3 วันในช่วงที่เลือก</p>
          )}
          {fc && <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />แนวโน้มเชิงเส้น ไม่รวมผลของวันหยุดหรือแผนการผลิตที่เปลี่ยนไป</p>}
        </ChartCard>

        <aside className="rounded-[10px] border bg-card">
          <div className="p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-semibold">สถิติ</h2>
              <span className="text-xs text-muted-foreground">เทียบช่วงก่อนหน้า <DeltaText change={d.change} /></span>
            </div>
            <dl className="space-y-2.5 text-sm">
              {stats.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right tabular font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="border-t p-5">
            <h2 className="mb-1 font-semibold">ข้อสังเกต</h2>
            {d.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่พบสัญญาณผิดปกติในช่วงนี้</p>
            ) : (
              <ul className="divide-y">
                {d.findings.map((f) => {
                  const Icon = f.level === "attention" ? AlertTriangle : Eye;
                  return (
                    <li key={f.text} className="flex gap-3 py-3 text-sm">
                      <Icon className={cn("mt-0.5 size-4 shrink-0", f.level === "attention" ? "text-status-serious" : "text-muted-foreground")} aria-hidden />
                      <div>
                        <p>{f.text}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{f.level === "attention" ? "ควรตรวจสอบ" : "เฝ้าดู"}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="รายวันตามวันในสัปดาห์" description={`${s.unit} ต่อวัน แต่ละคอลัมน์คือสัปดาห์ที่เริ่มวันจันทร์ สีเข้มคือใช้มาก`}>
          <Heatmap className="relative [&_th[scope=row]]:w-24" rows={WEEKDAYS} cols={grid.weeks.map(fmtDay)} values={grid.values} unit={s.unit} />
        </Panel>
        <Panel title="รายละเอียดวัน" description="เรียงจากวันที่ห่างจากค่าเฉลี่ยมากที่สุด เลือกวันเพื่อดูแหล่งที่ใช้">
          <DayDetail points={d.points} detail={d.dayDetail} mean={band.mean} sd={band.sd} unit={s.unit} label={s.resourceName} />
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="ตามแผนก">
          <BarList items={d.byDepartment.map((g) => ({ label: g.name, value: g.total, color }))} unit={s.unit} />
        </Panel>
        <Panel title="ตามเครื่องจักรและจุดตรวจ" description={d.byMachine.length > 8 ? `8 อันดับแรกจาก ${d.byMachine.length} รายการ` : undefined}>
          <BarList items={d.byMachine.slice(0, 8).map((g) => ({ label: g.name, value: g.total, color }))} unit={s.unit} />
        </Panel>
      </div>
    </>
  );
}

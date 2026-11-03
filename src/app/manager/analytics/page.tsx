import { BarChart3, Info, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { BarList } from "@/components/data/bar-list";
import { EmptyState } from "@/components/data/empty-state";
import { StatusBadge } from "@/components/data/status-badge";
import { RangePicker } from "@/components/manager/range-picker";
import { StructureFilters } from "@/components/manager/structure-filters";
import { DeltaText } from "@/components/manager/delta-text";
import { fmtDay, fmtDayLong, fmtRange } from "@/components/manager/format";
import { fmtNum } from "@/lib/format";
import { resourceColor } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { resolveRange, structureFilter, structureFilterOptions } from "@/server/queries/manager/common";
import { getAnalytics } from "@/server/queries/manager/analytics";
import { DayDetail } from "./_components/day-detail";

const r2 = (v: number) => Math.round(v * 100) / 100;

export default async function Page({ searchParams }: PageProps<"/manager/analytics">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const range = await resolveRange(user, sp, 30);
  const [options, d] = await Promise.all([structureFilterOptions(user), getAnalytics(user, range, structureFilter(sp), typeof sp.metric === "string" ? sp.metric : undefined)]);

  const metricOpts = d.metrics.map((m) => ({ value: m.key, label: `${m.resourceName} (${m.unit})` }));
  const header = (
    <>
      <PageHeader title="การใช้ทรัพยากร" description={<>{fmtRange(range.from, range.to)}{range.isDefault && " · แสดง 30 วันล่าสุดที่มีข้อมูล"}</>} actions={<RangePicker from={range.from} to={range.to} />} />
      <div className="mb-6">
        <StructureFilters options={options} extra={metricOpts.length ? [{ name: "metric", label: "ทรัพยากร", options: metricOpts, allowAll: false, value: d.selected?.key }] : []} />
      </div>
    </>
  );
  if (!d.selected) return <>{header}<EmptyState icon={BarChart3} title="ไม่มีข้อมูลตามตัวกรองนี้" description="ลองขยายช่วงวันที่หรือล้างตัวกรองโครงสร้าง" /></>;

  const { selected: s, band } = d;
  const color = resourceColor(s.resourceCode);
  const chart = d.points.map((p) => ({ label: fmtDay(p.day), value: p.value === null ? null : r2(p.value), band: band.n ? [r2(band.lower), r2(band.upper)] : undefined, anomaly: p.anomaly }));
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

  return (
    <>
      {header}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <ChartCard
          title={`${s.resourceName} รายวัน`}
          description={<>หน่วย {s.unit} · แถบสีเทาคือช่วงปกติ μ ± 2σ · จุดแดงคือวันที่ |z| ≥ 2 · เทียบช่วงก่อนหน้า <DeltaText change={d.change} /></>}
          table={{ columns: ["วันที่", `ค่า (${s.unit})`, "z-score", "สถานะ"], rows: d.points.map((p) => [fmtDayLong(p.day), fmtNum(p.value), fmtNum(p.z, 2), p.value === null ? "ไม่มีข้อมูล" : p.anomaly ? "ผิดปกติ" : "ปกติ"]) }}
        >
          <TrendChart data={chart} series={[{ key: "value", label: s.resourceName, color }]} unit={s.unit} band height={320} />
        </ChartCard>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">สถิติ</h2>
          <dl className="space-y-2.5 text-sm">
            {stats.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="tabular font-medium">{v}</dd></div>
            ))}
          </dl>
          <h3 className="mt-5 mb-2 text-sm font-semibold">ข้อสังเกต</h3>
          {d.findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่พบสัญญาณผิดปกติ</p>
          ) : (
            <ul className="space-y-2">
              {d.findings.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm">
                  <StatusBadge tone={f.level === "attention" ? "serious" : "warning"}>{f.level === "attention" ? "ควรตรวจสอบ" : "เฝ้าดู"}</StatusBadge>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-semibold">ตามแผนก</h2>
          <BarList items={d.byDepartment.map((g) => ({ label: g.name, value: g.total, color }))} unit={s.unit} />
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-semibold">ตามเครื่องจักร / จุดตรวจ</h2>
          <BarList items={d.byMachine.slice(0, 8).map((g) => ({ label: g.name, value: g.total, color }))} unit={s.unit} />
          {d.byMachine.length > 8 && <p className="mt-3 text-xs text-muted-foreground">แสดง 8 จาก {d.byMachine.length} รายการ</p>}
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-1 font-semibold">รายละเอียดวัน</h2>
          <p className="mb-2 text-xs text-muted-foreground">เรียงจากวันที่ห่างจากค่าเฉลี่ยมากที่สุด คลิกเพื่อดูแหล่งที่ใช้</p>
          <DayDetail points={d.points} detail={d.dayDetail} mean={band.mean} sd={band.sd} unit={s.unit} label={s.resourceName} />
        </section>
      </div>

      <div className="mt-6">
        {d.forecast ? (
          <ChartCard
            title="คาดการณ์ 7 วันข้างหน้า"
            description={<>แนวโน้มเชิงเส้นจาก {d.forecast.n} วันล่าสุดที่มีข้อมูล · ความเชื่อมั่น {d.forecast.confidence}% · รวม 7 วัน {fmtNum(d.forecast.next7Total)} {s.unit} เทียบค่าเฉลี่ยล่าสุด <DeltaText change={d.forecast.change} /></>}
            table={{ columns: ["วันที่", `คาดการณ์ (${s.unit})`, "ต่ำสุด", "สูงสุด"], rows: d.forecast.points.map((p) => [fmtDayLong(p.day), fmtNum(p.predicted), fmtNum(p.lower), fmtNum(p.upper)]) }}
          >
            <TrendChart data={d.forecast.points.map((p) => ({ label: fmtDay(p.day), predicted: r2(p.predicted), band: [r2(p.lower), r2(p.upper)] }))} series={[{ key: "predicted", label: "คาดการณ์", color }]} unit={s.unit} band height={200} />
            <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" />แถบแสดงช่วงความคลาดเคลื่อน 95% ของการคาดการณ์ ไม่รวมผลของวันหยุดหรือแผนการผลิตที่เปลี่ยนไป</p>
          </ChartCard>
        ) : (
          <EmptyState icon={TrendingUp} title="ยังคาดการณ์ไม่ได้" description="ต้องมีข้อมูลอย่างน้อย 3 วันในช่วงที่เลือก" />
        )}
      </div>
    </>
  );
}

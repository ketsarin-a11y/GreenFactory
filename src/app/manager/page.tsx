import Link from "next/link";
import { Bot } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { InstrumentBand, type Reading } from "@/components/data/instrument-band";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { Heatmap } from "@/components/data/heatmap";
import { Meter } from "@/components/data/meter";
import { ProportionBar } from "@/components/data/proportion-bar";
import { EmptyState } from "@/components/data/empty-state";
import { SEVERITY, Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { RangePicker } from "@/components/manager/range-picker";
import { DeltaText } from "@/components/manager/delta-text";
import { Meta, Panel, linkCls } from "@/components/manager/panel";
import { fmtDay, fmtDayLong, fmtRange } from "@/components/manager/format";
import { fmtCarbon, fmtNum } from "@/lib/format";
import { bkkDay, fmtDateTime } from "@/lib/time";
import { OTHER_COLOR, resourceColor, resourceIcon } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { factoryLabel } from "@/server/queries/context";
import { metricKey, resolveRange } from "@/server/queries/manager/common";
import { getHome, WINDOW_DAYS } from "@/server/queries/manager/home";

const OP: Record<string, string> = { "<=": "≤", "<": "<", ">=": "≥", ">": ">", "=": "=" };

export default async function Page({ searchParams }: PageProps<"/manager">) {
  const user = await requireTenantUser("MANAGER");
  const range = await resolveRange(user, await searchParams);
  const [d, factory] = await Promise.all([getHome(user, range), factoryLabel(user)]);
  const carbon = fmtCarbon(d.carbon.total);
  const q = `from=${range.from}&to=${range.to}`;

  const readings: Reading[] = [
    { label: "ไฟฟ้า", value: fmtNum(d.elec.total), unit: "kWh", change: d.elec.change, spark: d.elec.spark, note: "เทียบช่วงก่อนหน้า", href: `/manager/analytics?metric=${encodeURIComponent(metricKey("ELECTRICITY", "kWh"))}&${q}` },
    { label: "คาร์บอน", value: carbon.value, unit: carbon.unit, change: d.carbon.change, spark: d.carbon.spark, note: "เทียบช่วงก่อนหน้า", href: `/manager/carbon?${q}` },
    d.water
      ? { label: "น้ำประปา", value: fmtNum(d.water.total), unit: d.water.unit, change: d.water.change, spark: d.water.spark, note: "เทียบช่วงก่อนหน้า", href: `/manager/analytics?metric=${encodeURIComponent(d.water.key)}&${q}` }
      : { label: "น้ำประปา", value: "—", note: "ยังไม่มีข้อมูลน้ำในช่วงนี้" },
    { label: "การแจ้งเตือนที่เปิดอยู่", value: fmtNum(d.alerts.open), unit: "รายการ", change: d.alerts.change, spark: d.alerts.spark, note: `เกิดใหม่ ${fmtNum(d.alerts.triggered)} รายการในช่วงนี้`, href: "/manager/alerts?status=OPEN" },
  ];
  const live = d.live.latestAt
    ? `ข้อมูลล่าสุด ${fmtDateTime(d.live.latestAt)}, เซนเซอร์ออนไลน์ ${d.live.online}/${d.live.sensors}`
    : `ยังไม่มีข้อมูล, เซนเซอร์ออนไลน์ ${d.live.online}/${d.live.sensors}`;

  const series = [
    ...d.stacked.machines.map((m, i) => ({ key: `m${i}`, label: m, color: `var(--chart-${i + 1})` })),
    ...(d.stacked.hasOther ? [{ key: "other", label: "อื่น ๆ", color: OTHER_COLOR }] : []),
  ];
  const keyOf = (name: string) => (name === "อื่น ๆ" ? "other" : `m${d.stacked.machines.indexOf(name)}`);
  const chartData = d.stacked.days.map((row) => {
    const out: Record<string, string | number> = { label: fmtDay(row.day as string) };
    for (const [k, v] of Object.entries(row)) if (k !== "day") out[keyOf(k)] = Math.round((v as number) * 100) / 100;
    return out;
  });
  const refLabel = d.kpiRef === bkkDay(new Date()) ? "ถึงวันนี้" : `ถึง ${fmtDay(d.kpiRef)}`;

  return (
    <>
      <PageHeader
        title="ภาพรวมโรงงาน"
        description={<Meta factory={factory.primary}><span>{fmtRange(range.from, range.to)}</span>{range.isDefault && <span>7 วันล่าสุดที่มีข้อมูล</span>}</Meta>}
        actions={<RangePicker from={range.from} to={range.to} />}
      />

      <InstrumentBand readings={readings} live={live} />

      {d.records === 0 ? (
        <EmptyState title="ยังไม่มีข้อมูลในช่วงนี้" description="เลือกช่วงวันที่อื่น หรือให้พนักงานบันทึกค่ามิเตอร์ผ่านการสแกน QR" />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <ChartCard
              title="การใช้ไฟฟ้ารายวันตามเครื่องจักร"
              description={`kWh ต่อวัน แยก ${d.stacked.machines.length} เครื่องที่ใช้มากที่สุด${d.stacked.hasOther ? " และอื่น ๆ" : ""}`}
              table={{
                columns: ["วันที่", ...series.map((s) => s.label), "รวม (kWh)"],
                rows: chartData.map((r) => [r.label, ...series.map((s) => fmtNum((r[s.key] as number) ?? 0)), fmtNum(series.reduce((a, s) => a + ((r[s.key] as number) ?? 0), 0))]),
              }}
            >
              {series.length ? <TrendChart kind="bar" data={chartData} series={series} unit="kWh" height={440} /> : <p className="py-16 text-center text-sm text-muted-foreground">ไม่มีข้อมูลไฟฟ้าในช่วงนี้</p>}
            </ChartCard>

            <aside className="flex flex-col rounded-[10px] border bg-card">
              <div className="p-5">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <h2 className="font-semibold">การแจ้งเตือนที่ยังไม่ปิด</h2>
                  <Link href="/manager/alerts" className={linkCls}>ดูทั้งหมด</Link>
                </div>
                {d.openAlerts.length === 0 ? (
                  <p className="py-6 text-sm text-muted-foreground">ไม่มีการแจ้งเตือนค้างอยู่</p>
                ) : (
                  <ul className="divide-y">
                    {d.openAlerts.map((a) => (
                      <li key={String(a.alertId)} className="py-3">
                        <Link href={`/manager/alerts?alert=${a.alertId}`} className="line-clamp-2 text-sm font-medium hover:text-primary">{a.title}</Link>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Status map={SEVERITY} value={a.severity} />
                          {a.status === "ACKNOWLEDGED" && <span>รับทราบแล้ว</span>}
                          <span className="tabular">{fmtDateTime(a.triggeredAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-auto border-t p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-semibold">คุณภาพข้อมูล</h2>
                  <p className="flex items-baseline gap-1"><span className="font-display text-2xl font-semibold tabular">{d.quality === null ? "—" : `${d.quality}%`}</span><span className="text-xs text-muted-foreground">ระบุครบ</span></p>
                </div>
                <p className="mt-1 mb-4 text-xs text-muted-foreground">{fmtNum(d.records)} รายการในช่วงนี้ แยกตามที่มา</p>
                <ProportionBar parts={[
                  { label: "สแกน QR", value: d.qrCount, color: "var(--primary)" },
                  { label: "เซนเซอร์", value: d.sensorCount, color: "var(--chart-1)" },
                  { label: "กรอกเอง", value: d.records - d.qrCount - d.sensorCount, color: "var(--muted-foreground)" },
                ].filter((p) => p.value > 0)} />
                <Button asChild variant="outline" className="mt-5 w-full">
                  <Link href={`/manager/assistant?q=${encodeURIComponent("สรุปสถานการณ์โรงงาน 7 วันล่าสุด")}`}><Bot /> ให้ G-FAY สรุปภาพรวม</Link>
                </Button>
              </div>
            </aside>
          </div>

          <Panel
            title="การใช้ไฟฟ้ารายเครื่อง × วัน"
            description={`kWh ต่อวันของ ${d.heatmap.rows.length} เครื่องที่ใช้มากที่สุด ${fmtRange(d.heatmap.days[0], range.to)} สีเข้มคือใช้มาก`}
          >
            {d.heatmap.rows.length ? (
              <Heatmap className="relative [&_th[scope=row]]:w-28 sm:[&_th[scope=row]]:w-48" rows={d.heatmap.rows.map((r) => r.name)} cols={d.heatmap.days.map((x) => String(Number(x.slice(8))))} values={d.heatmap.rows.map((r) => r.values)} unit="kWh" />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลไฟฟ้ารายเครื่องใน {WINDOW_DAYS} วันนี้</p>
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="เทียบเป้าหมาย KPI" description={`ค่าสะสมในงวดปัจจุบัน${refLabel} เทียบเป้าทั้งงวด`} actions={<Link href="/manager/kpi" className={linkCls}>ผล KPI</Link>}>
              {d.kpis.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">ยังไม่มี KPI ของโรงงานนี้ ให้ผู้ดูแลระบบของบริษัทกำหนดเป้าหมายก่อน</p>
              ) : (
                <ul className="space-y-5">
                  {d.kpis.map((k) => {
                    const below = k.operator.includes("<");
                    const over = k.projected !== null && (below ? k.projected > k.target : k.projected < k.target);
                    return (
                      <li key={k.id}>
                        <Meter label={k.name} value={k.actual} target={k.target} unit={k.unit} goodWhen={below ? "below" : "above"} />
                        <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                          <span>เป้า {OP[k.operator] ?? k.operator} {fmtNum(k.target)} {k.unit}</span>
                          <span>{k.length === 1 ? fmtDayLong(k.start) : `วันที่ ${k.elapsed} จาก ${k.length} ของงวด`}</span>
                          {k.projected !== null && <span className={over ? "font-medium text-status-critical" : undefined}>คาดว่าทั้งงวด {fmtNum(k.projected)} {k.unit}</span>}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel title="ทรัพยากรทั้งหมด" description="ยอดรวมในช่วงนี้ แยกตามหน่วย เทียบช่วงก่อนหน้า" actions={<Link href={`/manager/compare?${q}`} className={linkCls}>เปรียบเทียบ</Link>}>
              <ul className="-my-2.5 divide-y text-sm">
                {d.resources.map((r) => {
                  const Icon = resourceIcon(r.resourceCode);
                  return (
                    <li key={r.key} className="flex items-center gap-3 py-2.5">
                      <Icon className="size-4 shrink-0" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />
                      <Link href={`/manager/analytics?metric=${encodeURIComponent(r.key)}&${q}`} className="min-w-0 flex-1 truncate hover:text-primary">{r.resourceName}</Link>
                      <span className="tabular font-medium">{fmtNum(r.total)} <span className="font-normal text-muted-foreground">{r.unit}</span></span>
                      <DeltaText change={r.change} className="w-24 justify-end text-xs" />
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

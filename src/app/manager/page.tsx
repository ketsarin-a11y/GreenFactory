import Link from "next/link";
import { Activity, ArrowRight, Bot, Cpu, Leaf, Zap } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { EmptyState } from "@/components/data/empty-state";
import { SEVERITY, ALERT_STATUS, Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { RangePicker } from "@/components/manager/range-picker";
import { DeltaText } from "@/components/manager/delta-text";
import { fmtDay, fmtRange, SOURCE_LABEL } from "@/components/manager/format";
import { fmtCarbon, fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { OTHER_COLOR, resourceColor, resourceIcon } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { resolveRange } from "@/server/queries/manager/common";
import { getHome } from "@/server/queries/manager/home";

export default async function Page({ searchParams }: PageProps<"/manager">) {
  const user = await requireTenantUser("MANAGER");
  const range = await resolveRange(user, await searchParams);
  const d = await getHome(user, range);
  const carbon = fmtCarbon(d.carbon.total);

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

  return (
    <>
      <PageHeader
        title="ภาพรวมโรงงาน"
        description={<>{fmtRange(range.from, range.to)}{range.isDefault && " · แสดง 7 วันล่าสุดที่มีข้อมูล"}</>}
        actions={<RangePicker from={range.from} to={range.to} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="พลังงานไฟฟ้า" value={fmtNum(d.elec.total)} unit="kWh" icon={Zap} change={d.elec.change} hint="เทียบช่วงก่อนหน้า" />
        <StatTile label="คาร์บอน" value={carbon.value} unit={carbon.unit} icon={Leaf} change={d.carbon.change} hint="เทียบช่วงก่อนหน้า" />
        <StatTile label="เครื่องจักรที่ใช้งาน" value={fmtNum(d.activeMachines)} unit="เครื่อง" icon={Cpu} hint={`มีข้อมูลในช่วงนี้ ${fmtNum(d.machinesWithData)} เครื่อง · ${d.resources.length} ทรัพยากร`} />
        <StatTile label="วันที่ผิดปกติ (ไฟฟ้า)" value={fmtNum(d.anomalyDays)} unit="วัน" icon={Activity} hint="ยอดรายวันนอกช่วง μ ± 2σ" />
      </div>

      {d.records === 0 ? (
        <div className="mt-6">
          <EmptyState title="ยังไม่มีข้อมูลในช่วงนี้" description="เลือกช่วงวันที่อื่น หรือให้พนักงานบันทึกค่ามิเตอร์ผ่านการสแกน QR" />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
          <ChartCard
            title="การใช้ไฟฟ้ารายวันตามเครื่องจักร"
            description={`kWh · ${d.stacked.machines.length} เครื่องที่ใช้มากที่สุด${d.stacked.hasOther ? " และอื่น ๆ" : ""}`}
            table={{
              columns: ["วันที่", ...series.map((s) => s.label), "รวม (kWh)"],
              rows: chartData.map((r) => [r.label, ...series.map((s) => fmtNum((r[s.key] as number) ?? 0)), fmtNum(series.reduce((a, s) => a + ((r[s.key] as number) ?? 0), 0))]),
            }}
          >
            {series.length ? <TrendChart kind="bar" data={chartData} series={series} unit="kWh" height={300} /> : <p className="py-16 text-center text-sm text-muted-foreground">ไม่มีข้อมูลไฟฟ้าในช่วงนี้</p>}
          </ChartCard>

          <section className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">การแจ้งเตือนที่ยังไม่ปิด</h2>
              <Link href="/manager/alerts" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                ทั้งหมด {d.openAlertCount > 0 && `(${d.openAlertCount})`}<ArrowRight className="size-3.5" />
              </Link>
            </div>
            {d.openAlerts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">ไม่มีการแจ้งเตือนค้างอยู่</p>
            ) : (
              <ul className="divide-y">
                {d.openAlerts.map((a) => (
                  <li key={String(a.alertId)} className="py-3">
                    <Link href={`/manager/alerts?alert=${a.alertId}`} className="block hover:text-primary">
                      <p className="line-clamp-2 text-sm font-medium">{a.title}</p>
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Status map={SEVERITY} value={a.severity} />
                      <Status map={ALERT_STATUS} value={a.status} />
                      <span className="tabular">{fmtDateTime(a.triggeredAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {d.resources.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-semibold">สรุปตามทรัพยากร</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {d.resources.slice(0, 6).map((r) => {
              const Icon = resourceIcon(r.resourceCode);
              return (
                <div key={r.key} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="size-4" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />
                    {r.resourceName}
                  </div>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="tabular text-2xl font-semibold">{fmtNum(r.total)}</span>
                    <span className="text-sm text-muted-foreground">{r.unit}</span>
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span className="tabular">{fmtNum(r.count)} รายการ</span>
                    <DeltaText change={r.change} />
                  </p>
                </div>
              );
            })}
          </div>
          {d.resources.length > 6 && <p className="mt-2 text-xs text-muted-foreground">และอีก {d.resources.length - 6} รายการ ดูทั้งหมดที่หน้าเปรียบเทียบช่วงเวลา</p>}
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">บันทึกล่าสุด</h2>
            <Link href="/manager/history" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">ประวัติทั้งหมด<ArrowRight className="size-3.5" /></Link>
          </div>
          {d.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีการบันทึก</p>
          ) : (
            <ul className="divide-y text-sm">
              {d.recent.map((r) => {
                const Icon = resourceIcon(r.resourceCode);
                return (
                  <li key={r.id} className="flex items-center gap-3 py-2.5">
                    <Icon className="size-4 shrink-0" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{r.target} · <span className="text-muted-foreground">{r.resourceName}</span></span>
                    <span className="tabular font-medium">{fmtNum(r.quantity)} <span className="font-normal text-muted-foreground">{r.unit}</span></span>
                    <span className="hidden w-20 text-xs text-muted-foreground sm:block">{SOURCE_LABEL[r.source] ?? r.source}</span>
                    <span className="hidden w-32 text-right text-xs tabular text-muted-foreground md:block">{fmtDateTime(r.usageAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">คุณภาพข้อมูล</h2>
          <p className="flex items-baseline gap-1.5"><span className="tabular text-3xl font-semibold">{d.quality === null ? "—" : `${d.quality}%`}</span><span className="text-sm text-muted-foreground">ข้อมูลครบ</span></p>
          <p className="mt-1 text-xs text-muted-foreground">นับจากเครื่องจักร แผนก อาคาร หน่วย และทรัพยากรที่ระบุในแต่ละรายการ</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">รายการในช่วงนี้</dt><dd className="tabular">{fmtNum(d.records)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">ผ่านการสแกน QR</dt><dd className="tabular">{fmtNum(d.qrCount)}{d.records > 0 && ` (${fmtNum((d.qrCount / d.records) * 100, 0)}%)`}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">กรอกเอง</dt><dd className="tabular">{fmtNum(d.records - d.qrCount)}</dd></div>
          </dl>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href={`/manager/assistant?q=${encodeURIComponent("สรุปสถานการณ์โรงงาน 7 วันล่าสุด")}`}><Bot /> คุยกับ G-FAY สรุปภาพรวม</Link>
          </Button>
        </section>
      </div>
    </>
  );
}

import { Info, Leaf } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { BarList } from "@/components/data/bar-list";
import { EmptyState } from "@/components/data/empty-state";
import { RangePicker } from "@/components/manager/range-picker";
import { fmtDay, fmtDayLong, fmtRange } from "@/components/manager/format";
import { fmtCarbon, fmtNum } from "@/lib/format";
import { resourceColor, resourceIcon } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { resolveRange } from "@/server/queries/manager/common";
import { getCarbon } from "@/server/queries/manager/carbon";

const c = (kg: number) => { const x = fmtCarbon(kg); return `${x.value} ${x.unit}`; };

export default async function Page({ searchParams }: PageProps<"/manager/carbon">) {
  const user = await requireTenantUser("MANAGER");
  const range = await resolveRange(user, await searchParams, 30);
  const d = await getCarbon(user, range);
  const total = fmtCarbon(d.total);

  const header = <PageHeader title="คาร์บอน" description={<>{fmtRange(range.from, range.to)}{range.isDefault && " · แสดง 30 วันล่าสุดที่มีข้อมูล"}</>} actions={<RangePicker from={range.from} to={range.to} presets={[7, 30]} />} />;
  if (d.byResource.length === 0) return <>{header}<EmptyState icon={Leaf} title="ยังไม่มีผลคำนวณคาร์บอนในช่วงนี้" description="คาร์บอนคำนวณอัตโนมัติเมื่อบันทึกทรัพยากรที่มีค่า Emission Factor ลองเลือกช่วงวันที่อื่น" /></>;

  const series = d.codes.map((code) => ({ key: code, label: d.byResource.find((r) => r.resourceCode === code)!.resourceName, color: resourceColor(code) }));
  const chart = d.daily.map((row) => ({ ...Object.fromEntries(Object.entries(row).filter(([k]) => k !== "day").map(([k, v]) => [k, Math.round((v as number) * 100) / 100])), label: fmtDay(row.day as string) }));
  const scopeTotal = d.scopes.reduce((a, s) => a + s.kg, 0);

  return (
    <>
      {header}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="คาร์บอนรวม" value={total.value} unit={total.unit} icon={Leaf} change={d.change} hint="เทียบช่วงก่อนหน้า" />
        <StatTile label="แหล่งปล่อยหลัก" value={d.top?.resourceName ?? "—"} hint={d.top ? `${c(d.top.kg)} · ${d.top.scope}` : undefined} />
        {d.scopes.slice(0, 2).map((s) => (
          <StatTile key={s.scope} label={s.scope} value={fmtCarbon(s.kg).value} unit={fmtCarbon(s.kg).unit} hint={`${fmtNum(scopeTotal ? (s.kg / scopeTotal) * 100 : 0, 1)}% ของทั้งหมด`} />
        ))}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">วิธีคำนวณตามทรัพยากร</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {d.byResource.map((r) => {
            const Icon = resourceIcon(r.resourceCode);
            return (
              <div key={r.key} className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2 font-medium">
                  <Icon className="size-4" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />{r.resourceName}
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{r.scope}</span>
                </div>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5 text-sm tabular">
                  <span className="font-medium">{fmtNum(r.activity)} {r.unit}</span>
                  <span className="text-muted-foreground">×</span>
                  <span className="font-medium">{r.factor === null ? "หลายค่า" : fmtNum(r.factor, 4)}</span>
                  <span className="text-xs text-muted-foreground">{r.factorUnit}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="font-semibold">{c(r.kg)}</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">แหล่งที่มา: {r.source} · {fmtNum(r.count)} รายการ</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <ChartCard
          title="คาร์บอนรายวันตามทรัพยากร"
          description="kgCO₂e"
          table={{ columns: ["วันที่", ...series.map((s) => s.label)], rows: d.daily.map((r) => [fmtDayLong(r.day as string), ...series.map((s) => fmtNum((r[s.key] as number) ?? 0))]) }}
        >
          <TrendChart kind="bar" data={chart} series={series} unit="kgCO₂e" height={300} />
        </ChartCard>
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">สัดส่วนตาม Scope</h2>
            <BarList items={d.scopes.map((s) => ({ label: s.scope, value: s.kg, color: "var(--chart-6)" }))} unit="kgCO₂e" />
          </section>
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">จุดปล่อยสูงสุดตามเครื่องจักร</h2>
            <BarList items={d.hotspots.slice(0, 6).map((h) => ({ label: h.name, value: h.kg, color: "var(--chart-6)" }))} unit="kgCO₂e" />
          </section>
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        ค่าคาร์บอนเป็นการประมาณจาก Emission Factor ที่ตั้งไว้ในระบบ (ค่าตัวอย่างยังไม่ผ่านการทวนสอบ) ไม่ใช่ผลการทวนสอบจากหน่วยงานรับรอง ตรวจสอบค่า Factor กับ อบก. ก่อนนำไปรายงานอย่างเป็นทางการ
        {d.withoutCarbon > 0 && ` · มี ${fmtNum(d.withoutCarbon)} รายการที่ยังไม่มีผลคาร์บอน (ไม่มี Factor ที่ตรงหน่วย)`}
      </p>
    </>
  );
}

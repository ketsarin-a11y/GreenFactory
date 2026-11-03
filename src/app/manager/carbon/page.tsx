import { Info, Leaf } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { InstrumentBand, type Reading } from "@/components/data/instrument-band";
import { ProportionBar } from "@/components/data/proportion-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Meta, Panel } from "@/components/manager/panel";
import { factoryLabel } from "@/server/queries/context";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { BarList } from "@/components/data/bar-list";
import { EmptyState } from "@/components/data/empty-state";
import { RangePicker } from "@/components/manager/range-picker";
import { fmtDay, fmtDayLong, fmtRange } from "@/components/manager/format";
import { fmtCarbon, fmtNum } from "@/lib/format";
import { OTHER_COLOR, resourceColor, resourceIcon } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { resolveRange } from "@/server/queries/manager/common";
import { getCarbon } from "@/server/queries/manager/carbon";

const SCOPE_COLOR: Record<string, string> = { "Scope 1": "var(--chart-2)", "Scope 2": "var(--chart-1)", "Scope 3": "var(--chart-7)" };
const c = (kg: number) => { const x = fmtCarbon(kg); return `${x.value} ${x.unit}`; };

export default async function Page({ searchParams }: PageProps<"/manager/carbon">) {
  const user = await requireTenantUser("MANAGER");
  const range = await resolveRange(user, await searchParams, 30);
  const [d, factory] = await Promise.all([getCarbon(user, range), factoryLabel(user)]);
  const total = fmtCarbon(d.total);

  const header = <PageHeader title="คาร์บอน" description={<Meta factory={factory.primary}><span>{fmtRange(range.from, range.to)}</span>{range.isDefault && <span>30 วันล่าสุดที่มีข้อมูล</span>}</Meta>} actions={<RangePicker from={range.from} to={range.to} presets={[7, 30]} />} />;
  if (d.byResource.length === 0) return <>{header}<EmptyState icon={Leaf} title="ยังไม่มีผลคำนวณคาร์บอนในช่วงนี้" description="คาร์บอนคำนวณอัตโนมัติเมื่อบันทึกทรัพยากรที่มีค่า Emission Factor ลองเลือกช่วงวันที่อื่น" /></>;

  const series = d.codes.map((code) => ({ key: code, label: d.byResource.find((r) => r.resourceCode === code)!.resourceName, color: resourceColor(code) }));
  const chart = d.daily.map((row) => ({ ...Object.fromEntries(Object.entries(row).filter(([k]) => k !== "day").map(([k, v]) => [k, Math.round((v as number) * 100) / 100])), label: fmtDay(row.day as string) }));
  const scope = (n: string) => d.scopes.find((x) => x.scope === n);
  const scopeReading = (n: string): Reading => {
    const x = scope(n);
    if (!x) return { label: n, value: "—", note: "ไม่มีรายการในช่วงนี้" };
    const f = fmtCarbon(x.kg);
    return { label: n, value: f.value, unit: f.unit, change: x.change, spark: x.spark, note: `${fmtNum((x.kg / d.total) * 100, 1)}% ของทั้งหมด` };
  };
  const perDay = fmtCarbon(d.perDay);
  const readings: Reading[] = [
    { label: "คาร์บอนรวม", value: total.value, unit: total.unit, change: d.change, spark: d.spark, note: "เทียบช่วงก่อนหน้า" },
    scopeReading("Scope 1"),
    scopeReading("Scope 2"),
    { label: "เฉลี่ยต่อวัน", value: perDay.value, unit: perDay.unit, change: d.change, spark: d.spark, note: `ตลอด ${range.days} วัน` },
  ];

  return (
    <>
      {header}
      <InstrumentBand readings={readings} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ChartCard
          title="คาร์บอนรายวันตามทรัพยากร"
          description="kgCO₂e ต่อวัน"
          table={{ columns: ["วันที่", ...series.map((s) => s.label)], rows: d.daily.map((r) => [fmtDayLong(r.day as string), ...series.map((s) => fmtNum((r[s.key] as number) ?? 0))]) }}
        >
          <TrendChart kind="bar" data={chart} series={series} unit="kgCO₂e" height={320} />
        </ChartCard>
        <aside className="rounded-[10px] border bg-card">
          <div className="p-5">
            <h2 className="mb-4 font-semibold">สัดส่วนตาม Scope</h2>
            <ProportionBar parts={d.scopes.map((x) => ({ label: x.scope, value: x.kg, color: SCOPE_COLOR[x.scope] ?? OTHER_COLOR }))} unit="kgCO₂e" />
          </div>
          <div className="border-t p-5">
            <h2 className="mb-4 font-semibold">สัดส่วนตามทรัพยากร</h2>
            <ProportionBar parts={[...d.byResource].sort((a, b) => b.kg - a.kg).map((r) => ({ label: `${r.resourceName} (${r.unit})`, value: r.kg, color: resourceColor(r.resourceCode) }))} unit="kgCO₂e" />
          </div>
        </aside>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="วิธีคำนวณ" description="คาร์บอน = ปริมาณที่ใช้ × Emission Factor แยกตามทรัพยากรและหน่วย">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ทรัพยากร</TableHead><TableHead className="text-right">ปริมาณที่ใช้</TableHead><TableHead className="text-right">Factor</TableHead>
                  <TableHead className="text-right">คาร์บอน</TableHead><TableHead>Scope</TableHead><TableHead>แหล่งที่มาของ Factor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.byResource.map((r) => {
                  const Icon = resourceIcon(r.resourceCode);
                  return (
                    <TableRow key={r.key}>
                      <TableCell><span className="flex items-center gap-2 whitespace-nowrap"><Icon className="size-4" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />{r.resourceName}</span><span className="text-xs text-muted-foreground">{fmtNum(r.count)} รายการ</span></TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular">{fmtNum(r.activity)} <span className="text-muted-foreground">{r.unit}</span></TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular">{r.factor === null ? "หลายค่า" : fmtNum(r.factor, 4)}<p className="text-xs text-muted-foreground">{r.factorUnit}</p></TableCell>
                      <TableCell className="text-right whitespace-nowrap font-medium tabular">{c(r.kg)}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.scope}</TableCell>
                      <TableCell className="min-w-48 text-sm whitespace-normal text-muted-foreground">{r.source}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Panel>
        <Panel title="จุดปล่อยสูงสุด" description="ตามเครื่องจักรและจุดตรวจ">
          <BarList items={d.hotspots.slice(0, 6).map((h) => ({ label: h.name, value: h.kg, color: "var(--chart-6)" }))} unit="kgCO₂e" />
        </Panel>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-[10px] border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="space-y-1">
          <p>ค่าคาร์บอนเป็นการประมาณจาก Emission Factor ที่ตั้งไว้ในระบบ (ค่าตัวอย่างยังไม่ผ่านการทวนสอบ) ไม่ใช่ผลการทวนสอบจากหน่วยงานรับรอง ตรวจสอบค่า Factor กับ อบก. ก่อนนำไปรายงานอย่างเป็นทางการ</p>
          {d.withoutCarbon > 0 && <p>มี {fmtNum(d.withoutCarbon)} รายการที่ยังไม่มีผลคาร์บอน เพราะไม่มี Factor ที่ตรงหน่วย</p>}
        </div>
      </div>
    </>
  );
}

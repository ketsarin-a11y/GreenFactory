import { ArrowDownRight, ArrowUpRight, GitCompare, Minus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Meta, Panel } from "@/components/manager/panel";
import { factoryLabel } from "@/server/queries/context";
import { EmptyState } from "@/components/data/empty-state";
import { StatusBadge } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RangePicker } from "@/components/manager/range-picker";
import { DeltaText } from "@/components/manager/delta-text";
import { fmtRange } from "@/components/manager/format";
import { fmtNum, fmtPct } from "@/lib/format";
import { resourceColor, resourceIcon } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { resolveRange } from "@/server/queries/manager/common";
import { getCompare, STABLE_PCT } from "@/server/queries/manager/compare";

const SIGNAL = {
  down: { tone: "good", label: "ลดลง", icon: ArrowDownRight },
  up: { tone: "serious", label: "เพิ่มขึ้น", icon: ArrowUpRight },
  stable: { tone: "neutral", label: "คงที่", icon: Minus },
  new: { tone: "info", label: "ไม่มีข้อมูลเทียบ", icon: Sparkles },
} as const;

export default async function Page({ searchParams }: PageProps<"/manager/compare">) {
  const user = await requireTenantUser("MANAGER");
  const range = await resolveRange(user, await searchParams, 7);
  const [d, factory] = await Promise.all([getCompare(user, range), factoryLabel(user)]);
  const span = Math.max(10, Math.ceil(Math.max(0, ...d.rows.map((r) => Math.abs(r.change ?? 0))) / 10) * 10);
  return (
    <>
      <PageHeader title="เปรียบเทียบช่วงเวลา" description={<Meta factory={factory.primary}><span>{fmtRange(range.from, range.to)} เทียบกับ {fmtRange(d.prev.from, d.prev.to)}</span></Meta>} actions={<RangePicker from={range.from} to={range.to} />} />
      {d.rows.length === 0 ? (
        <EmptyState icon={GitCompare} title="ไม่มีข้อมูลทั้งสองช่วง" description="เลือกช่วงวันที่ที่มีการบันทึกข้อมูล" />
      ) : (
        <>
          <Panel
            title="การเปลี่ยนแปลงตามทรัพยากร"
            description={d.biggest ? `เปลี่ยนมากที่สุด: ${d.biggest.resourceName} (${d.biggest.unit}) ${fmtPct(d.biggest.change)}` : "ยังไม่มีข้อมูลเทียบ"}
            actions={
              <dl className="flex gap-5 text-sm">
                {([["ลดลง", d.counts.down], ["เพิ่มขึ้น", d.counts.up], [`คงที่ (±${STABLE_PCT}%)`, d.counts.stable]] as const).map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-display text-lg font-semibold tabular">{fmtNum(v)}</dd></div>
                ))}
              </dl>
            }
          >
            <ul className="divide-y">
              <li aria-hidden className="hidden pb-1 text-xs text-muted-foreground tabular sm:grid sm:grid-cols-[200px_minmax(0,1fr)_96px] sm:gap-x-4">
                <span />
                <span className="flex justify-between"><span>−{span}%</span><span>0%</span><span>+{span}%</span></span>
                <span />
              </li>
              {d.rows.map((r) => {
                const Icon = resourceIcon(r.resourceCode);
                // Shared %-axis: previous period sits on 0%, the current dot at its Δ%.
                const p = 50, c = r.change === null ? 50 : 50 + (Math.max(-span, Math.min(span, r.change)) / span) * 50;
                const color = resourceColor(r.resourceCode);
                return (
                  <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[200px_minmax(0,1fr)_96px]">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <Icon className="size-4 shrink-0" style={{ color }} aria-hidden />
                      <span className="truncate">{r.resourceName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{r.unit}</span>
                    </span>
                    <div className="relative col-span-2 h-6 sm:col-span-1 sm:row-start-1 sm:col-start-2" role="img" aria-label={`${r.resourceName} ช่วงก่อนหน้า ${fmtNum(r.previous)} ช่วงนี้ ${fmtNum(r.current)} ${r.unit}`}>
                      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                      <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                      {r.change !== null && <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full opacity-40" style={{ left: `${Math.min(p, c)}%`, width: `${Math.abs(c - p)}%`, background: color }} />}
                      {r.previous > 0 && <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card" style={{ left: `${p}%`, borderColor: "var(--muted-foreground)" }} title={`ช่วงก่อนหน้า ${fmtNum(r.previous)} ${r.unit}`} />}
                      <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card" style={{ left: `${c}%`, background: color }} title={`ช่วงนี้ ${fmtNum(r.current)} ${r.unit}`} />
                    </div>
                    <DeltaText change={r.change} className="row-start-1 col-start-2 justify-end text-sm sm:col-start-3" />
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full border-2 border-muted-foreground" />ช่วงก่อนหน้า</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-foreground" />ช่วงนี้ (สีตามทรัพยากร)</span>
              <span>แกนคือ % เปลี่ยนแปลง แต่ละแถวรวมเฉพาะหน่วยเดียวกัน</span>
            </p>
          </Panel>
          <section className="mt-6 overflow-x-auto rounded-[10px] border bg-card p-5">
            <h2 className="mb-2 font-semibold">ตัวเลขทั้งหมด</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ทรัพยากร</TableHead><TableHead>หน่วย</TableHead>
                  <TableHead className="text-right">ช่วงก่อนหน้า</TableHead><TableHead className="text-right">ช่วงนี้</TableHead>
                  <TableHead className="text-right">เปลี่ยนแปลง</TableHead><TableHead>สัญญาณ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.rows.map((r) => {
                  const Icon = resourceIcon(r.resourceCode);
                  const s = SIGNAL[r.signal as keyof typeof SIGNAL];
                  return (
                    <TableRow key={r.key}>
                      <TableCell><span className="flex items-center gap-2"><Icon className="size-4" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />{r.resourceName}</span></TableCell>
                      <TableCell className="text-muted-foreground">{r.unit}</TableCell>
                      <TableCell className="text-right tabular">{fmtNum(r.previous)}</TableCell>
                      <TableCell className="text-right tabular font-medium">{fmtNum(r.current)}</TableCell>
                      <TableCell className="text-right"><DeltaText change={r.change} /></TableCell>
                      <TableCell><StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
                      </section>
        </>
      )}
    </>
  );
}

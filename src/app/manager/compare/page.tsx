import { ArrowDownRight, ArrowUpRight, GitCompare, Minus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
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
  const d = await getCompare(user, range);
  return (
    <>
      <PageHeader title="เปรียบเทียบช่วงเวลา" description={<>{fmtRange(range.from, range.to)} เทียบกับ {fmtRange(d.prev.from, d.prev.to)} (จำนวนวันเท่ากัน)</>} actions={<RangePicker from={range.from} to={range.to} />} />
      {d.rows.length === 0 ? (
        <EmptyState icon={GitCompare} title="ไม่มีข้อมูลทั้งสองช่วง" description="เลือกช่วงวันที่ที่มีการบันทึกข้อมูล" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="ลดลง" value={fmtNum(d.counts.down)} unit="รายการ" icon={ArrowDownRight} />
            <StatTile label="เพิ่มขึ้น" value={fmtNum(d.counts.up)} unit="รายการ" icon={ArrowUpRight} />
            <StatTile label="คงที่" value={fmtNum(d.counts.stable)} unit="รายการ" icon={Minus} hint={`เปลี่ยนน้อยกว่า ±${STABLE_PCT}%`} />
            <StatTile label="เปลี่ยนมากที่สุด" value={d.biggest ? fmtPct(d.biggest.change) : "—"} hint={d.biggest ? `${d.biggest.resourceName} (${d.biggest.unit})` : undefined} />
          </div>
          <section className="mt-6 overflow-x-auto rounded-xl border bg-card p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ทรัพยากร</TableHead><TableHead>หน่วย</TableHead>
                  <TableHead className="text-right">ช่วงก่อนหน้า</TableHead><TableHead className="text-right">ช่วงนี้</TableHead>
                  <TableHead className="text-right">เปลี่ยนแปลง</TableHead><TableHead className="w-48">การเคลื่อนไหว</TableHead><TableHead>สัญญาณ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.rows.map((r) => {
                  const Icon = resourceIcon(r.resourceCode);
                  const s = SIGNAL[r.signal as keyof typeof SIGNAL];
                  const w = r.change === null ? 0 : Math.min(50, Math.abs(r.change) / 2);
                  return (
                    <TableRow key={r.key}>
                      <TableCell><span className="flex items-center gap-2"><Icon className="size-4" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />{r.resourceName}</span></TableCell>
                      <TableCell className="text-muted-foreground">{r.unit}</TableCell>
                      <TableCell className="text-right tabular">{fmtNum(r.previous)}</TableCell>
                      <TableCell className="text-right tabular font-medium">{fmtNum(r.current)}</TableCell>
                      <TableCell className="text-right"><DeltaText change={r.change} /></TableCell>
                      <TableCell>
                        <div className="relative h-2 rounded-full bg-muted" aria-hidden>
                          <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                          {r.change !== null && (
                            <div className="absolute inset-y-0 rounded-full" style={{ background: resourceColor(r.resourceCode), width: `${w}%`, ...(r.change >= 0 ? { left: "50%" } : { right: "50%" }) }} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="mt-3 text-xs text-muted-foreground">แต่ละแถวรวมเฉพาะหน่วยเดียวกัน ไม่รวมค่าที่ต่างหน่วย · แถบกลางคือ 0% เต็มแถบด้านละ ±100%</p>
          </section>
        </>
      )}
    </>
  );
}

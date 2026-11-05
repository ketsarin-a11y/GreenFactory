import Link from "next/link";
import { Cpu } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Nameplate } from "@/components/data/nameplate";
import { Meta } from "@/components/manager/panel";
import { factoryLabel } from "@/server/queries/context";
import { EmptyState } from "@/components/data/empty-state";
import { MACHINE_STATUS, Status, StatusBadge } from "@/components/data/status-badge";
import { UrlFilters } from "@/components/data/url-filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { requireTenantUser } from "@/server/auth/current-user";
import { intParam, structureFilterOptions } from "@/server/queries/manager/common";
import { getMachines } from "@/server/queries/manager/machines";

export default async function Page({ searchParams }: PageProps<"/manager/machines">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : undefined;
  const [d, opts, factory] = await Promise.all([
    getMachines(user, { q, status: typeof sp.status === "string" ? sp.status : undefined, department: intParam(sp.department) }),
    structureFilterOptions(user),
    factoryLabel(user),
  ]);
  const s = d.summary;
  return (
    <>
      <PageHeader title="เครื่องจักร" description={<Meta factory={factory.primary}><span>สถานะ เซนเซอร์ QR Code และการแจ้งเตือนของเครื่องจักร</span></Meta>} />
      <section className="rounded-[10px] border bg-card p-5">
        <dl className="mb-5 flex flex-wrap gap-x-8 gap-y-3 border-b pb-5 text-sm">
          {([["เครื่องที่แสดง", s.total], ["มีเซนเซอร์", s.withSensor], ["มี QR Code", s.withQr], ["มีการแจ้งเตือนค้าง", s.withAlert], ["ยังไม่มีข้อมูล", s.noData]] as const).map(([k, v]) => (
            <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-display text-xl font-semibold tabular">{fmtNum(v)}</dd></div>
          ))}
        </dl>
        <UrlFilters fields={[
          { type: "search", name: "q", placeholder: "ค้นหารหัสหรือชื่อเครื่อง" },
          { type: "select", name: "status", label: "สถานะ", options: Object.entries(MACHINE_STATUS).map(([value, [, label]]) => ({ value, label })) },
          { type: "select", name: "department", label: "แผนก", options: opts.departments },
        ]} />
        {d.rows.length === 0 ? (
          <EmptyState icon={Cpu} title="ไม่พบเครื่องจักร" description="ลองล้างตัวกรอง หรือให้ผู้ดูแลระบบของบริษัทเพิ่มเครื่องจักร" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เครื่องจักร</TableHead><TableHead>ตำแหน่ง</TableHead><TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">เซนเซอร์</TableHead><TableHead className="text-right">QR</TableHead>
                  <TableHead>การแจ้งเตือน</TableHead><TableHead className="text-right">บันทึกล่าสุด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link href={`/manager/machines/${m.id}`} className="font-medium hover:text-primary hover:underline">{m.name}</Link>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Nameplate>{m.code}</Nameplate><span>{m.type}</span></p>
                    </TableCell>
                    <TableCell className="text-sm">{m.department}<p className="text-xs text-muted-foreground">{m.line}</p></TableCell>
                    <TableCell><Status map={MACHINE_STATUS} value={m.status} /></TableCell>
                    <TableCell className="text-right tabular">{m.sensors}</TableCell>
                    <TableCell className="text-right tabular">{m.qr}</TableCell>
                    <TableCell>{m.openAlerts > 0 ? <StatusBadge tone="critical">ค้าง {m.openAlerts}</StatusBadge> : <span className="text-sm text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right text-sm tabular text-muted-foreground">{m.lastReading ? fmtDateTime(m.lastReading) : "ยังไม่มีข้อมูล"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </>
  );
}

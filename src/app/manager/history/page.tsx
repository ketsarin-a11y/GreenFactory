import { History, Paperclip } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Nameplate } from "@/components/data/nameplate";
import { Meta } from "@/components/manager/panel";
import { factoryLabel } from "@/server/queries/context";
import { EmptyState } from "@/components/data/empty-state";
import { PROCESSING, Status } from "@/components/data/status-badge";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StructureFilters } from "@/components/manager/structure-filters";
import { SOURCE_LABEL } from "@/components/manager/format";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { resourceColor, resourceIcon } from "@/lib/resources";
import { requireTenantUser } from "@/server/auth/current-user";
import { intParam, structureFilterOptions } from "@/server/queries/manager/common";
import { getHistory, HISTORY_PAGE_SIZE } from "@/server/queries/manager/history";

export default async function Page({ searchParams }: PageProps<"/manager/history">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const page = pageParam(sp.page);
  const [d, opts, factory] = await Promise.all([
    getHistory(user, { q: s("q")?.trim().slice(0, 100), resource: s("resource"), source: s("source"), buildingId: intParam(sp.building), departmentId: intParam(sp.department), from: s("from"), to: s("to"), page }),
    structureFilterOptions(user),
    factoryLabel(user),
  ]);
  return (
    <>
      <PageHeader title="ประวัติการบันทึก" description={<Meta factory={factory.primary}><span>ทุกรายการที่บันทึก เรียงจากล่าสุด</span></Meta>} />
      <section className="rounded-[10px] border bg-card p-5">
        <UrlFilters fields={[
          { type: "search", name: "q", placeholder: "ค้นหาเลขอ้างอิง เครื่องจักร แผนก อาคาร หรือทรัพยากร" },
          { type: "select", name: "resource", label: "ทรัพยากร", options: d.resources.map((r) => ({ value: r.resourceCode, label: r.resourceName })) },
          { type: "select", name: "source", label: "ที่มา", options: [{ value: "QR", label: SOURCE_LABEL.QR }, { value: "MANUAL", label: SOURCE_LABEL.MANUAL }] },
          { type: "date", name: "from", label: "ตั้งแต่" },
          { type: "date", name: "to", label: "ถึง" },
        ]} />
        <div className="mb-4"><StructureFilters options={opts} depth={2} /></div>
        {d.rows.length === 0 ? (
          <EmptyState icon={History} title="ไม่พบรายการ" description="ลองล้างตัวกรองหรือเปลี่ยนช่วงวันที่" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันเวลา</TableHead><TableHead>เครื่องจักร / ตำแหน่ง</TableHead><TableHead>ทรัพยากร</TableHead>
                  <TableHead className="text-right">ปริมาณ</TableHead><TableHead>ที่มา</TableHead><TableHead>ประมวลผล</TableHead><TableHead>อ้างอิง</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.rows.map((r) => {
                  const Icon = resourceIcon(r.resourceCode);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap tabular">{fmtDateTime(r.usageAt)}</TableCell>
                      <TableCell className="text-sm"><span className="flex flex-wrap items-center gap-2">{r.target}{r.targetCode && <Nameplate>{r.targetCode}</Nameplate>}</span><p className="text-xs text-muted-foreground">{r.location}</p></TableCell>
                      <TableCell><span className="flex items-center gap-1.5 whitespace-nowrap"><Icon className="size-4" style={{ color: resourceColor(r.resourceCode) }} aria-hidden />{r.resourceName}</span></TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular">{fmtNum(r.quantity)} <span className="text-muted-foreground">{r.unit}</span></TableCell>
                      <TableCell className="text-sm">{SOURCE_LABEL[r.source] ?? r.source}<p className="text-xs text-muted-foreground">{r.recorder}</p></TableCell>
                      <TableCell><Status map={PROCESSING} value={r.processing} /></TableCell>
                      <TableCell>
                        <Nameplate>{r.reference}</Nameplate>
                        {r.hasEvidence && <a href={`/api/files/evidence/${r.id}`} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 text-xs text-primary hover:underline"><Paperclip className="size-3" />หลักฐาน</a>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <Pagination page={page} totalPages={Math.ceil(d.total / HISTORY_PAGE_SIZE)} total={d.total} params={sp} pathname="/manager/history" />
      </section>
    </>
  );
}

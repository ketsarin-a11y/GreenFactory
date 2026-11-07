import { Download, Zap } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Pagination, pageParam } from "@/components/data/pagination";
import { UrlFilters } from "@/components/data/url-filters";
import { PROCESSING, Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heatmap } from "@/components/data/heatmap";
import { Nameplate } from "@/components/data/nameplate";
import { SummaryStrip } from "@/components/company/summary-strip";
import { SOURCE_LABEL } from "@/components/company/labels";
import { requireTenantUser } from "@/server/auth/current-user";
import { listUsage, resourceOptions, usageFilter, usageHeatmap, USAGE_PAGE } from "@/server/queries/company/usage";
import { factoryFilterOptions } from "@/server/queries/company/options";
import { fmtCarbon, fmtNum } from "@/lib/format";
import { fmtDate, fmtDateTime, startOfBkkDay } from "@/lib/time";

export default async function Page({ searchParams }: PageProps<"/company/usage">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const { where, from, to } = usageFilter(user, sp);
  const resourceId = Number(typeof sp.resource === "string" ? sp.resource : "") || undefined;
  const [data, factories, resources, heat] = await Promise.all([
    listUsage(user, sp, page), factoryFilterOptions(user), resourceOptions(), usageHeatmap(where, from, to, resourceId),
  ]);
  const carbon = fmtCarbon(data.carbonKg);
  const qs = new URLSearchParams(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string" && e[0] !== "page")).toString();
  return (
    <>
      <PageHeader
        title="การใช้ทรัพยากร"
        description={`รายการที่บันทึกในทุกโรงงาน ช่วง ${fmtDate(startOfBkkDay(data.from))} – ${fmtDate(startOfBkkDay(data.to))}`}
        actions={<Button variant="outline" className="h-10" asChild><a href={`/api/company/usage?${qs}`}><Download /> ส่งออก CSV</a></Button>}
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาเลขอ้างอิง เครื่องจักร จุดตรวจวัด หมายเหตุ" },
          { type: "select", name: "factory", label: "โรงงาน", options: factories },
          { type: "select", name: "resource", label: "ทรัพยากร", options: resources },
          { type: "select", name: "source", label: "แหล่งที่มา", options: Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label })) },
          { type: "date", name: "from", label: "ตั้งแต่" },
          { type: "date", name: "to", label: "ถึง" },
        ]}
      />
      {data.totals.length > 0 && (
        <SummaryStrip
          className="mb-4"
          items={[
            ...data.totals.map((t) => ({ label: t.name, value: fmtNum(t.quantity), unit: t.unit, hint: `${fmtNum(t.records)} รายการ` })),
            { label: "คาร์บอนรวม", value: carbon.value, unit: carbon.unit, hint: "เฉพาะรายการที่คำนวณได้" },
          ]}
        />
      )}
      {heat && (
        <section className="mb-4 rounded-[10px] border bg-card p-5" aria-labelledby="heat">
          <h2 id="heat" className="font-semibold">{heat.resource} ราย{heat.weekly ? "สัปดาห์" : "วัน"} แยกเครื่องจักรและจุดตรวจวัด</h2>
          <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
            หน่วย {heat.unit} สีเข้มคือใช้มาก ช่องลายคือวันที่ไม่มีการบันทึก
            {heat.hiddenRows > 0 && ` แสดง ${fmtNum(heat.rows.length)} รายการที่ใช้มากที่สุด`}
            {!resourceId && " เลือกทรัพยากรในตัวกรองเพื่อดูประเภทอื่น"}
          </p>
          <Heatmap rows={heat.rows} cols={heat.cols} values={heat.values} unit={heat.unit} colLabelEvery={heat.weekly ? 2 : 5} />
        </section>
      )}
      {data.rows.length === 0 ? (
        <EmptyState icon={Zap} title="ไม่พบรายการในช่วงนี้" description="ลองขยายช่วงวันที่ หรือล้างตัวกรอง ข้อมูลมาจากการสแกน QR และการบันทึกของผู้ปฏิบัติงาน" />
      ) : (
        <div className="overflow-x-auto rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันเวลา</TableHead>
                <TableHead>เป้าหมาย</TableHead>
                <TableHead>ทรัพยากร</TableHead>
                <TableHead className="text-right">ปริมาณ</TableHead>
                <TableHead className="text-right">คาร์บอน (kgCO₂e)</TableHead>
                <TableHead>แหล่งที่มา</TableHead>
                <TableHead>ผู้บันทึก</TableHead>
                <TableHead>ประมวลผล</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="tabular text-xs">
                    {fmtDateTime(r.usageAt)}
                    <p className="text-[11px] text-muted-foreground">{r.reference}</p>
                  </TableCell>
                  <TableCell className="text-xs">
                    <p className="flex items-center gap-2">{r.targetCode && <Nameplate>{r.targetCode}</Nameplate>}<span>{r.targetName}</span></p>
                    <p className="mt-0.5 text-muted-foreground">{r.factory}</p>
                  </TableCell>
                  <TableCell>{r.resource}</TableCell>
                  <TableCell className="tabular text-right">{fmtNum(r.quantity)} <span className="text-xs text-muted-foreground">{r.unit}</span></TableCell>
                  <TableCell className="tabular text-right">{r.carbonKg === null ? "—" : fmtNum(r.carbonKg)}</TableCell>
                  <TableCell className="text-xs">{SOURCE_LABEL[r.source] ?? r.source}</TableCell>
                  <TableCell className="text-xs">{r.recorder}</TableCell>
                  <TableCell><Status map={PROCESSING} value={r.processing} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} totalPages={Math.ceil(data.total / USAGE_PAGE)} total={data.total} params={sp} pathname="/company/usage" />
    </>
  );
}

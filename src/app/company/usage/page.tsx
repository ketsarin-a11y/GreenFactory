import { Download, Zap } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Pagination, pageParam } from "@/components/data/pagination";
import { UrlFilters } from "@/components/data/url-filters";
import { PROCESSING, Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SOURCE_LABEL } from "@/components/company/labels";
import { requireTenantUser } from "@/server/auth/current-user";
import { listUsage, resourceOptions, USAGE_PAGE } from "@/server/queries/company/usage";
import { factoryFilterOptions } from "@/server/queries/company/options";
import { fmtCarbon, fmtNum } from "@/lib/format";
import { fmtDate, fmtDateTime, startOfBkkDay } from "@/lib/time";
import { resourceIcon } from "@/lib/resources";

export default async function Page({ searchParams }: PageProps<"/company/usage">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [data, factories, resources] = await Promise.all([listUsage(user, sp, page), factoryFilterOptions(user), resourceOptions()]);
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
      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="ยอดรวมตามตัวกรอง">
        {data.totals.map((t) => {
          const Icon = resourceIcon(t.code);
          return (
            <div key={`${t.code}-${t.unit}`} className="rounded-xl border bg-card p-4">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="size-4" aria-hidden />{t.name}</p>
              <p className="mt-1"><span className="tabular text-2xl font-semibold">{fmtNum(t.quantity)}</span> <span className="text-sm text-muted-foreground">{t.unit}</span></p>
              <p className="text-xs text-muted-foreground tabular">{fmtNum(t.records)} รายการ</p>
            </div>
          );
        })}
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">คาร์บอนรวม</p>
          <p className="mt-1"><span className="tabular text-2xl font-semibold">{carbon.value}</span> <span className="text-sm text-muted-foreground">{carbon.unit}</span></p>
          <p className="text-xs text-muted-foreground">เฉพาะรายการที่คำนวณคาร์บอนได้</p>
        </div>
      </section>
      {data.rows.length === 0 ? (
        <EmptyState icon={Zap} title="ไม่พบรายการในช่วงนี้" description="ลองขยายช่วงวันที่ หรือล้างตัวกรอง ข้อมูลมาจากการสแกน QR และการบันทึกของผู้ปฏิบัติงาน" />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันเวลา</TableHead>
                <TableHead>โรงงาน / เป้าหมาย</TableHead>
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
                    <p className="font-mono text-[11px] text-muted-foreground">{r.reference}</p>
                  </TableCell>
                  <TableCell className="text-xs"><p>{r.factory}</p><p className="text-muted-foreground">{r.target}</p></TableCell>
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

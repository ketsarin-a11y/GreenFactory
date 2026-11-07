import Link from "next/link";
import { Building2, Download } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { EmptyState } from "@/components/data/empty-state";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PLAN_LABEL, ago } from "@/components/platform/labels";
import { Nameplate } from "@/components/data/nameplate";
import { Sparkline } from "@/components/data/sparkline";
import { fmtNum } from "@/lib/format";
import { requireUser } from "@/server/auth/current-user";
import { listCompanies } from "@/server/queries/platform/companies";
import { CreateCompanyButton } from "./_components/company-form";
import { CompanyActions } from "./_components/company-actions";

export default async function Page({ searchParams }: PageProps<"/platform/companies">) {
  await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const d = await listCompanies(sp, page);
  const qs = new URLSearchParams(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string" && e[0] !== "page")).toString();

  return (
    <>
      <PageHeader
        title="บริษัท"
        description="ลูกค้าทั้งหมดบนแพลตฟอร์ม พร้อมจำนวนรายการบันทึก 30 วันที่ผ่านมา"
        actions={
          <>
            <Button variant="outline" className="h-10" asChild>
              <a href={`/api/platform/companies/export${qs ? `?${qs}` : ""}`} download>
                <Download /> ส่งออก CSV
              </a>
            </Button>
            <CreateCompanyButton />
          </>
        }
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหารหัส ชื่อ อีเมล โทรศัพท์ จังหวัด หรือชื่อผู้ใช้" },
          { type: "select", name: "industry", label: "อุตสาหกรรม", options: d.industries.map((i) => ({ value: i, label: i })) },
          {
            type: "select",
            name: "status",
            label: "สถานะ",
            options: [
              { value: "ACTIVE", label: "ใช้งานอยู่" },
              { value: "PENDING", label: "รอตรวจสอบ" },
              { value: "SUSPENDED", label: "ระงับใช้งาน" },
            ],
          },
        ]}
      />
      {d.rows.length === 0 ? (
        <EmptyState icon={Building2} title="ไม่พบบริษัท" description="ลองล้างตัวกรอง หรือกด “เพิ่มบริษัท” เพื่อสร้างลูกค้ารายใหม่พร้อมผู้ดูแลบริษัท" />
      ) : (
        <div className="rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>บริษัท</TableHead>
                <TableHead>รหัส</TableHead>
                <TableHead>อุตสาหกรรม</TableHead>
                <TableHead className="text-right">โรงงาน</TableHead>
                <TableHead className="text-right">ผู้ใช้</TableHead>
                <TableHead className="text-right">เครื่องจักร</TableHead>
                <TableHead className="w-32">บันทึก 30 วัน</TableHead>
                <TableHead>บันทึกล่าสุด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-10"><span className="sr-only">การจัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.rows.map((c) => (
                <TableRow key={c.companyId}>
                  <TableCell className="max-w-72">
                    <Link href={`/platform/companies/${c.companyId}`} className="block truncate font-medium hover:underline">{c.companyName}</Link>
                    <span className="block truncate text-xs text-muted-foreground">{c.email ?? "ไม่มีอีเมล"}</span>
                  </TableCell>
                  <TableCell><Nameplate>{c.companyCode}</Nameplate></TableCell>
                  <TableCell>
                    <span className="block">{c.industryType ?? "ไม่ระบุ"}</span>
                    <span className="block text-xs text-muted-foreground">แพ็กเกจ {c.subscriptionPlan ? (PLAN_LABEL[c.subscriptionPlan] ?? c.subscriptionPlan) : "ไม่ระบุ"}</span>
                  </TableCell>
                  <TableCell className="text-right tabular">{fmtNum(c._count.factories, 0)}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(c._count.users, 0)}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(c.machines, 0)}</TableCell>
                  <TableCell>
                    {c.records30 > 0 ? (
                      <span className="flex items-center gap-2">
                        <Sparkline values={c.spark} className="h-6 w-20" label={`รายการบันทึกต่อวัน 30 วันของ ${c.companyName}`} />
                        <span className="text-xs text-muted-foreground tabular">{fmtNum(c.records30, 0)}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">ไม่มีรายการ</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">{c.lastActivity ? ago(c.lastActivity) : "ยังไม่เคยบันทึก"}</TableCell>
                  <TableCell><Status map={RECORD_STATUS} value={c.status} /></TableCell>
                  <TableCell><CompanyActions id={c.companyId} name={c.companyName} status={c.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} totalPages={d.totalPages} total={d.total} params={sp} pathname="/platform/companies" />
    </>
  );
}

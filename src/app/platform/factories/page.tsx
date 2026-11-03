import Link from "next/link";
import { Factory } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { EmptyState } from "@/components/data/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNum } from "@/lib/format";
import { fmtDate } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { listFactories } from "@/server/queries/platform/factories";
import { Nameplate } from "@/components/data/nameplate";
import { CreateFactoryButton, EditFactoryButton, FactoryStatusSelect } from "@/components/platform/factory-form";

export default async function Page({ searchParams }: PageProps<"/platform/factories">) {
  await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const d = await listFactories(sp, page);
  const active = d.companies.filter((c) => c.status === "ACTIVE").map((c) => ({ value: String(c.companyId), label: c.companyName }));

  return (
    <>
      <PageHeader title="โรงงาน" description="โรงงานของทุกบริษัท พร้อมจำนวนอาคาร ผู้ใช้ และรายการบันทึก" actions={<CreateFactoryButton companies={active} />} />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหารหัส ชื่อโรงงาน จังหวัด หรือบริษัท" },
          { type: "select", name: "company", label: "บริษัท", options: d.companies.map((c) => ({ value: String(c.companyId), label: c.companyName })) },
          {
            type: "select",
            name: "status",
            label: "สถานะ",
            options: [
              { value: "ACTIVE", label: "ใช้งานอยู่" },
              { value: "INACTIVE", label: "ปิดใช้งาน" },
              { value: "SUSPENDED", label: "ระงับใช้งาน" },
            ],
          },
        ]}
      />
      {d.rows.length === 0 ? (
        <EmptyState icon={Factory} title="ไม่พบโรงงาน" description={active.length ? "ลองล้างตัวกรอง หรือกด “เพิ่มโรงงาน”" : "ต้องมีบริษัทที่ใช้งานอยู่ก่อนจึงจะเพิ่มโรงงานได้"} />
      ) : (
        <div className="rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โรงงาน</TableHead>
                <TableHead>บริษัท</TableHead>
                <TableHead>จังหวัด</TableHead>
                <TableHead className="text-right">อาคาร</TableHead>
                <TableHead className="text-right">ผู้ใช้</TableHead>
                <TableHead className="text-right">รายการบันทึกทั้งหมด</TableHead>
                <TableHead>สร้างเมื่อ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-10"><span className="sr-only">แก้ไข</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.rows.map((f) => (
                <TableRow key={f.factoryId}>
                  <TableCell>
                    <Link href={`/platform/companies/${f.company.companyId}/factories/${f.factoryId}`} className="block font-medium hover:underline">{f.factoryName}</Link>
                    <Nameplate className="mt-1">{f.factoryCode}</Nameplate>
                  </TableCell>
                  <TableCell>
                    <Link href={`/platform/companies/${f.company.companyId}`} className="hover:underline">{f.company.companyName}</Link>
                  </TableCell>
                  <TableCell>{f.province ?? "—"}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(f._count.buildings, 0)}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(f._count.users, 0)}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(f._count.resourceUsages, 0)}</TableCell>
                  <TableCell className="tabular">{fmtDate(f.createdAt)}</TableCell>
                  <TableCell><FactoryStatusSelect factoryId={f.factoryId} status={f.status} name={f.factoryName} /></TableCell>
                  <TableCell><EditFactoryButton factory={f} compact /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} totalPages={d.totalPages} total={d.total} params={sp} pathname="/platform/factories" />
    </>
  );
}

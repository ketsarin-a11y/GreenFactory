import { PageHeader } from "@/components/app/page-header";
import { SummaryStrip } from "@/components/company/summary-strip";
import { Pagination, pageParam } from "@/components/data/pagination";
import { UrlFilters } from "@/components/data/url-filters";
import { QR_STATUS_OPTIONS } from "@/components/company/labels";
import { requireTenantUser } from "@/server/auth/current-user";
import { departmentOptions, listQr, QR_PAGE } from "@/server/queries/company/qr";
import { hierarchyOptions } from "@/server/queries/company/options";
import { fmtNum } from "@/lib/format";
import { QrView } from "./_components/qr-view";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export default async function Page({ searchParams }: PageProps<"/company/qr-codes">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [data, departments, tree] = await Promise.all([
    listQr(user, { q: str(sp.q), status: str(sp.status), target: str(sp.target), department: Number(str(sp.department)) || undefined, page }),
    departmentOptions(user),
    hierarchyOptions(user, "target"),
  ]);
  return (
    <>
      <PageHeader title="QR Code" description="ป้ายที่ผู้ปฏิบัติงานสแกนเพื่อบันทึกค่ามิเตอร์ของเครื่องจักรและจุดตรวจวัด" />
      <SummaryStrip
        items={[
          { label: "QR ทั้งหมด", value: fmtNum(data.stats.total) },
          { label: "ใช้งานอยู่", value: fmtNum(data.stats.ACTIVE) },
          { label: "ระงับชั่วคราว", value: fmtNum(data.stats.SUSPENDED) },
          { label: "ยกเลิกแล้ว", value: fmtNum(data.stats.REVOKED) },
        ]}
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหารหัส QR หรือเครื่องจักร/จุดตรวจวัด" },
          { type: "select", name: "status", label: "สถานะ", options: QR_STATUS_OPTIONS },
          { type: "select", name: "target", label: "ประเภทเป้าหมาย", options: [{ value: "MACHINE", label: "เครื่องจักร" }, { value: "CHECKPOINT", label: "จุดตรวจวัด" }] },
          { type: "select", name: "department", label: "แผนก", options: departments },
        ]}
      />
      <QrView rows={data.rows} tree={tree} />
      <Pagination page={page} totalPages={Math.ceil(data.total / QR_PAGE)} total={data.total} params={sp} pathname="/company/qr-codes" />
    </>
  );
}

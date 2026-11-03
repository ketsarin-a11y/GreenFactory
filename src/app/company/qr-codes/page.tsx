import { Ban, CheckCircle2, PauseCircle, QrCode } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
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
      <PageHeader title="QR Code" description="สร้าง พิมพ์ และควบคุม QR Code ของเครื่องจักรและจุดตรวจวัด ผู้ปฏิบัติงานสแกนเพื่อบันทึกข้อมูล" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="QR ทั้งหมด" value={fmtNum(data.stats.total)} icon={QrCode} />
        <StatTile label="ใช้งานอยู่" value={fmtNum(data.stats.ACTIVE)} icon={CheckCircle2} />
        <StatTile label="ระงับชั่วคราว" value={fmtNum(data.stats.SUSPENDED)} icon={PauseCircle} />
        <StatTile label="ยกเลิกแล้ว" value={fmtNum(data.stats.REVOKED)} icon={Ban} />
      </div>
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

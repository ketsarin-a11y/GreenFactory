import Link from "next/link";
import { CheckCircle2, Cpu, QrCode, Radio, Wrench } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { EmptyState } from "@/components/data/empty-state";
import { Pagination, pageParam } from "@/components/data/pagination";
import { UrlFilters } from "@/components/data/url-filters";
import { OPERATIONAL, OPERATIONAL_LABEL } from "@/components/company/labels";
import { requireTenantUser } from "@/server/auth/current-user";
import { listMachines, MACHINE_PAGE } from "@/server/queries/company/machines";
import { factoryFilterOptions, hierarchyOptions, machineTypeOptions } from "@/server/queries/company/options";
import { fmtNum } from "@/lib/format";
import { MachinesView } from "./_components/machines-view";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export default async function Page({ searchParams }: PageProps<"/company/machines">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [data, tree, types, factories] = await Promise.all([
    listMachines(user, { q: str(sp.q), factory: Number(str(sp.factory)) || undefined, status: str(sp.status), setup: str(sp.setup), page }),
    hierarchyOptions(user, "line"),
    machineTypeOptions(),
    factoryFilterOptions(user),
  ]);
  const hasLine = tree.some((f) => !f.inactive && f.children?.some((b) => !b.inactive && b.children?.some((d) => !d.inactive && d.children?.some((l) => !l.inactive))));
  const s = data.stats;
  return (
    <>
      <PageHeader title="เครื่องจักร" description="ทะเบียนเครื่องจักร ตำแหน่งติดตั้ง และความพร้อมของข้อมูล" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile label="เครื่องทั้งหมด" value={fmtNum(s.total)} icon={Cpu} />
        <StatTile label="เปิดใช้งาน" value={fmtNum(s.active)} icon={CheckCircle2} />
        <StatTile label="บำรุงรักษา" value={fmtNum(s.maintenance)} icon={Wrench} />
        <StatTile label="มีเซนเซอร์" value={fmtNum(s.withSensor)} unit={`/ ${fmtNum(s.active)}`} icon={Radio} />
        <StatTile label="มี QR Code" value={fmtNum(s.withQr)} unit={`/ ${fmtNum(s.active)}`} icon={QrCode} />
      </div>
      {!hasLine && s.total === 0 ? (
        <EmptyState icon={Cpu} title="ยังเพิ่มเครื่องจักรไม่ได้" description="ต้องมี โรงงาน → อาคาร → แผนก → สายการผลิต ก่อน"
          action={<Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/company/structure">ไปที่โครงสร้างโรงงาน</Link>} />
      ) : (
        <>
          <UrlFilters
            fields={[
              { type: "search", name: "q", placeholder: "ค้นหารหัส ชื่อ ประเภท ผู้ผลิต รุ่น หมายเลข ตำแหน่ง" },
              { type: "select", name: "factory", label: "โรงงาน", options: factories },
              { type: "select", name: "status", label: "สถานะ", options: [
                { value: "ACTIVE", label: "เปิดใช้งาน" }, { value: "INACTIVE", label: "ปิดใช้งาน" },
                ...OPERATIONAL.map((o) => ({ value: o, label: `สภาพ: ${OPERATIONAL_LABEL[o]}` })),
              ] },
              { type: "select", name: "setup", label: "การตั้งค่า", options: [{ value: "no-sensor", label: "ยังไม่มีเซนเซอร์" }, { value: "no-qr", label: "ยังไม่มี QR Code" }] },
            ]}
          />
          <MachinesView rows={data.rows} tree={tree} types={types} />
          <Pagination page={page} totalPages={Math.ceil(data.total / MACHINE_PAGE)} total={data.total} params={sp} pathname="/company/machines" />
        </>
      )}
    </>
  );
}

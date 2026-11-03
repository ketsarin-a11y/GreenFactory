import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { UrlFilters } from "@/components/data/url-filters";
import { fmtNum } from "@/lib/format";
import { listMaster } from "@/server/queries/platform/master-data";
import type { SP } from "@/server/queries/platform/common";
import { MASTER, type MasterKind } from "./config";
import { MasterCreateButton, MasterTable } from "./master-table";

/** Server half of every master-data page: header, filters, (factor stats), table. */
export async function MasterPage({ kind, searchParams }: { kind: MasterKind; searchParams: SP }) {
  const cfg = MASTER[kind];
  const d = await listMaster(kind, searchParams);
  return (
    <>
      <PageHeader title={cfg.title} description={cfg.description} actions={<MasterCreateButton kind={kind} options={d.options} />} />
      {d.stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="ทั้งหมด" value={fmtNum(d.stats.total, 0)} goodWhen="neutral" />
          <StatTile label="ใช้งานอยู่" value={fmtNum(d.stats.active, 0)} goodWhen="neutral" />
          <StatTile label="ถูกใช้ในการคำนวณ" value={fmtNum(d.stats.referenced, 0)} goodWhen="neutral" />
          <StatTile label="หมดอายุแล้ว" value={fmtNum(d.stats.expired, 0)} goodWhen="neutral" />
        </div>
      )}
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: kind === "emission-factors" ? "ค้นหาทรัพยากร ภูมิภาค หรือแหล่งที่มา" : "ค้นหารหัสหรือชื่อ" },
          { type: "select", name: "status", label: "สถานะ", options: [{ value: "ACTIVE", label: "ใช้งานอยู่" }, { value: "INACTIVE", label: "ปิดใช้งาน" }] },
        ]}
      />
      <MasterTable kind={kind} rows={d.rows} options={d.options} />
      <p className="mt-3 text-sm text-muted-foreground tabular">ทั้งหมด {d.rows.length.toLocaleString("th-TH")} รายการ · คลิกสถานะเพื่อเปิด/ปิดใช้งาน</p>
    </>
  );
}

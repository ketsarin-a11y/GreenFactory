import { PageHeader } from "@/components/app/page-header";
import { SummaryStrip } from "@/components/platform/summary-strip";
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
        <SummaryStrip
          items={[
            { label: "ทั้งหมด", value: fmtNum(d.stats.total, 0), unit: "รายการ" },
            { label: "ใช้งานอยู่", value: fmtNum(d.stats.active, 0), unit: "รายการ" },
            { label: "ถูกใช้ในการคำนวณ", value: fmtNum(d.stats.referenced, 0), unit: "รายการ" },
            { label: "หมดอายุแล้ว", value: fmtNum(d.stats.expired, 0), unit: "รายการ" },
          ]}
        />
      )}
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: kind === "emission-factors" ? "ค้นหาทรัพยากร ภูมิภาค หรือแหล่งที่มา" : "ค้นหารหัสหรือชื่อ" },
          { type: "select", name: "status", label: "สถานะ", options: [{ value: "ACTIVE", label: "ใช้งานอยู่" }, { value: "INACTIVE", label: "ปิดใช้งาน" }] },
        ]}
      />
      <MasterTable kind={kind} rows={d.rows} options={d.options} />
      <div className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <p className="tabular">ทั้งหมด {d.rows.length.toLocaleString("th-TH")} รายการ</p>
        <p>คลิกที่สถานะเพื่อเปิดหรือปิดใช้งาน</p>
      </div>
    </>
  );
}

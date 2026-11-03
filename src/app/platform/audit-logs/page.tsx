import { Download, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { EmptyState } from "@/components/data/empty-state";
import { Button } from "@/components/ui/button";
import { AUDIT_ACTION_LABEL, moduleLabel } from "@/components/platform/labels";
import { requireUser } from "@/server/auth/current-user";
import { ROLES, ROLE_LABEL } from "@/server/auth/roles";
import { listAuditLogs } from "@/server/queries/platform/logs";
import { AuditTable } from "./_components/audit-table";

export default async function Page({ searchParams }: PageProps<"/platform/audit-logs">) {
  await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const d = await listAuditLogs(sp, page);
  const qs = new URLSearchParams(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string" && e[0] !== "page")).toString();

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="ทุกการสร้าง แก้ไข ลบ และเปลี่ยนสถานะ จากทุกบทบาท คลิกแถวเพื่อดูข้อมูลก่อนและหลัง"
        actions={
          <Button variant="outline" className="h-10" asChild>
            <a href={`/api/platform/audit-logs/export${qs ? `?${qs}` : ""}`} download>
              <Download /> ส่งออก CSV
            </a>
          </Button>
        }
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาผู้ใช้ อีเมล ตาราง IP หรือเลขอ้างอิง" },
          { type: "select", name: "action", label: "การกระทำ", options: d.actions.map((a) => ({ value: a, label: AUDIT_ACTION_LABEL[a] ?? a })) },
          { type: "select", name: "module", label: "โมดูล", options: d.modules.map((m) => ({ value: m, label: moduleLabel(m) })) },
          { type: "select", name: "role", label: "บทบาท", options: ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })) },
          { type: "date", name: "from", label: "ตั้งแต่" },
          { type: "date", name: "to", label: "ถึง" },
        ]}
      />
      {d.rows.length === 0 ? (
        <EmptyState icon={ListChecks} title="ไม่พบรายการ" description="ลองเปลี่ยนช่วงวันที่หรือล้างตัวกรอง" />
      ) : (
        <AuditTable rows={d.rows} />
      )}
      <Pagination page={page} totalPages={d.totalPages} total={d.total} params={sp} pathname="/platform/audit-logs" />
    </>
  );
}

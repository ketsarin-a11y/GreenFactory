import { Download, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { EmptyState } from "@/components/data/empty-state";
import { Button } from "@/components/ui/button";
import { AUDIT_ACTION_LABEL, moduleLabel } from "@/components/platform/labels";
import { requireUser } from "@/server/auth/current-user";
import { ROLES, ROLE_LABEL } from "@/server/auth/roles";
import { auditSummary, listAuditLogs } from "@/server/queries/platform/logs";
import { shortDay } from "@/server/queries/platform/series";
import { BarList } from "@/components/data/bar-list";
import { DayBars } from "@/components/platform/day-bars";
import { fmtNum } from "@/lib/format";
import { AuditTable } from "./_components/audit-table";

export default async function Page({ searchParams }: PageProps<"/platform/audit-logs">) {
  await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [d, sum] = await Promise.all([listAuditLogs(sp, page), auditSummary(sp)]);
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
      {d.total > 0 && (
        <section aria-label="สรุปตามตัวกรอง" className="mb-6 grid gap-6 rounded-[10px] border bg-card p-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:divide-x">
          <div className="lg:pr-6">
            <h2 className="font-semibold">รายการต่อวัน</h2>
            <p className="mt-0.5 mb-3 text-sm text-muted-foreground">{shortDay(sum.days[0])} – {shortDay(sum.days[sum.days.length - 1])}</p>
            <DayBars labels={sum.days.map(shortDay)} values={sum.perDay} unit="รายการ" color="var(--chart-1)" label="จำนวนรายการ Audit ต่อวัน" />
            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4 text-sm">
              {sum.byAction.map((a) => (
                <div key={a.action}>
                  <dt className="text-muted-foreground">{AUDIT_ACTION_LABEL[a.action] ?? a.action}</dt>
                  <dd className="font-display text-xl font-semibold tabular">{fmtNum(a.n, 0)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:pl-6">
            <h2 className="mb-3 font-semibold">แยกตามโมดูล</h2>
            <BarList unit="รายการ" items={sum.byModule.map((m) => ({ label: moduleLabel(m.module), value: m.n, color: "var(--chart-1)" }))} />
          </div>
        </section>
      )}
      {d.rows.length === 0 ? (
        <EmptyState icon={ListChecks} title="ไม่พบรายการ" description="ลองเปลี่ยนช่วงวันที่หรือล้างตัวกรอง รายการใหม่จะขึ้นเมื่อมีผู้สร้าง แก้ไข หรือลบข้อมูล" />
      ) : (
        <AuditTable rows={d.rows} />
      )}
      <Pagination page={page} totalPages={d.totalPages} total={d.total} params={sp} pathname="/platform/audit-logs" />
    </>
  );
}

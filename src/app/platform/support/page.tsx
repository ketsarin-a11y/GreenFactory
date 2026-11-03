import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SummaryStrip } from "@/components/platform/summary-strip";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { EmptyState } from "@/components/data/empty-state";
import { TICKET_STATUS } from "@/components/platform/labels";
import { fmtNum } from "@/lib/format";
import { requireUser } from "@/server/auth/current-user";
import { listTickets } from "@/server/queries/platform/support";
import { TicketTable } from "./_components/ticket-parts";

export default async function Page({ searchParams }: PageProps<"/platform/support">) {
  await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const d = await listTickets(sp, page);
  return (
    <>
      <PageHeader title="คำร้องขอความช่วยเหลือ" description="คำร้องจากผู้ใช้ทุกบริษัท ส่งมาจากหน้าช่วยเหลือของแต่ละบทบาท" />
      <SummaryStrip
        items={Object.entries(TICKET_STATUS).map(([k, [, label]]) => ({
          label,
          value: fmtNum(d.counts[k] ?? 0, 0),
          unit: "เรื่อง",
          href: sp.status === k ? "/platform/support" : `/platform/support?status=${k}`,
          active: sp.status === k,
        }))}
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาเลขที่ หัวข้อ หมวด หรือความสำคัญ" },
          { type: "select", name: "status", label: "สถานะ", options: Object.entries(TICKET_STATUS).map(([value, [, label]]) => ({ value, label })) },
          { type: "select", name: "company", label: "บริษัท", options: d.companies },
        ]}
      />
      {d.rows.length === 0 ? <EmptyState icon={LifeBuoy} title="ไม่มีคำร้อง" description="เมื่อผู้ใช้ส่งคำร้องจากหน้าช่วยเหลือ รายการจะแสดงที่นี่" /> : <TicketTable rows={d.rows} />}
      <Pagination page={page} totalPages={d.totalPages} total={d.total} params={sp} pathname="/platform/support" />
    </>
  );
}

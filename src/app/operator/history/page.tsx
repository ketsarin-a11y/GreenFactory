import Link from "next/link";
import { Download, History } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Pagination, pageParam } from "@/components/data/pagination";
import { UrlFilters } from "@/components/data/url-filters";
import { Button } from "@/components/ui/button";
import { requireTenantUser } from "@/server/auth/current-user";
import { historyPage, parseHistoryFilters, resourceFilterOptions } from "@/server/queries/operator";
import { HistoryList } from "./_components/history-list";

export default async function Page({ searchParams }: PageProps<"/operator/history">) {
  const user = await requireTenantUser("OPERATOR");
  const sp = await searchParams;
  const filters = parseHistoryFilters(sp);
  const page = pageParam(sp.page);
  const [data, resources] = await Promise.all([historyPage(user, filters, page), resourceFilterOptions()]);
  const qs = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => !!e[1])).toString();

  return (
    <>
      <PageHeader
        title="ประวัติการบันทึก"
        description="รายการบันทึกการใช้ทรัพยากรในโรงงานของคุณ ลบได้เฉพาะรายการของคุณภายใน 24 ชั่วโมง"
        actions={
          <Button asChild variant="outline" size="lg" className="h-11">
            <a href={`/api/operator/history/export${qs ? `?${qs}` : ""}`} download><Download /> ส่งออก CSV</a>
          </Button>
        }
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาเลขอ้างอิง USG-… เครื่องจักร หรือจุดตรวจ" },
          { type: "select", name: "resource", label: "ทรัพยากร", options: resources },
          { type: "select", name: "source", label: "ที่มา", options: [{ value: "QR", label: "สแกน QR" }, { value: "MANUAL", label: "เลือกเอง" }] },
          { type: "select", name: "mine", label: "ผู้บันทึก", options: [{ value: "1", label: "เฉพาะของฉัน" }] },
          { type: "date", name: "from", label: "ตั้งแต่วันที่" },
          { type: "date", name: "to", label: "ถึงวันที่" },
        ]}
      />
      {data.total === 0 ? (
        <EmptyState
          icon={History}
          title={qs ? "ไม่พบรายการที่ตรงกับตัวกรอง" : "ยังไม่มีรายการบันทึก"}
          description={qs ? "ลองล้างตัวกรองหรือเปลี่ยนช่วงวันที่" : "เริ่มบันทึกการใช้ทรัพยากรได้จากการสแกน QR Code"}
          action={!qs && <Button asChild size="lg" className="h-11"><Link href="/operator/scan">สแกน QR Code</Link></Button>}
        />
      ) : (
        <>
          <HistoryList rows={data.rows} />
          <Pagination page={page} totalPages={data.totalPages} total={data.total} params={sp} pathname="/operator/history" />
        </>
      )}
    </>
  );
}

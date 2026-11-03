import { Download, LogIn } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { EmptyState } from "@/components/data/empty-state";
import { Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEVICE_LABEL_TH, LOGIN_STATUS } from "@/components/platform/labels";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { LOGIN_FAILURE_LABEL } from "@/server/domain/user-agent";
import { listLoginLogs } from "@/server/queries/platform/logs";

export default async function Page({ searchParams }: PageProps<"/platform/login-logs">) {
  await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const d = await listLoginLogs(sp, page);
  const qs = new URLSearchParams(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string" && e[0] !== "page")).toString();

  return (
    <>
      <PageHeader
        title="Login Log"
        description="ทุกความพยายามเข้าสู่ระบบ ทั้งสำเร็จและไม่สำเร็จ ตัวเลขสรุปเป็นไปตามตัวกรองที่เลือก"
        actions={
          <Button variant="outline" className="h-10" asChild>
            <a href={`/api/platform/login-logs/export${qs ? `?${qs}` : ""}`} download>
              <Download /> ส่งออก CSV
            </a>
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="ทั้งหมด" value={fmtNum(d.total, 0)} unit="ครั้ง" goodWhen="neutral" />
        <StatTile label="สำเร็จ" value={fmtNum(d.success, 0)} unit="ครั้ง" goodWhen="neutral" />
        <StatTile label="ไม่สำเร็จ" value={fmtNum(d.failed, 0)} unit="ครั้ง" goodWhen="neutral" />
        <StatTile label="อัตราสำเร็จ" value={d.total ? fmtNum((d.success / d.total) * 100, 1) : "—"} unit={d.total ? "%" : undefined} goodWhen="neutral" />
      </div>
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาอีเมล ชื่อ บริษัท หรือ IP" },
          { type: "select", name: "status", label: "สถานะ", options: [{ value: "SUCCESS", label: "สำเร็จ" }, { value: "FAILED", label: "ไม่สำเร็จ" }] },
          { type: "select", name: "device", label: "อุปกรณ์", options: [{ value: "Desktop", label: "คอมพิวเตอร์" }, { value: "Mobile", label: "มือถือ" }, { value: "Tablet", label: "แท็บเล็ต" }] },
          { type: "date", name: "from", label: "ตั้งแต่" },
          { type: "date", name: "to", label: "ถึง" },
        ]}
      />
      {d.rows.length === 0 ? (
        <EmptyState icon={LogIn} title="ไม่พบรายการ" description="ลองเปลี่ยนช่วงวันที่หรือล้างตัวกรอง" />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เวลา</TableHead>
                <TableHead>ผู้ใช้</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>บริษัท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>อุปกรณ์</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.rows.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="tabular whitespace-nowrap">{fmtDateTime(l.loginAt)}</TableCell>
                  <TableCell className="max-w-56">
                    <span className="block truncate">{l.userName ?? "ไม่พบบัญชี"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{l.email ?? "—"}</span>
                  </TableCell>
                  <TableCell>{l.role ? (isRole(l.role) ? ROLE_LABEL[l.role] : l.role) : "—"}</TableCell>
                  <TableCell>{l.company ?? "—"}</TableCell>
                  <TableCell>
                    <Status map={LOGIN_STATUS} value={l.status} />
                    {l.status === "FAILED" && l.failureReason && <span className="mt-1 block text-xs text-muted-foreground">{LOGIN_FAILURE_LABEL[l.failureReason] ?? l.failureReason}</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{l.ipAddress ?? "—"}</TableCell>
                  <TableCell>
                    <span className="block">{DEVICE_LABEL_TH[l.device]}</span>
                    <span className="block text-xs text-muted-foreground">{l.browser} · {l.os}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={page} totalPages={d.totalPages} total={d.total} params={sp} pathname="/platform/login-logs" />
    </>
  );
}

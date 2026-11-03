import { Download, LogIn } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
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
import { listLoginLogs, loginSummary } from "@/server/queries/platform/logs";
import { shortDay } from "@/server/queries/platform/series";
import { ProportionBar } from "@/components/data/proportion-bar";
import { DayBars } from "@/components/platform/day-bars";

export default async function Page({ searchParams }: PageProps<"/platform/login-logs">) {
  await requireUser("PLATFORM_ADMIN");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [d, sum] = await Promise.all([listLoginLogs(sp, page), loginSummary(sp)]);
  const qs = new URLSearchParams(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string" && e[0] !== "page")).toString();

  return (
    <>
      <PageHeader
        title="Login Log"
        description="ทุกความพยายามเข้าสู่ระบบ ทั้งสำเร็จและไม่สำเร็จ สรุปด้านบนเป็นไปตามตัวกรองที่เลือก"
        actions={
          <Button variant="outline" className="h-10" asChild>
            <a href={`/api/platform/login-logs/export${qs ? `?${qs}` : ""}`} download>
              <Download /> ส่งออก CSV
            </a>
          </Button>
        }
      />
      <UrlFilters
        fields={[
          { type: "search", name: "q", placeholder: "ค้นหาอีเมล ชื่อ บริษัท หรือ IP" },
          { type: "select", name: "status", label: "สถานะ", options: [{ value: "SUCCESS", label: "สำเร็จ" }, { value: "FAILED", label: "ไม่สำเร็จ" }] },
          { type: "select", name: "device", label: "อุปกรณ์", options: [{ value: "Desktop", label: "คอมพิวเตอร์" }, { value: "Mobile", label: "มือถือ" }, { value: "Tablet", label: "แท็บเล็ต" }] },
          { type: "date", name: "from", label: "ตั้งแต่" },
          { type: "date", name: "to", label: "ถึง" },
        ]}
      />
      <section aria-label="สรุปตามตัวกรอง" className="mb-6 grid gap-6 rounded-[10px] border bg-card p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:divide-x">
        <div className="lg:pr-6">
          <h2 className="font-semibold">เข้าสู่ระบบไม่สำเร็จต่อวัน</h2>
          <p className="mt-0.5 mb-3 text-sm text-muted-foreground">{shortDay(sum.days[0])} – {shortDay(sum.days[sum.days.length - 1])}</p>
          <DayBars labels={sum.days.map(shortDay)} values={sum.failedPerDay} unit="ครั้ง" color="var(--status-critical)" label="การเข้าสู่ระบบไม่สำเร็จต่อวัน" />
        </div>
        <div className="lg:pl-6">
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-semibold tracking-tight tabular">{d.total ? fmtNum((d.success / d.total) * 100, 1) : "—"}</span>
            {d.total > 0 && <span className="text-sm text-muted-foreground">% สำเร็จ</span>}
          </p>
          <p className="mt-1 mb-3 text-sm text-muted-foreground tabular">
            ทั้งหมด {fmtNum(d.total, 0)} ครั้ง ไม่สำเร็จ {fmtNum(d.failed, 0)} ครั้ง
          </p>
          <ProportionBar
            unit="ครั้ง"
            parts={[
              { label: "สำเร็จ", value: d.success, color: "var(--primary)" },
              { label: "ไม่สำเร็จ", value: d.failed, color: "var(--status-critical)" },
            ]}
          />
          {sum.reasons.length > 0 && (
            <dl className="mt-4 divide-y border-t text-sm">
              {sum.reasons.map((r) => (
                <div key={r.reason ?? "none"} className="flex justify-between gap-3 py-1.5">
                  <dt className="min-w-0 truncate text-muted-foreground">{r.reason ? (LOGIN_FAILURE_LABEL[r.reason] ?? r.reason) : "ไม่ระบุสาเหตุ"}</dt>
                  <dd className="tabular">{fmtNum(r.n, 0)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
      {d.rows.length === 0 ? (
        <EmptyState icon={LogIn} title="ไม่พบรายการ" description="ลองเปลี่ยนช่วงวันที่หรือล้างตัวกรอง" />
      ) : (
        <div className="rounded-[10px] border bg-card">
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
                  <TableCell className="text-xs tabular">{l.ipAddress ?? "ไม่ทราบ"}</TableCell>
                  <TableCell>
                    <span className="block">{DEVICE_LABEL_TH[l.device]}</span>
                    <span className="block text-xs text-muted-foreground">{l.browser} บน {l.os}</span>
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

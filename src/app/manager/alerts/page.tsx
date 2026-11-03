import Link from "next/link";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { EmptyState } from "@/components/data/empty-state";
import { ALERT_STATUS, SEVERITY, Status } from "@/components/data/status-badge";
import { UrlFilters } from "@/components/data/url-filters";
import { Pagination, pageParam } from "@/components/data/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNum, fmtPct } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { requireTenantUser } from "@/server/auth/current-user";
import { ALERT_PAGE_SIZE, getAlertDetail, getAlerts } from "@/server/queries/manager/alerts";
import { AckAllButton, AlertButtons, AlertSheet } from "./_components/alert-actions";

const TABS = [
  { value: "", label: "ทั้งหมด" },
  { value: "OPEN", label: "เปิดอยู่" },
  { value: "ACKNOWLEDGED", label: "รับทราบแล้ว" },
  { value: "RESOLVED", label: "ปิดแล้ว" },
];

export default async function Page({ searchParams }: PageProps<"/manager/alerts">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const page = pageParam(sp.page);
  const status = s("status") ?? "";
  const [d, detail] = await Promise.all([
    getAlerts(user, { status, severity: s("severity"), q: s("q")?.trim().slice(0, 100), page }),
    getAlertDetail(user, s("alert")),
  ]);
  const tabHref = (v: string) => {
    const p = new URLSearchParams();
    for (const k of ["q", "severity"]) if (s(k)) p.set(k, s(k)!);
    if (v) p.set("status", v);
    return `/manager/alerts${p.size ? `?${p}` : ""}`;
  };
  const rowHref = (id: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string") p.set(k, v);
    p.set("alert", id);
    return `/manager/alerts?${p}`;
  };

  return (
    <>
      <PageHeader title="การแจ้งเตือน" description="ค่าการใช้ที่ห่างจากค่าเฉลี่ยย้อนหลังของจุดเดียวกัน" actions={<AckAllButton count={d.summary.open} />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="เปิดอยู่" value={fmtNum(d.summary.open)} unit="รายการ" icon={AlertTriangle} />
        <StatTile label="รับทราบแล้ว รอแก้ไข" value={fmtNum(d.summary.acknowledged)} unit="รายการ" />
        <StatTile label="วิกฤตที่ยังไม่ปิด" value={fmtNum(d.summary.criticalOpen)} unit="รายการ" />
        <StatTile label="ปิดแล้ว" value={fmtNum(d.summary.resolved)} unit="รายการ" />
      </div>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <nav className="mb-4 flex flex-wrap gap-1 border-b" aria-label="สถานะการแจ้งเตือน">
          {TABS.map((t) => (
            <Link key={t.value} href={tabHref(t.value)} aria-current={status === t.value ? "page" : undefined}
              className={cn("-mb-px border-b-2 px-3 py-2 text-sm text-muted-foreground", status === t.value ? "border-primary font-medium text-foreground" : "border-transparent hover:text-foreground")}>
              {t.label}
            </Link>
          ))}
        </nav>
        <UrlFilters fields={[
          { type: "search", name: "q", placeholder: "ค้นหาหัวข้อ รหัส เครื่องจักร หรือแผนก" },
          { type: "select", name: "severity", label: "ความรุนแรง", options: Object.entries(SEVERITY).map(([value, [, label]]) => ({ value, label })) },
        ]} />
        {d.rows.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="ไม่มีการแจ้งเตือนตามตัวกรองนี้" description="เมื่อค่าที่บันทึกต่างจากค่าเฉลี่ยย้อนหลังมาก ระบบจะสร้างการแจ้งเตือนให้อัตโนมัติ" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>หัวข้อ</TableHead><TableHead>ความรุนแรง</TableHead><TableHead>สถานะ</TableHead><TableHead>ตำแหน่ง</TableHead><TableHead className="text-right">เวลา</TableHead></TableRow></TableHeader>
              <TableBody>
                {d.rows.map((a) => (
                  <TableRow key={a.alertId}>
                    <TableCell className="max-w-md">
                      <Link href={rowHref(a.alertId)} scroll={false} className="font-medium hover:text-primary hover:underline">{a.title}</Link>
                      <p className="font-mono text-xs text-muted-foreground">{a.alertCode}</p>
                    </TableCell>
                    <TableCell><Status map={SEVERITY} value={a.severity} /></TableCell>
                    <TableCell><Status map={ALERT_STATUS} value={a.status} /></TableCell>
                    <TableCell className="text-sm">{a.machine?.machineName ?? "—"}<p className="text-xs text-muted-foreground">{a.department?.departmentName}</p></TableCell>
                    <TableCell className="text-right text-sm tabular text-muted-foreground">{fmtDateTime(a.triggeredAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Pagination page={page} totalPages={Math.ceil(d.total / ALERT_PAGE_SIZE)} total={d.total} params={{ ...sp, alert: undefined }} pathname="/manager/alerts" />
      </section>

      <AlertSheet open={!!detail} title={detail?.title ?? ""} description={detail ? `${detail.code} · ${fmtDateTime(detail.triggeredAt)}` : undefined}>
        {detail && (
          <>
            <div className="flex flex-wrap gap-2"><Status map={SEVERITY} value={detail.severity} /><Status map={ALERT_STATUS} value={detail.status} /></div>
            <p className="text-sm">{detail.message}</p>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              {[["ค่าที่บันทึก", detail.actual === null ? "—" : `${fmtNum(detail.actual)} ${detail.unit}`], ["ค่าเฉลี่ยย้อนหลัง", detail.baseline === null ? "—" : `${fmtNum(detail.baseline)} ${detail.unit}`], ["ต่างจากค่าเฉลี่ย", fmtPct(detail.deviation)]].map(([k, v]) => (
                <div key={k} className="rounded-lg border p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 tabular font-medium">{v}</dd></div>
              ))}
            </dl>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">ตำแหน่ง</dt><dd className="text-right">{detail.location}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">เครื่องจักร</dt><dd>{detail.machine ? <Link className="text-primary hover:underline" href={`/manager/machines/${detail.machine.machineId}`}>{detail.machine.machineName}</Link> : "—"}</dd></div>
              {detail.reference && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">รายการที่บันทึก</dt><dd className="font-mono text-xs">{detail.reference}</dd></div>}
              {detail.acknowledgedAt && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">รับทราบเมื่อ</dt><dd className="tabular">{fmtDateTime(detail.acknowledgedAt)}</dd></div>}
              {detail.resolvedAt && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">ปิดเมื่อ</dt><dd className="tabular">{fmtDateTime(detail.resolvedAt)}{detail.resolvedBy && ` โดย ${detail.resolvedBy}`}</dd></div>}
            </dl>
            {detail.recommendations.map((r) => (
              <div key={r.title} className="rounded-lg border bg-muted/40 p-4 text-sm">
                <p className="flex items-center gap-1.5 font-medium"><Lightbulb className="size-4 text-muted-foreground" aria-hidden />{r.title}</p>
                <p className="mt-1.5 text-muted-foreground">{r.description}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">ข้อมูลปัจจุบันยังไม่เพียงพอที่จะยืนยันสาเหตุโดยตรง ตรวจสอบหน้างานก่อนปิดการแจ้งเตือน</p>
            <AlertButtons id={detail.id} status={detail.status} />
          </>
        )}
      </AlertSheet>
    </>
  );
}

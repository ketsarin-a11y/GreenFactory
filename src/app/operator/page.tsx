import Link from "next/link";
import { ClipboardList, ScanLine } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { PROCESSING, Status } from "@/components/data/status-badge";
import { requireTenantUser } from "@/server/auth/current-user";
import { myRecentUsages, todaySummary } from "@/server/queries/operator";
import { bkkLocalInput } from "@/server/domain/qr-scan";
import { fmtDate, fmtDateTime } from "@/lib/time";
import { fmtNum } from "@/lib/format";
import { resourceIcon } from "@/lib/resources";
import { AutoRefresh } from "./_components/auto-refresh";

function greeting(now: Date) {
  const h = Number(bkkLocalInput(now).slice(11, 13));
  return h >= 5 && h < 12 ? "สวัสดีตอนเช้า" : h >= 12 && h < 17 ? "สวัสดีตอนบ่าย" : h >= 17 && h < 20 ? "สวัสดีตอนเย็น" : "สวัสดีรอบดึก";
}

export default async function Page() {
  const user = await requireTenantUser("OPERATOR");
  const now = new Date();
  const [today, recent] = await Promise.all([todaySummary(user), myRecentUsages(user)]);

  return (
    <>
      <AutoRefresh />
      <PageHeader title={`${greeting(now)}, ${user.firstName}`} description={`วันนี้ ${fmtDate(now)} • บันทึกข้อมูลให้ถูกต้องและครบถ้วน เพื่อให้การคำนวณคาร์บอนแม่นยำ`} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Link href="/operator/scan" className="flex min-h-20 items-center gap-4 rounded-xl border bg-primary p-5 text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50">
          <ScanLine className="size-7 shrink-0" aria-hidden />
          <span>
            <span className="block text-base font-semibold">สแกน QR</span>
            <span className="block text-sm opacity-90">สแกนที่เครื่องจักรหรือจุดตรวจ แล้วบันทึกทันที</span>
          </span>
        </Link>
        <Link href="/operator/record" className="flex min-h-20 items-center gap-4 rounded-xl border bg-card p-5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <ClipboardList className="size-7 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="block text-base font-semibold">บันทึกข้อมูล</span>
            <span className="block text-sm text-muted-foreground">เลือกเครื่องจักรหรือจุดตรวจเอง</span>
          </span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5" aria-labelledby="today">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 id="today" className="font-semibold">การบันทึกวันนี้</h2>
            <p className="text-sm text-muted-foreground">โรงงานของคุณ</p>
          </div>
          <p className="mb-4 flex items-baseline gap-1.5">
            <span className="tabular text-3xl font-semibold tracking-tight">{fmtNum(today.count, 0)}</span>
            <span className="text-sm text-muted-foreground">รายการ</span>
          </p>
          {today.totals.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีการบันทึกวันนี้ เริ่มได้จากปุ่มสแกน QR ด้านบน</p>
          ) : (
            <ul className="divide-y">
              {today.totals.map((t) => {
                const Icon = resourceIcon(t.code);
                return (
                  <li key={t.key} className="flex items-center gap-3 py-2.5 text-sm">
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{t.name} <span className="text-muted-foreground">({fmtNum(t.count, 0)} รายการ)</span></span>
                    <span className="tabular font-medium">{fmtNum(t.total)} <span className="font-normal text-muted-foreground">{t.unit}</span></span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5" aria-labelledby="recent">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 id="recent" className="font-semibold">บันทึกล่าสุดของคุณ</h2>
            <Link href="/operator/history?mine=1" className="text-sm text-primary underline-offset-4 hover:underline">ดูทั้งหมด</Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="ยังไม่มีรายการบันทึก" description="เมื่อบันทึกการใช้ทรัพยากรแล้ว รายการจะแสดงที่นี่" />
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.target}</p>
                    <p className="text-muted-foreground">
                      {r.resource} • <span className="tabular">{fmtNum(r.quantity)} {r.unit}</span> • <span className="tabular">{fmtDateTime(r.usageAt)}</span>
                    </p>
                  </div>
                  <Status map={PROCESSING} value={r.processing} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

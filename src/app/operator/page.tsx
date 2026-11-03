import Link from "next/link";
import { Circle, CircleCheck, ClipboardList, ClipboardPen, ScanLine } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { Meter } from "@/components/data/meter";
import { Nameplate } from "@/components/data/nameplate";
import { PROCESSING, Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { requireTenantUser } from "@/server/auth/current-user";
import { myRecentUsages, ROUTINE_DAYS, targetParam, todayChecklist } from "@/server/queries/operator";
import { bkkLocalInput } from "@/server/domain/qr-scan";
import { fmtDateTime, TZ } from "@/lib/time";
import { fmtNum } from "@/lib/format";
import { AutoRefresh } from "./_components/auto-refresh";

const dayFmt = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

function greeting(now: Date) {
  const h = Number(bkkLocalInput(now).slice(11, 13));
  return h >= 5 && h < 12 ? "สวัสดีตอนเช้า" : h >= 12 && h < 17 ? "สวัสดีตอนบ่าย" : h >= 17 && h < 20 ? "สวัสดีตอนเย็น" : "สวัสดีรอบดึก";
}

export default async function Page() {
  const user = await requireTenantUser("OPERATOR");
  const now = new Date();
  const [list, recent] = await Promise.all([todayChecklist(user, now), myRecentUsages(user)]);
  const doneCount = list.done.length;
  const allDone = list.total > 0 && list.todo.length === 0;

  return (
    <>
      <AutoRefresh />
      <PageHeader title={`${greeting(now)} ${user.firstName}`} description={dayFmt.format(now)} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:items-start">
        {/* Quick actions: first on phones, in the aside on desktop. */}
        <div className="grid gap-2 lg:order-2">
          <Link
            href="/operator/scan"
            className="flex min-h-18 items-center gap-4 rounded-[14px] bg-primary px-5 py-4 text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ScanLine className="size-8 shrink-0" aria-hidden />
            <span className="min-w-0">
              <span className="block text-lg font-semibold">สแกน QR</span>
              <span className="block text-sm opacity-85">ที่เครื่องจักรหรือจุดตรวจ แล้วบันทึกทันที</span>
            </span>
          </Link>
          <Button asChild variant="outline" size="lg" className="h-11 justify-start">
            <Link href="/operator/record"><ClipboardList /> บันทึกโดยเลือกเครื่องเอง</Link>
          </Button>
        </div>

        <section aria-labelledby="today" className="overflow-hidden rounded-[14px] border bg-card lg:order-1 lg:row-span-2">
          <div className="bg-control-room px-5 pt-5 pb-6 text-white">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="today" className="text-base font-semibold">งานวันนี้</h2>
              <p className="text-sm text-white/70">{allDone ? "ครบแล้ว" : list.total > 0 ? `เหลือ ${fmtNum(list.todo.length, 0)} จุด` : ""}</p>
            </div>
            <p className="mt-3 font-display leading-none font-semibold tracking-tight tabular">
              <span className="text-[3.5rem]">{fmtNum(doneCount, 0)}</span>
              <span className="text-2xl text-white/60"> / {fmtNum(list.total, 0)}</span>
            </p>
            <p className="mt-1.5 text-sm text-white/70">เครื่องจักรและจุดตรวจที่บันทึกแล้ววันนี้</p>
            {list.total > 0 && (
              // goodWhen="below" keeps the bar in the brand color while work is still open.
              <Meter value={doneCount} target={list.total} goodWhen="below" className="mt-4 [&_[role=meter]]:bg-white/15 [&_[role=meter]>div:first-child]:bg-brand-lime [&_[role=meter]>div:last-child]:bg-white/70" />
            )}
          </div>

          {list.total === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ClipboardList}
                title="ยังไม่มีรายการประจำวัน"
                description={`เครื่องที่มีการบันทึกในช่วง ${ROUTINE_DAYS} วันที่ผ่านมาจะขึ้นที่นี่ เริ่มได้โดยสแกน QR ที่เครื่อง`}
              />
            </div>
          ) : (
            <>
              {list.todo.length > 0 && (
                <div>
                  <h3 className="flex items-baseline justify-between px-5 pt-5 pb-2 text-sm font-semibold">
                    ยังไม่บันทึกวันนี้
                    <span className="font-normal text-muted-foreground tabular">{fmtNum(list.todo.length, 0)} จุด</span>
                  </h3>
                  <ul className="divide-y border-y">
                    {list.todo.map((t) => (
                      <li key={`${t.kind}-${t.id}`}>
                        <Link
                          href={`/operator/record?target=${targetParam(t)}`}
                          className="flex min-h-16 items-center gap-3 px-5 py-3 outline-none hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                        >
                          <Circle className="size-5 shrink-0 text-input" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">{t.name}</span>
                            <span className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                              <Nameplate className="shrink-0 whitespace-nowrap">{t.code}</Nameplate>
                              <span className="truncate">{t.resource}</span>
                            </span>
                          </span>
                          <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground">
                            <ClipboardPen className="size-4" aria-hidden />
                            บันทึก
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {list.done.length > 0 && (
                <div>
                  <h3 className="flex items-baseline justify-between px-5 pt-5 pb-2 text-sm font-semibold">
                    บันทึกแล้ว
                    <span className="font-normal text-muted-foreground tabular">{fmtNum(list.done.length, 0)} จุด</span>
                  </h3>
                  <ul className="divide-y border-t">
                    {list.done.map((t) => (
                      <li key={`${t.kind}-${t.id}`} className="flex min-h-14 items-center gap-3 px-5 py-3">
                        <CircleCheck className="size-5 shrink-0 text-primary" aria-label="บันทึกแล้ว" />
                        <span className="min-w-0 flex-1">
                          <span className="block">{t.name}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                            <Nameplate className="shrink-0 whitespace-nowrap">{t.code}</Nameplate>
                            <span className="truncate">{t.done!.resource}</span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-medium tabular">
                            {fmtNum(t.done!.quantity)} <span className="font-normal text-muted-foreground">{t.done!.unit}</span>
                          </span>
                          <span className="block text-xs text-muted-foreground tabular">{timeFmt.format(t.done!.at)} น.</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>

        <section aria-labelledby="recent" className="rounded-[10px] border bg-card lg:order-3">
          <div className="flex items-baseline justify-between gap-2 px-5 pt-5 pb-2">
            <h2 id="recent" className="text-sm font-semibold">บันทึกล่าสุดของคุณ</h2>
            <Link href="/operator/history?mine=1" className="text-sm text-primary underline-offset-4 hover:underline">ดูทั้งหมด</Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-muted-foreground">ยังไม่มีรายการ เมื่อบันทึกแล้วจะแสดงที่นี่</p>
          ) : (
            <ul className="divide-y border-t">
              {recent.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.target}</p>
                    <p className="text-muted-foreground">{r.resource}</p>
                    {r.processing !== "COMPLETED" && <div className="mt-1"><Status map={PROCESSING} value={r.processing} /></div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium tabular">{fmtNum(r.quantity)} <span className="font-normal text-muted-foreground">{r.unit}</span></p>
                    <p className="text-xs text-muted-foreground tabular">{fmtDateTime(r.usageAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

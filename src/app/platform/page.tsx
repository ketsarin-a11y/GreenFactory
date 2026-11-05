import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { InstrumentBand } from "@/components/data/instrument-band";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { Heatmap } from "@/components/data/heatmap";
import { ProportionBar } from "@/components/data/proportion-bar";
import { Sparkline } from "@/components/data/sparkline";
import { Nameplate } from "@/components/data/nameplate";
import { RECORD_STATUS, Status, StatusBadge } from "@/components/data/status-badge";
import { DayBars } from "@/components/platform/day-bars";
import { AutoRefresh } from "@/components/platform/auto-refresh";
import { Panel, QuietEmpty } from "@/components/platform/panel";
import { AUDIT_ACTION_LABEL, ago, moduleLabel } from "@/components/platform/labels";
import { fmtNum } from "@/lib/format";
import { fmtDate } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { platformDashboard, systemHealth } from "@/server/queries/platform/dashboard";
import { shortDay } from "@/server/queries/platform/series";

const SERIES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];
const weekday = new Intl.DateTimeFormat("th-TH", { timeZone: "UTC", weekday: "short" });
const dayRow = (day: string) => `${weekday.format(new Date(`${day}T00:00:00Z`))} ${shortDay(day)}`;
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));

export default async function Page() {
  await requireUser("PLATFORM_ADMIN");
  const [d, h] = await Promise.all([platformDashboard(), systemHealth()]);

  const series = d.trend.series.map((s, i) => ({ key: `c${s.companyId}`, label: s.name, color: SERIES[i] }));
  const trendData = d.trend.days.map((day, i) => ({ label: shortDay(day), ...Object.fromEntries(d.trend.series.map((s) => [`c${s.companyId}`, s.days[i]])) }));
  const loginTotal = d.logins.success + d.logins.failed;

  return (
    <>
      <AutoRefresh seconds={60} />
      <PageHeader title="ภาพรวมระบบ" description="ลูกค้า การใช้งาน และสถานะของแพลตฟอร์ม อัปเดตทุกนาที" />

      <InstrumentBand
        live={d.sensors.lastHeard ? `รับค่าจากเซนเซอร์ล่าสุด ${ago(d.sensors.lastHeard)}` : undefined}
        readings={[
          {
            label: "บริษัทที่ใช้งาน",
            value: fmtNum(d.companies.active, 0),
            unit: `จาก ${fmtNum(d.companies.total, 0)} บริษัท`,
            note: d.companies.pending ? `รอตรวจสอบ ${fmtNum(d.companies.pending, 0)} บริษัท` : "ไม่มีบริษัทรอตรวจสอบ",
            href: d.companies.pending ? "/platform/companies?status=PENDING" : "/platform/companies",
          },
          {
            label: "ผู้ใช้ที่เข้าใช้ 7 วัน",
            value: fmtNum(d.users7.value, 0),
            unit: "คน",
            change: d.users7.change,
            goodWhen: "up",
            spark: d.users7.spark,
            note: "เทียบ 7 วันก่อนหน้า",
          },
          {
            label: "บันทึกข้อมูล 30 วัน",
            value: fmtNum(d.records.total, 0),
            unit: "รายการ",
            change: d.records.change,
            goodWhen: "up",
            spark: d.records.spark,
            note: "ถึงเมื่อวาน เทียบ 30 วันก่อนหน้า",
          },
          {
            label: "เซนเซอร์ออนไลน์",
            value: fmtNum(d.sensors.online, 0),
            unit: `/ ${fmtNum(d.sensors.total, 0)} ตัว`,
            spark: d.sensors.spark,
            note: "ค่าที่รับทุก 5 นาที ใน 2 ชม.ล่าสุด",
          },
        ]}
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="รายการบันทึกต่อวัน แยกตามบริษัท"
          description={
            d.trend.others > 0
              ? `30 วันที่ผ่านมา แสดง 3 บริษัทที่บันทึกมากที่สุด อีก ${fmtNum(d.trend.others, 0)} บริษัทดูได้ที่หน้าบริษัท`
              : "30 วันที่ผ่านมา (ถึงเมื่อวาน) นับเป็นจำนวนรายการ ไม่แสดงปริมาณการใช้ของลูกค้า"
          }
          table={{ columns: ["วันที่", ...series.map((s) => s.label)], rows: d.trend.days.map((day, i) => [shortDay(day), ...d.trend.series.map((s) => fmtNum(s.days[i], 0))]) }}
        >
          {series.length ? (
            <TrendChart data={trendData} series={series} unit="รายการ" height={260} />
          ) : (
            <QuietEmpty>ยังไม่มีบริษัทใดบันทึกข้อมูลใน 30 วันนี้</QuietEmpty>
          )}
        </ChartCard>

        <Panel
          title="การเข้าสู่ระบบ 30 วัน"
          action={<Link href="/platform/login-logs" className="text-primary hover:underline">ดู Login Log</Link>}
        >
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-semibold tracking-tight tabular">{loginTotal ? fmtNum((d.logins.success / loginTotal) * 100, 1) : "—"}</span>
            {loginTotal > 0 && <span className="text-sm text-muted-foreground">% สำเร็จ</span>}
          </p>
          <p className="mt-1 mb-4 text-sm text-muted-foreground tabular">
            จาก {fmtNum(loginTotal, 0)} ครั้ง ไม่สำเร็จ {fmtNum(d.logins.failed, 0)} ครั้ง
          </p>
          <ProportionBar
            unit="ครั้ง"
            parts={[
              { label: "สำเร็จ", value: d.logins.success, color: "var(--primary)" },
              { label: "ไม่สำเร็จ", value: d.logins.failed, color: "var(--status-critical)" },
            ]}
          />
          <div className="mt-5 border-t pt-4">
            <p className="text-sm text-muted-foreground">ไม่สำเร็จต่อวัน</p>
            <DayBars className="mt-3" labels={d.logins.days.map(shortDay)} values={d.logins.failedDays} unit="ครั้ง" color="var(--status-critical)" label="การเข้าสู่ระบบไม่สำเร็จต่อวัน" />
          </div>
        </Panel>
      </div>

      <Panel
        className="mb-6"
        title="ช่วงเวลาที่ผู้ใช้เข้าสู่ระบบ"
        description="การเข้าสู่ระบบที่สำเร็จ แยกตามชั่วโมง (เวลาไทย) 14 วันล่าสุด"
      >
        {/* relative + overflow-hidden: keeps the heatmap's sr-only header spans from widening the page on phones. */}
        <div className="relative overflow-hidden">
          <Heatmap rows={d.heatmap.days.map(dayRow)} cols={HOURS} values={d.heatmap.values} unit="ครั้ง" colLabelEvery={3} />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="บริษัทล่าสุด"
          action={<Link href="/platform/companies" className="text-primary hover:underline">ดูบริษัททั้งหมด</Link>}
        >
          {d.latestCompanies.length ? (
            <ul className="-my-2 divide-y">
              {d.latestCompanies.map((c) => (
                <li key={c.companyId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <Link href={`/platform/companies/${c.companyId}`} className="font-medium hover:underline">{c.companyName}</Link>
                      <Nameplate className="shrink-0">{c.companyCode}</Nameplate>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular">
                      โรงงาน {fmtNum(c._count.factories, 0)} แห่ง ผู้ใช้ {fmtNum(c._count.users, 0)} คน
                      <span className="ml-3">เพิ่มเมื่อ {fmtDate(c.createdAt)}</span>
                    </p>
                  </div>
                  <div className="hidden sm:block" title="รายการบันทึกต่อวัน 30 วัน">
                    {c.spark.some((v) => v > 0) ? (
                      <Sparkline values={c.spark} label={`รายการบันทึก 30 วันของ ${c.companyName}`} />
                    ) : (
                      <span className="text-xs text-muted-foreground">ยังไม่มีการบันทึก</span>
                    )}
                  </div>
                  <Status map={RECORD_STATUS} value={c.status} />
                </li>
              ))}
            </ul>
          ) : (
            <QuietEmpty>ยังไม่มีบริษัท เพิ่มบริษัทแรกได้ที่หน้าบริษัท</QuietEmpty>
          )}
        </Panel>

        <Panel
            title="กิจกรรมล่าสุด"
            description={d.auditToday ? `วันนี้ ${fmtNum(d.auditToday, 0)} รายการ` : undefined}
            action={<Link href="/platform/audit-logs" className="text-primary hover:underline">ดู Audit Log</Link>}
          >
            {d.recentAudit.length ? (
              <ul className="-my-1.5 divide-y text-sm">
                {d.recentAudit.map((a) => (
                  <li key={a.auditLogId} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{a.user ? `${a.user.firstName} ${a.user.lastName}` : "ระบบ"}</span>
                      <span className="block truncate text-muted-foreground">{AUDIT_ACTION_LABEL[a.action] ?? a.action}{moduleLabel(a.tableName)}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{ago(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <QuietEmpty>ยังไม่มีการแก้ไขข้อมูล รายการจะขึ้นที่นี่เมื่อมีผู้สร้างหรือแก้ไขข้อมูล</QuietEmpty>
            )}
          </Panel>
      </div>

      <section aria-label="สถานะระบบ" className="mt-6 flex flex-col gap-x-8 gap-y-2 rounded-[10px] border bg-card px-5 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center">
        <h2 className="font-semibold">สถานะระบบ</h2>
        <p className="flex items-center gap-2">
          <span className="text-muted-foreground">ฐานข้อมูล</span>
          {h.dbOk ? <StatusBadge tone="good">ตอบสนอง {fmtNum(h.dbMs, 0)} ms</StatusBadge> : <StatusBadge tone="critical">เชื่อมต่อไม่ได้</StatusBadge>}
        </p>
        <p className="flex items-center gap-2">
          <span className="text-muted-foreground">สำรองข้อมูลที่ตรวจแล้ว</span>
          {h.lastBackupAt ? <StatusBadge tone={h.backupStale ? "warning" : "good"}>{ago(h.lastBackupAt)}</StatusBadge> : <StatusBadge tone="warning">ยังไม่มี</StatusBadge>}
        </p>
        <p className="flex items-center gap-2">
          <span className="text-muted-foreground">โปรแกรมสำรองข้อมูล</span>
          {h.backupToolAvailable ? <StatusBadge tone="good">พร้อมใช้</StatusBadge> : <Link href="/platform/backups" className="text-primary hover:underline">ยังไม่ได้ตั้งค่า ดูวิธีตั้งค่า</Link>}
        </p>
      </section>
    </>
  );
}

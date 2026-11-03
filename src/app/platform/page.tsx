import Link from "next/link";
import { Activity, Building2, Cpu, Database, Factory, FileClock, HardDriveDownload, LogIn, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { BarList } from "@/components/data/bar-list";
import { EmptyState } from "@/components/data/empty-state";
import { RECORD_STATUS, Status, StatusBadge } from "@/components/data/status-badge";
import { AUDIT_ACTION_LABEL, LOGIN_STATUS, ago, moduleLabel } from "@/components/platform/labels";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { LOGIN_FAILURE_LABEL } from "@/server/domain/user-agent";
import { platformDashboard, systemHealth } from "@/server/queries/platform/dashboard";

export default async function Page() {
  await requireUser("PLATFORM_ADMIN");
  const [d, h] = await Promise.all([platformDashboard(), systemHealth()]);
  const card = "rounded-xl border bg-card p-5";

  return (
    <>
      <PageHeader title="ภาพรวมระบบ" description="ลูกค้า ผู้ใช้งาน และสถานะของแพลตฟอร์ม ณ ตอนนี้" />

      <section aria-label="สถานะระบบ" className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-card px-5 py-3 text-sm">
        <span className="flex items-center gap-2">
          <Database className="size-4 text-muted-foreground" aria-hidden />
          ฐานข้อมูล
          {h.dbOk ? <StatusBadge tone="good">ตอบสนอง {fmtNum(h.dbMs, 0)} ms</StatusBadge> : <StatusBadge tone="critical">เชื่อมต่อไม่ได้</StatusBadge>}
        </span>
        <span className="flex items-center gap-2">
          <HardDriveDownload className="size-4 text-muted-foreground" aria-hidden />
          สำรองข้อมูลล่าสุด
          {h.lastBackupAt ? (
            <StatusBadge tone={h.backupStale ? "warning" : "good"}>{ago(h.lastBackupAt)}</StatusBadge>
          ) : (
            <StatusBadge tone="warning">ยังไม่เคยสำรอง</StatusBadge>
          )}
        </span>
        {!h.backupToolAvailable && (
          <Link href="/platform/backups" className="text-muted-foreground underline-offset-4 hover:underline">
            เครื่องนี้ยังไม่มี mysqldump — ดูวิธีตั้งค่า
          </Link>
        )}
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          label="บริษัท"
          value={fmtNum(d.companies.total, 0)}
          icon={Building2}
          goodWhen="neutral"
          hint={`ใช้งาน ${fmtNum(d.companies.active, 0)} · รอตรวจสอบ ${fmtNum(d.companies.pending, 0)} · ระงับ ${fmtNum(d.companies.suspended, 0)}`}
        />
        <StatTile label="ผู้ใช้งานที่ใช้งานได้" value={fmtNum(d.users.active, 0)} unit={`/ ${fmtNum(d.users.total, 0)} คน`} icon={Users} goodWhen="neutral" />
        <StatTile label="โรงงาน" value={fmtNum(d.factories, 0)} unit="แห่ง" icon={Factory} goodWhen="neutral" />
        <StatTile label="เครื่องจักร" value={fmtNum(d.machines, 0)} unit="เครื่อง" icon={Cpu} goodWhen="neutral" />
        <StatTile label="รายการบันทึก 30 วัน" value={fmtNum(d.records, 0)} unit="รายการ" icon={Activity} goodWhen="neutral" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-4 font-semibold">ผู้ใช้งานตามบทบาท</h2>
          {d.usersByRole.length ? (
            <BarList items={d.usersByRole.map((r) => ({ label: isRole(r.role) ? ROLE_LABEL[r.role] : r.role, value: r.count }))} unit="คน" />
          ) : (
            <EmptyState icon={Users} title="ยังไม่มีผู้ใช้งาน" />
          )}
        </section>
        <section className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">บริษัทล่าสุด</h2>
            <Link href="/platform/companies" className="text-sm text-primary hover:underline">ดูทั้งหมด</Link>
          </div>
          {d.latestCompanies.length ? (
            <ul className="divide-y">
              {d.latestCompanies.map((c) => (
                <li key={c.companyId} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/platform/companies/${c.companyId}`} className="block truncate font-medium hover:underline">{c.companyName}</Link>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{c.companyCode}</span> · โรงงาน {fmtNum(c._count.factories, 0)} · ผู้ใช้ {fmtNum(c._count.users, 0)} · {fmtDateTime(c.createdAt)}
                    </p>
                  </div>
                  <Status map={RECORD_STATUS} value={c.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Building2} title="ยังไม่มีบริษัท" description="เพิ่มบริษัทแรกที่หน้าบริษัท" />
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">กิจกรรมล่าสุด</h2>
            <Link href="/platform/audit-logs" className="text-sm text-primary hover:underline">Audit Log</Link>
          </div>
          {d.recentAudit.length ? (
            <ul className="divide-y text-sm">
              {d.recentAudit.map((a) => (
                <li key={a.auditLogId} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{a.user ? `${a.user.firstName} ${a.user.lastName}` : "ระบบ"}</span>{" "}
                    {AUDIT_ACTION_LABEL[a.action] ?? a.action} {moduleLabel(a.tableName)} <span className="font-mono text-xs text-muted-foreground">#{a.recordId}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{ago(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileClock} title="ยังไม่มีกิจกรรม" />
          )}
        </section>
        <section className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">การเข้าสู่ระบบล่าสุด</h2>
            <Link href="/platform/login-logs" className="text-sm text-primary hover:underline">Login Log</Link>
          </div>
          {d.recentLogins.length ? (
            <ul className="divide-y text-sm">
              {d.recentLogins.map((l) => (
                <li key={l.loginLogId} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{l.user ? `${l.user.firstName} ${l.user.lastName}` : l.attemptedEmail}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {l.loginStatus === "FAILED" && l.failureReason ? `${LOGIN_FAILURE_LABEL[l.failureReason] ?? l.failureReason} · ` : ""}
                      {l.ipAddress ?? "ไม่ทราบ IP"} · {ago(l.loginAt)}
                    </span>
                  </span>
                  <Status map={LOGIN_STATUS} value={l.loginStatus} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={LogIn} title="ยังไม่มีการเข้าสู่ระบบ" />
          )}
        </section>
      </div>
    </>
  );
}

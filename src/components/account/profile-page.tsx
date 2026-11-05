import { PageHeader } from "@/components/app/page-header";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { ROLE_LABEL } from "@/server/auth/roles";
import { fmtDateTime } from "@/lib/time";
import { AvatarUploader, PasswordForm, ProfileForm } from "./profile-forms";

/** Shared "โปรไฟล์ของฉัน" page for every role. */
export async function ProfilePage({ user }: { user: CurrentUser }) {
  const u = await db.user.findUniqueOrThrow({
    where: { userId: user.id },
    include: { factory: true, departmentRef: true, company: true },
  });
  const recentLogins = await db.loginLog.findMany({
    where: { userId: user.id },
    orderBy: { loginAt: "desc" },
    take: 5,
  });
  const name = `${u.firstName} ${u.lastName}`;
  const facts: [string, string][] = [
    ["อีเมล", u.email],
    ["ชื่อผู้ใช้", u.username],
    ["รหัสพนักงาน", u.employeeCode ?? "—"],
    ["บทบาท", ROLE_LABEL[user.role]],
    ["บริษัท", u.company?.companyName ?? "แพลตฟอร์มส่วนกลาง"],
    ["โรงงาน", u.factory?.factoryName ?? (user.role === "COMPANY_ADMIN" ? "ทุกโรงงานในบริษัท" : "—")],
    ["แผนก", u.departmentRef?.departmentName ?? "—"],
    ["เข้าสู่ระบบล่าสุด", u.lastLogin ? fmtDateTime(u.lastLogin) : "—"],
  ];
  return (
    <>
      <PageHeader title="โปรไฟล์ของฉัน" description="ข้อมูลส่วนตัว รหัสผ่าน และประวัติการเข้าสู่ระบบ" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">ข้อมูลส่วนตัว</h2>
            <div className="mb-6"><AvatarUploader name={name} url={u.profileImagePath ? `/api/files/avatar/${u.userId}` : null} /></div>
            <ProfileForm defaults={{ firstName: u.firstName, lastName: u.lastName, phone: u.phone ?? "" }} />
          </section>
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-1 font-semibold">เปลี่ยนรหัสผ่าน</h2>
            <p className="mb-4 text-sm text-muted-foreground">เมื่อเปลี่ยนแล้ว อุปกรณ์อื่นที่เข้าสู่ระบบอยู่จะถูกออกจากระบบทันที</p>
            <PasswordForm />
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 font-semibold">บัญชี</h2>
            <dl className="space-y-2.5 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 truncate text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">ต้องการแก้อีเมลหรือบทบาท ติดต่อผู้ดูแลระบบของบริษัท</p>
          </section>
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 font-semibold">การเข้าสู่ระบบล่าสุด</h2>
            <ul className="space-y-2.5 text-sm">
              {recentLogins.length === 0 && <li className="text-muted-foreground">ยังไม่มีประวัติ</li>}
              {recentLogins.map((l) => (
                <li key={String(l.loginLogId)} className="flex justify-between gap-3">
                  <span className="tabular">{fmtDateTime(l.loginAt)}</span>
                  <span className={l.loginStatus === "SUCCESS" ? "text-muted-foreground" : "text-status-critical"}>
                    {l.loginStatus === "SUCCESS" ? (l.ipAddress ?? "สำเร็จ") : "ไม่สำเร็จ"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}

import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, Factory, Radio, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { EmptyState } from "@/components/data/empty-state";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Readiness } from "@/components/company/readiness";
import { requireTenantUser } from "@/server/auth/current-user";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { companyDashboard } from "@/server/queries/company/dashboard";
import { fmtNum } from "@/lib/format";
import { fmtDate } from "@/lib/time";

export default async function Page() {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const d = await companyDashboard(user);
  const todo = [
    { label: "เครื่องจักรที่ยังไม่มีเซนเซอร์", n: d.machines.noSensor, href: "/company/machines?setup=no-sensor" },
    { label: "เครื่องจักรที่ยังไม่มี QR Code", n: d.machines.noQr, href: "/company/machines?setup=no-qr" },
    { label: "ผู้ใช้ที่ยังไม่ระบุโรงงาน", n: d.users.noFactory, href: "/company/users?setup=no-factory" },
    { label: "ผู้ปฏิบัติงานที่ยังไม่ระบุแผนก", n: d.users.operatorNoDept, href: "/company/users?setup=no-department" },
  ];
  const open = todo.filter((t) => t.n > 0);

  return (
    <>
      <PageHeader title="แดชบอร์ดบริษัท" description={`ความพร้อมในการใช้งานของ ${user.companyName ?? "บริษัท"}`} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <section className="rounded-xl border bg-card p-5" aria-labelledby="readiness">
          <h2 id="readiness" className="text-sm text-muted-foreground">ความพร้อมของบริษัท</h2>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="tabular text-4xl font-semibold tracking-tight">{d.readiness.score}</span>
            <span className="text-muted-foreground">/ 100</span>
          </p>
          <ul className="mt-4 space-y-2.5">
            {d.readiness.parts.map((p) => (
              <li key={p.key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{p.label} <span className="text-muted-foreground">(น้ำหนัก {p.weight * 100}%)</span></span>
                </div>
                <Readiness score={p.score} />
              </li>
            ))}
          </ul>
        </section>

        <div className="grid min-w-0 content-start gap-4 sm:grid-cols-2">
          <StatTile label="ผู้ใช้งาน" value={fmtNum(d.users.active)} unit={`/ ${fmtNum(d.users.total)} บัญชี`} icon={Users} hint="ใช้งานอยู่ / ทั้งหมด" />
          <StatTile label="โรงงานในสังกัด" value={fmtNum(d.factories.filter((f) => f.status === "ACTIVE").length)} unit={`/ ${fmtNum(d.factories.length)} แห่ง`} icon={Factory} hint="เปิดใช้งาน / ทั้งหมด" />
          <StatTile label="เครื่องจักร" value={fmtNum(d.machines.active)} unit={`/ ${fmtNum(d.machines.total)} เครื่อง`} icon={Cpu} hint="เปิดใช้งาน / ทั้งหมด" />
          <StatTile label="เซนเซอร์ IoT เชื่อมต่อ" value={fmtNum(d.sensors.ONLINE)} unit={`/ ${fmtNum(d.sensors.total)} ตัว`} icon={Radio}
            hint={`ออฟไลน์ ${fmtNum(d.sensors.OFFLINE)} · ผิดปกติ ${fmtNum(d.sensors.FAULT)} · บำรุงรักษา ${fmtNum(d.sensors.MAINTENANCE)}`} />
          <section className="rounded-xl border bg-card p-5 sm:col-span-2">
            <h2 className="font-semibold">การกำกับดูแลบัญชี</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["ผู้จัดการโรงงาน", d.users.managers],
                ["ผู้ปฏิบัติงาน", d.users.operators],
                ["บัญชีที่ไม่ได้ใช้งาน", d.users.inactive],
                ["ยังไม่ระบุโรงงาน/แผนก", d.users.noFactory + d.users.operatorNoDept],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="tabular text-xl font-semibold">{fmtNum(v as number)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="min-w-0 rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">ความพร้อมรายโรงงาน</h2>
          {d.factories.length === 0 ? (
            <EmptyState icon={Factory} title="ยังไม่มีโรงงาน" description="เพิ่มโรงงานแรกเพื่อเริ่มตั้งค่าโครงสร้างและเครื่องจักร" action={<Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/company/factories">ไปที่หน้าโรงงาน</Link>} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>โรงงาน</TableHead>
                    <TableHead className="text-right">อาคาร/แผนก/สาย</TableHead>
                    <TableHead className="text-right">เครื่องจักร</TableHead>
                    <TableHead className="text-right">มีเซนเซอร์</TableHead>
                    <TableHead className="text-right">มี QR</TableHead>
                    <TableHead className="text-right">ผู้ใช้</TableHead>
                    <TableHead>ความพร้อม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.factories.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <span className="font-medium">{f.name}</span> <span className="font-mono text-xs text-muted-foreground">{f.code}</span>
                        {f.status !== "ACTIVE" && <span className="ml-2"><Status map={RECORD_STATUS} value={f.status} /></span>}
                      </TableCell>
                      <TableCell className="tabular text-right">{f.buildings}/{f.departments}/{f.lines}</TableCell>
                      <TableCell className="tabular text-right">{fmtNum(f.machines)}</TableCell>
                      <TableCell className="tabular text-right">{fmtNum(f.machinesWithSensor)}</TableCell>
                      <TableCell className="tabular text-right">{fmtNum(f.machinesWithQr)}</TableCell>
                      <TableCell className="tabular text-right">{fmtNum(f.users)}</TableCell>
                      <TableCell><Readiness score={f.readiness} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">ต้องตั้งค่าเพิ่ม</h2>
          {open.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-status-good" aria-hidden />ตั้งค่าครบแล้ว ไม่มีรายการค้าง</p>
          ) : (
            <ul className="divide-y">
              {open.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary">
                    <span>{t.label}</span>
                    <span className="flex items-center gap-1 tabular font-medium">{fmtNum(t.n)}<ArrowRight className="size-4" aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">ผู้ใช้ที่เพิ่มล่าสุด</h2>
          <Link href="/company/users" className="text-sm text-primary underline-offset-4 hover:underline">ดูทั้งหมด</Link>
        </div>
        <ul className="divide-y">
          {d.latestUsers.map((u) => (
            <li key={u.userId} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="font-medium">{u.firstName} {u.lastName}</span>
                <span className="ml-2 text-muted-foreground">{isRole(u.role.roleName) ? ROLE_LABEL[u.role.roleName] : u.role.roleName} · {u.factory?.factoryName ?? "ยังไม่ระบุโรงงาน"}</span>
              </span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                {fmtDate(u.createdAt)}
                <Status map={RECORD_STATUS} value={u.status} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

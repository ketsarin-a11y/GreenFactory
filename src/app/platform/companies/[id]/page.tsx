import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Factory, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/data/stat-tile";
import { EmptyState } from "@/components/data/empty-state";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checklist, InfoList } from "@/components/platform/checklist";
import { PLAN_LABEL } from "@/components/platform/labels";
import { fmtNum } from "@/lib/format";
import { fmtDate, fmtDateTime } from "@/lib/time";
import { requireUser } from "@/server/auth/current-user";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { companyDetail } from "@/server/queries/platform/companies";
import { EditCompanyButton } from "../_components/company-form";
import { CompanyActions } from "../_components/company-actions";

export default async function Page({ params }: PageProps<"/platform/companies/[id]">) {
  await requireUser("PLATFORM_ADMIN");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const d = await companyDetail(id);
  if (!d) notFound();
  const { company: c } = d;
  const card = "rounded-xl border bg-card p-5";

  return (
    <>
      <Link href="/platform/companies" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> บริษัททั้งหมด
      </Link>
      <PageHeader
        title={c.companyName}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{c.companyCode}</span>
            <Status map={RECORD_STATUS} value={c.status} />
            <span>แพ็กเกจ {c.subscriptionPlan ? (PLAN_LABEL[c.subscriptionPlan] ?? c.subscriptionPlan) : "—"}</span>
          </span>
        }
        actions={
          <>
            <EditCompanyButton company={c} />
            <CompanyActions id={c.companyId} name={c.companyName} status={c.status} showView={false} />
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="โรงงาน" value={fmtNum(c.factories.length, 0)} unit="แห่ง" goodWhen="neutral" />
        <StatTile label="อาคาร" value={fmtNum(d.buildings, 0)} unit="หลัง" goodWhen="neutral" />
        <StatTile label="เครื่องจักร" value={fmtNum(d.machines, 0)} unit="เครื่อง" goodWhen="neutral" />
        <StatTile label="ผู้ใช้งาน" value={fmtNum(c._count.users, 0)} unit="คน" goodWhen="neutral" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className={`${card} lg:col-span-2`}>
          <h2 className="mb-4 font-semibold">ข้อมูลบริษัท</h2>
          <InfoList
            items={[
              ["อีเมล", c.email],
              ["โทรศัพท์", c.phone],
              ["อุตสาหกรรม", c.industryType],
              ["เลขประจำตัวผู้เสียภาษี", c.taxId],
              ["จังหวัด", c.province],
              ["เว็บไซต์", c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{c.website}</a>],
              ["มาตรฐานคาร์บอน", c.carbonStandard],
              ["เขตเวลา", c.timezone],
              ["ที่อยู่", [c.address, c.postalCode, c.country].filter(Boolean).join(" ")],
              ["สร้างเมื่อ", fmtDate(c.createdAt)],
            ]}
          />
        </section>
        <section className={card}>
          <h2 className="mb-4 font-semibold">ความพร้อมในการเริ่มใช้งาน</h2>
          <Checklist items={d.checklist} />
        </section>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 font-semibold">โรงงาน</h2>
        {c.factories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {c.factories.map((f) => (
              <Link key={f.factoryId} href={`/platform/companies/${c.companyId}/factories/${f.factoryId}`} className={`${card} block transition-colors hover:border-primary/40`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.factoryName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{f.factoryCode}</p>
                  </div>
                  <Status map={RECORD_STATUS} value={f.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground tabular">
                  {f.province ?? "ไม่ระบุจังหวัด"} · อาคาร {fmtNum(f._count.buildings, 0)} · ผู้ใช้ {fmtNum(f._count.users, 0)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={Factory} title="ยังไม่มีโรงงาน" description="เพิ่มโรงงานแรกได้ที่หน้าโรงงาน หรือให้ผู้ดูแลบริษัทเพิ่มเอง" />
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">ผู้ใช้งาน</h2>
        {c.users.length ? (
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>โรงงาน</TableHead>
                  <TableHead>เข้าสู่ระบบล่าสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {c.users.map((u) => (
                  <TableRow key={u.userId}>
                    <TableCell>
                      <span className="block font-medium">{u.firstName} {u.lastName}</span>
                      <span className="block text-xs text-muted-foreground">{u.email}</span>
                    </TableCell>
                    <TableCell>{isRole(u.role.roleName) ? ROLE_LABEL[u.role.roleName] : u.role.roleName}</TableCell>
                    <TableCell>{u.factory?.factoryName ?? "ทุกโรงงาน"}</TableCell>
                    <TableCell className="tabular">{u.lastLogin ? fmtDateTime(u.lastLogin) : "ยังไม่เคย"}</TableCell>
                    <TableCell><Status map={RECORD_STATUS} value={u.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState icon={Users} title="ยังไม่มีผู้ใช้งาน" />
        )}
        {c._count.users > c.users.length && (
          <p className="mt-2 text-sm text-muted-foreground">
            แสดง {c.users.length} จาก {c._count.users} คน —{" "}
            <Link href={`/platform/users?company=${c.companyId}`} className="text-primary hover:underline">ดูทั้งหมดที่หน้าผู้ใช้งาน</Link>
          </p>
        )}
      </section>
    </>
  );
}

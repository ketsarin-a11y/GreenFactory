import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { BarList } from "@/components/data/bar-list";
import { Nameplate } from "@/components/data/nameplate";
import { Panel, QuietEmpty } from "@/components/platform/panel";
import { EmptyState } from "@/components/data/empty-state";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checklist, InfoList } from "@/components/platform/checklist";
import { PLAN_LABEL, ago } from "@/components/platform/labels";
import { fmtNum, fmtPct } from "@/lib/format";
import { pctChange } from "@/server/domain/analytics";
import { shortDay } from "@/server/queries/platform/series";
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
  const change = pctChange(d.usage.total, d.usage.prev);

  return (
    <>
      <Link href="/platform/companies" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> บริษัททั้งหมด
      </Link>
      <PageHeader
        title={c.companyName}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Nameplate>{c.companyCode}</Nameplate>
            <Status map={RECORD_STATUS} value={c.status} />
            <span>แพ็กเกจ {c.subscriptionPlan ? (PLAN_LABEL[c.subscriptionPlan] ?? c.subscriptionPlan) : "ไม่ระบุ"}</span>
          </span>
        }
        actions={
          <>
            <EditCompanyButton
              company={{
                companyId: c.companyId,
                companyName: c.companyName,
                email: c.email,
                phone: c.phone,
                province: c.province,
                industryType: c.industryType,
                subscriptionPlan: c.subscriptionPlan,
                taxId: c.taxId,
                address: c.address,
                postalCode: c.postalCode,
                country: c.country,
                website: c.website,
                carbonStandard: c.carbonStandard,
                timezone: c.timezone,
                currency: c.currency,
                language: c.language,
              }}
            />
            <CompanyActions id={c.companyId} name={c.companyName} status={c.status} showView={false} />
          </>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="รายการบันทึกต่อวัน"
          description="30 วันที่ผ่านมา (ถึงเมื่อวาน) นับเป็นจำนวนรายการจากทุกโรงงาน"
          table={{ columns: ["วันที่", "รายการ"], rows: d.usage.days.map((day, i) => [shortDay(day), fmtNum(d.usage.daily[i], 0)]) }}
        >
          <dl className="mb-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">รวม 30 วัน</dt>
              <dd className="mt-0.5 font-display text-xl font-semibold tabular">{fmtNum(d.usage.total, 0)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">เทียบ 30 วันก่อนหน้า</dt>
              <dd className="mt-0.5 font-display text-xl font-semibold tabular">{change === null ? "—" : fmtPct(change)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">บันทึกล่าสุด</dt>
              <dd className="mt-0.5">{d.usage.lastActivity ? ago(d.usage.lastActivity) : "ยังไม่เคยบันทึก"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">โครงสร้าง</dt>
              <dd className="mt-0.5 tabular">อาคาร {fmtNum(d.buildings, 0)} หลัง<br />เครื่องจักร {fmtNum(d.machines, 0)} เครื่อง</dd>
            </div>
          </dl>
          {d.usage.total > 0 ? (
            <TrendChart kind="bar" data={d.usage.days.map((day, i) => ({ label: shortDay(day), records: d.usage.daily[i] }))} series={[{ key: "records", label: "รายการบันทึก", color: "var(--chart-1)" }]} unit="รายการ" height={200} />
          ) : (
            <QuietEmpty>บริษัทนี้ยังไม่มีรายการบันทึกใน 30 วันที่ผ่านมา ตรวจว่ามีโรงงานและผู้ปฏิบัติงานแล้ว</QuietEmpty>
          )}
        </ChartCard>
        <Panel title="ความพร้อมในการเริ่มใช้งาน">
          <Checklist items={d.checklist} />
        </Panel>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="โรงงาน" description={`${fmtNum(c.factories.length, 0)} แห่ง`}>
          {c.factories.length ? (
            <ul className="-my-2 divide-y">
              {c.factories.map((f) => (
                <li key={f.factoryId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/platform/companies/${c.companyId}/factories/${f.factoryId}`} className="font-medium hover:underline">{f.factoryName}</Link>
                      <Nameplate>{f.factoryCode}</Nameplate>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.province ?? "ไม่ระบุจังหวัด"}</p>
                  </div>
                  <dl className="flex items-center gap-5 text-right text-xs text-muted-foreground tabular">
                    <div><dt>อาคาร</dt><dd className="text-sm text-foreground">{fmtNum(f._count.buildings, 0)}</dd></div>
                    <div><dt>ผู้ใช้</dt><dd className="text-sm text-foreground">{fmtNum(f._count.users, 0)}</dd></div>
                    <div><dt>บันทึก 30 วัน</dt><dd className="text-sm text-foreground">{fmtNum(d.factoryRecords.get(f.factoryId) ?? 0, 0)}</dd></div>
                    <dd><Status map={RECORD_STATUS} value={f.status} /></dd>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <QuietEmpty>ยังไม่มีโรงงาน เพิ่มได้ที่หน้าโรงงาน หรือให้ผู้ดูแลบริษัทเพิ่มเอง</QuietEmpty>
          )}
        </Panel>
        <Panel title="ผู้ใช้ตามบทบาท" description={`ทั้งหมด ${fmtNum(c._count.users, 0)} คน`}>
          {d.usersByRole.length ? (
            <BarList
              unit="คน"
              items={d.usersByRole.map((r) => ({
                label: isRole(r.role) ? ROLE_LABEL[r.role] : r.role,
                value: r.total,
                color: "var(--chart-1)",
                hint: r.active < r.total ? `ใช้งานได้ ${fmtNum(r.active, 0)} คน` : undefined,
              }))}
            />
          ) : (
            <QuietEmpty>ยังไม่มีผู้ใช้</QuietEmpty>
          )}
        </Panel>
      </div>

      <Panel className="mb-6" title="ข้อมูลบริษัท">
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
      </Panel>

      <section>
        <h2 className="mb-3 font-semibold">ผู้ใช้งาน</h2>
        {c.users.length ? (
          <div className="rounded-[10px] border bg-card">
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
          <EmptyState icon={Users} title="ยังไม่มีผู้ใช้งาน" description="สร้างผู้ใช้ให้บริษัทนี้ได้ที่หน้าผู้ใช้งาน" />
        )}
        {c._count.users > c.users.length && (
          <p className="mt-2 text-sm text-muted-foreground">
            แสดง {c.users.length} จาก {c._count.users} คน{" "}
            <Link href={`/platform/users?company=${c.companyId}`} className="text-primary hover:underline">ดูทั้งหมดที่หน้าผู้ใช้งาน</Link>
          </p>
        )}
      </section>
    </>
  );
}

import { PageHeader } from "@/components/app/page-header";
import { requireTenantUser } from "@/server/auth/current-user";
import { db } from "@/server/db";
import { Nameplate } from "@/components/data/nameplate";
import { CompanyForm, LogoUploader } from "./_components/company-form";

export default async function Page() {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const c = await db.company.findUniqueOrThrow({ where: { companyId: user.companyId } });
  const v = (s: string | null) => s ?? "";
  return (
    <>
      <PageHeader title="ข้อมูลบริษัท" description="ข้อมูลนี้ใช้บนรายงานและหน้าจอของทุกคนในบริษัท" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[10px] border bg-card p-5">
          <h2 className="mb-4 font-semibold">ข้อมูลทั่วไป</h2>
          <CompanyForm
            defaults={{
              companyName: c.companyName, taxId: v(c.taxId), industryType: v(c.industryType), address: v(c.address), province: v(c.province),
              postalCode: v(c.postalCode), country: c.country ?? "Thailand", phone: v(c.phone), email: v(c.email), website: v(c.website),
              timezone: c.timezone ?? "Asia/Bangkok", currency: c.currency ?? "THB", language: c.language ?? "th",
            }}
          />
        </section>
        <aside className="space-y-6">
          <section className="rounded-[10px] border bg-card p-5">
            <h2 className="mb-4 font-semibold">โลโก้บริษัท</h2>
            <LogoUploader hasLogo={!!c.logoPath} version={c.updatedAt.getTime()} />
          </section>
          <section className="rounded-[10px] border bg-card p-5 text-sm">
            <h2 className="mb-3 font-semibold">บัญชีบริษัท</h2>
            <dl className="space-y-2">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">รหัสองค์กร</dt><dd><Nameplate>{c.companyCode}</Nameplate></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">แพ็กเกจ</dt><dd>{c.subscriptionPlan ?? "—"}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">ผู้ใช้กรอกรหัสองค์กรนี้ตอนเข้าสู่ระบบ ติดต่อผู้ดูแลแพลตฟอร์มหากต้องการเปลี่ยนรหัสหรือแพ็กเกจ</p>
          </section>
        </aside>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/account/field";
import { FormSection, FormSheet } from "@/components/platform/form-sheet";
import { SelectField } from "@/components/platform/select-field";
import { TempPasswordInput } from "@/components/platform/temp-password";
import { PLAN_LABEL } from "@/components/platform/labels";
import { useAction } from "@/hooks/use-action";
import { createCompany, updateCompany } from "@/server/actions/platform/companies";

const PLANS = Object.entries(PLAN_LABEL).map(([value, label]) => ({ value, label }));
const STATUSES = [
  { value: "ACTIVE", label: "ใช้งานอยู่" },
  { value: "PENDING", label: "รอตรวจสอบ" },
];

function Text({ id, label, error, required, hint, defaultValue, type = "text" }: {
  id: string; label: string; error?: string; required?: boolean; hint?: string; defaultValue?: string | null; type?: string;
}) {
  return (
    <Field id={id} label={label} error={error} required={required} hint={hint}>
      <Input id={id} name={id} type={type} defaultValue={defaultValue ?? ""} required={required} aria-invalid={!!error} className="h-10" />
    </Field>
  );
}

export function CreateCompanyButton() {
  const [open, setOpen] = useState(false);
  const { run, pending, errors } = useAction(createCompany, { success: "เพิ่มบริษัทและผู้ดูแลบริษัทแล้ว" });
  return (
    <>
      <Button className="h-10" onClick={() => setOpen(true)}>
        <Plus /> เพิ่มบริษัท
      </Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        wide
        title="เพิ่มบริษัท"
        description="สร้างบริษัทพร้อมบัญชีผู้ดูแลบริษัทคนแรก ส่งรหัสผ่านชั่วคราวให้ผู้ดูแลเปลี่ยนเองหลังเข้าสู่ระบบ"
        pending={pending}
        onSubmit={async (fd) => {
          const r = await run(fd);
          if (r.ok) setOpen(false);
        }}
      >
        <FormSection title="ข้อมูลบริษัท">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text id="companyCode" label="รหัสบริษัท" required hint="ใช้เป็นรหัสองค์กรตอนเข้าสู่ระบบ" error={errors.companyCode} />
            <Field id="subscriptionPlan" label="แพ็กเกจ" required error={errors.subscriptionPlan}>
              <SelectField id="subscriptionPlan" name="subscriptionPlan" options={PLANS} defaultValue="TRIAL" />
            </Field>
          </div>
          <Text id="companyName" label="ชื่อบริษัท" required error={errors.companyName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text id="email" label="อีเมลบริษัท" type="email" error={errors.email} />
            <Text id="phone" label="โทรศัพท์" type="tel" error={errors.phone} />
            <Text id="province" label="จังหวัด" error={errors.province} />
            <Text id="industryType" label="อุตสาหกรรม" error={errors.industryType} />
          </div>
          <Field id="status" label="สถานะเริ่มต้น" error={errors.status}>
            <SelectField id="status" name="status" options={STATUSES} defaultValue="ACTIVE" />
          </Field>
        </FormSection>
        <FormSection title="ผู้ดูแลบริษัทคนแรก">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text id="adminFirstName" label="ชื่อ" required error={errors.adminFirstName} />
            <Text id="adminLastName" label="นามสกุล" required error={errors.adminLastName} />
          </div>
          <Text id="adminEmail" label="อีเมล (ใช้เข้าสู่ระบบ)" type="email" required error={errors.adminEmail} />
          <Field id="adminPassword" label="รหัสผ่านชั่วคราว" required error={errors.adminPassword} hint="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข">
            <TempPasswordInput id="adminPassword" name="adminPassword" invalid={!!errors.adminPassword} />
          </Field>
        </FormSection>
      </FormSheet>
    </>
  );
}

export type CompanyEdit = {
  companyId: number;
  companyName: string;
  email: string | null;
  phone: string | null;
  province: string | null;
  industryType: string | null;
  subscriptionPlan: string | null;
  taxId: string | null;
  address: string | null;
  postalCode: string | null;
  country: string | null;
  website: string | null;
  carbonStandard: string | null;
  timezone: string | null;
  currency: string | null;
  language: string | null;
};

export function EditCompanyButton({ company: c }: { company: CompanyEdit }) {
  const [open, setOpen] = useState(false);
  const { run, pending, errors } = useAction(updateCompany, { success: "บันทึกข้อมูลบริษัทแล้ว" });
  return (
    <>
      <Button variant="outline" className="h-10" onClick={() => setOpen(true)}>
        <Pencil /> แก้ไขข้อมูล
      </Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        wide
        title="แก้ไขข้อมูลบริษัท"
        description="รหัสบริษัทแก้ไขไม่ได้ เพราะผู้ใช้ใช้เป็นรหัสองค์กรตอนเข้าสู่ระบบ"
        pending={pending}
        onSubmit={async (fd) => {
          fd.set("companyId", String(c.companyId));
          const r = await run(fd);
          if (r.ok) setOpen(false);
        }}
      >
        <FormSection title="ข้อมูลทั่วไป">
          <Text id="companyName" label="ชื่อบริษัท" required defaultValue={c.companyName} error={errors.companyName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text id="taxId" label="เลขประจำตัวผู้เสียภาษี" defaultValue={c.taxId} error={errors.taxId} />
            <Text id="industryType" label="อุตสาหกรรม" defaultValue={c.industryType} error={errors.industryType} />
            <Field id="subscriptionPlan" label="แพ็กเกจ" required error={errors.subscriptionPlan}>
              <SelectField id="subscriptionPlan" name="subscriptionPlan" options={PLANS} defaultValue={c.subscriptionPlan ?? "TRIAL"} />
            </Field>
            <Text id="carbonStandard" label="มาตรฐานคาร์บอน" defaultValue={c.carbonStandard} error={errors.carbonStandard} />
          </div>
        </FormSection>
        <FormSection title="ติดต่อและที่อยู่">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text id="email" label="อีเมล" type="email" defaultValue={c.email} error={errors.email} />
            <Text id="phone" label="โทรศัพท์" type="tel" defaultValue={c.phone} error={errors.phone} />
          </div>
          <Text id="website" label="เว็บไซต์" type="url" defaultValue={c.website} error={errors.website} hint="เช่น https://example.co.th" />
          <Field id="address" label="ที่อยู่" error={errors.address}>
            <Textarea id="address" name="address" defaultValue={c.address ?? ""} rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Text id="province" label="จังหวัด" defaultValue={c.province} error={errors.province} />
            <Text id="postalCode" label="รหัสไปรษณีย์" defaultValue={c.postalCode} error={errors.postalCode} />
            <Text id="country" label="ประเทศ" defaultValue={c.country} error={errors.country} />
          </div>
        </FormSection>
        <FormSection title="ภูมิภาค">
          <div className="grid gap-4 sm:grid-cols-3">
            <Text id="timezone" label="เขตเวลา" defaultValue={c.timezone} error={errors.timezone} />
            <Text id="currency" label="สกุลเงิน" defaultValue={c.currency} error={errors.currency} />
            <Text id="language" label="ภาษา" defaultValue={c.language} error={errors.language} />
          </div>
        </FormSection>
      </FormSheet>
    </>
  );
}

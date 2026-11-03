"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/account/field";
import { FormSection, FormSheet } from "@/components/platform/form-sheet";
import { SelectField } from "@/components/platform/select-field";
import { useAction } from "@/hooks/use-action";
import { createFactory, setFactoryStatus } from "@/server/actions/platform/factories";

export function CreateFactoryButton({ companies }: { companies: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const { run, pending, errors } = useAction(createFactory, { success: "เพิ่มโรงงานแล้ว" });
  const t = (id: string, label: string, opts: { required?: boolean; type?: string; hint?: string; mono?: boolean; step?: string } = {}) => (
    <Field id={id} label={label} required={opts.required} error={errors[id]} hint={opts.hint}>
      <Input id={id} name={id} type={opts.type ?? "text"} step={opts.step} required={opts.required} aria-invalid={!!errors[id]} className={opts.mono ? "h-10 font-mono" : "h-10"} />
    </Field>
  );
  return (
    <>
      <Button className="h-10" onClick={() => setOpen(true)} disabled={!companies.length}>
        <Plus /> เพิ่มโรงงาน
      </Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        wide
        title="เพิ่มโรงงาน"
        description="เพิ่มได้เฉพาะบริษัทที่ใช้งานอยู่ รหัสโรงงานต้องไม่ซ้ำภายในบริษัท"
        pending={pending}
        onSubmit={async (fd) => {
          const r = await run(fd);
          if (r.ok) setOpen(false);
        }}
      >
        <FormSection title="ข้อมูลโรงงาน">
          <Field id="companyId" label="บริษัท" required error={errors.companyId}>
            <SelectField id="companyId" name="companyId" options={companies} placeholder="เลือกบริษัท" invalid={!!errors.companyId} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            {t("factoryCode", "รหัสโรงงาน", { required: true, mono: true, hint: "เช่น CHB01" })}
            {t("factoryName", "ชื่อโรงงาน", { required: true })}
            {t("phone", "โทรศัพท์", { type: "tel" })}
            {t("email", "อีเมล", { type: "email" })}
          </div>
        </FormSection>
        <FormSection title="ที่ตั้ง">
          <Field id="address" label="ที่อยู่" error={errors.address}>
            <Textarea id="address" name="address" rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            {t("province", "จังหวัด")}
            {t("postalCode", "รหัสไปรษณีย์")}
            {t("latitude", "ละติจูด", { type: "number", step: "any", hint: "-90 ถึง 90 เช่น 13.3611" })}
            {t("longitude", "ลองจิจูด", { type: "number", step: "any", hint: "-180 ถึง 180 เช่น 100.9847" })}
          </div>
          {t("googleMapUrl", "ลิงก์ Google Maps", { type: "url" })}
        </FormSection>
      </FormSheet>
    </>
  );
}

const STATUS = [
  { value: "ACTIVE", label: "ใช้งานอยู่" },
  { value: "INACTIVE", label: "ปิดใช้งาน" },
  { value: "SUSPENDED", label: "ระงับใช้งาน" },
];

export function FactoryStatusSelect({ factoryId, status, name }: { factoryId: number; status: string; name: string }) {
  const { run, pending } = useAction(setFactoryStatus, { success: "เปลี่ยนสถานะโรงงานแล้ว" });
  return (
    <Select value={status} disabled={pending} onValueChange={(v) => run({ factoryId, status: v as "ACTIVE" })}>
      <SelectTrigger className="h-8 w-36" aria-label={`สถานะของ ${name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { useRef } from "react";
import { Building2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/account/field";
import { SelectField } from "@/components/company/select-field";
import { useAction } from "@/hooks/use-action";
import { updateCompany, uploadCompanyLogo } from "@/server/actions/company/settings";

type Defaults = Record<"companyName" | "taxId" | "industryType" | "address" | "province" | "postalCode" | "country" | "phone" | "email" | "website" | "timezone" | "currency" | "language", string>;

export function CompanyForm({ defaults }: { defaults: Defaults }) {
  const { run, pending, errors } = useAction(updateCompany, { success: "บันทึกข้อมูลบริษัทแล้ว" });
  const text = (name: keyof Defaults, label: string, opts: { required?: boolean; type?: string; className?: string } = {}) => (
    <div className={opts.className}>
      <Field id={`c-${name}`} label={label} error={errors[name]} required={opts.required}>
        <Input id={`c-${name}`} name={name} type={opts.type ?? "text"} defaultValue={defaults[name]} required={opts.required} className="h-10" />
      </Field>
    </div>
  );
  return (
    <form action={async (fd) => { await run(fd); }} className="grid gap-4 sm:grid-cols-2">
      {text("companyName", "ชื่อบริษัท", { required: true, className: "sm:col-span-2" })}
      {text("taxId", "เลขประจำตัวผู้เสียภาษี")}
      {text("industryType", "ประเภทอุตสาหกรรม")}
      {text("address", "ที่อยู่", { className: "sm:col-span-2" })}
      {text("province", "จังหวัด")}
      {text("postalCode", "รหัสไปรษณีย์")}
      {text("country", "ประเทศ")}
      {text("phone", "โทรศัพท์", { type: "tel" })}
      {text("email", "อีเมล", { type: "email" })}
      {text("website", "เว็บไซต์", { type: "url" })}
      {text("timezone", "เขตเวลา")}
      {text("currency", "สกุลเงิน")}
      <Field id="c-language" label="ภาษา">
        <SelectField id="c-language" name="language" defaultValue={defaults.language} options={[{ value: "th", label: "ไทย" }, { value: "en", label: "English" }]} />
      </Field>
      <div className="flex items-end justify-end sm:col-span-2">
        <Button type="submit" className="h-10" disabled={pending}>{pending && <Loader2 className="animate-spin" />}บันทึก</Button>
      </div>
    </form>
  );
}

export function LogoUploader({ hasLogo, version }: { hasLogo: boolean; version: number }) {
  const input = useRef<HTMLInputElement>(null);
  const { run, pending } = useAction(uploadCompanyLogo, { success: "อัปเดตโลโก้แล้ว" });
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex h-24 w-full items-center justify-center rounded-lg border bg-muted/40">
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/company/logo?v=${version}`} alt="โลโก้บริษัท" className="max-h-20 max-w-[90%] object-contain" />
        ) : (
          <Building2 className="size-8 text-muted-foreground" aria-hidden />
        )}
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="เลือกไฟล์โลโก้"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { const fd = new FormData(); fd.set("file", f); run(fd); } e.target.value = ""; }} />
      <Button variant="outline" className="h-10" disabled={pending} onClick={() => input.current?.click()}>
        {pending ? <Loader2 className="animate-spin" /> : <Upload />} {hasLogo ? "เปลี่ยนโลโก้" : "อัปโหลดโลโก้"}
      </Button>
      <p className="text-xs text-muted-foreground">PNG, JPG หรือ WebP ไม่เกิน 2 MB</p>
    </div>
  );
}

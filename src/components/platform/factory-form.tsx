"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/account/field";
import { FormSection, FormSheet } from "@/components/platform/form-sheet";
import { SelectField } from "@/components/platform/select-field";
import { useAction } from "@/hooks/use-action";
import { createFactory, setFactoryStatus, updateFactory } from "@/server/actions/platform/factories";

export type FactoryEdit = {
  factoryId: number;
  factoryName: string;
  address: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapUrl: string | null;
  timezone: string | null;
};

type Errors = Record<string, string | undefined>;

function Text({ id, label, errors, value, required, type = "text", hint, step, inputMode }: {
  id: string; label: string; errors: Errors; value?: string | number | null; required?: boolean; type?: string; hint?: string; step?: string; inputMode?: "numeric" | "decimal";
}) {
  return (
    <Field id={id} label={label} required={required} error={errors[id]} hint={hint}>
      <Input id={id} name={id} type={type} step={step} inputMode={inputMode} defaultValue={value ?? ""} required={required} aria-invalid={!!errors[id]} className="h-10" />
    </Field>
  );
}

/** Contact + location fields shared by the create and edit sheets. */
function LocationFields({ errors, f }: { errors: Errors; f?: FactoryEdit }) {
  return (
    <>
      <FormSection title="ติดต่อ">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="phone" label="โทรศัพท์" type="tel" errors={errors} value={f?.phone} />
          <Text id="email" label="อีเมล" type="email" errors={errors} value={f?.email} />
        </div>
      </FormSection>
      <FormSection title="ที่ตั้ง">
        <Field id="address" label="ที่อยู่" error={errors.address}>
          <Textarea id="address" name="address" rows={2} defaultValue={f?.address ?? ""} aria-invalid={!!errors.address} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="province" label="จังหวัด" errors={errors} value={f?.province} />
          <Text id="postalCode" label="รหัสไปรษณีย์" inputMode="numeric" hint="ตัวเลข 5 หลัก" errors={errors} value={f?.postalCode} />
          <Text id="latitude" label="ละติจูด" type="number" step="any" hint="-90 ถึง 90 เช่น 13.3611" errors={errors} value={f?.latitude} />
          <Text id="longitude" label="ลองจิจูด" type="number" step="any" hint="-180 ถึง 180 เช่น 100.9847" errors={errors} value={f?.longitude} />
        </div>
        <Text id="googleMapUrl" label="ลิงก์ Google Maps" type="url" hint="ไม่กรอกก็ได้ ระบบจะใช้พิกัดเปิดแผนที่ให้" errors={errors} value={f?.googleMapUrl} />
      </FormSection>
    </>
  );
}

export function CreateFactoryButton({ companies }: { companies: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const { run, pending, errors } = useAction(createFactory, { success: "เพิ่มโรงงานแล้ว" });
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
        submitLabel="เพิ่มโรงงาน"
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
            <Text id="factoryCode" label="รหัสโรงงาน" required hint="เช่น CHB01 แก้ไขภายหลังไม่ได้" errors={errors} />
            <Text id="factoryName" label="ชื่อโรงงาน" required errors={errors} />
          </div>
        </FormSection>
        <LocationFields errors={errors} />
      </FormSheet>
    </>
  );
}

export function EditFactoryButton({ factory: f, compact }: { factory: FactoryEdit; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { run, pending, errors } = useAction(updateFactory, { success: "บันทึกข้อมูลโรงงานแล้ว" });
  return (
    <>
      {compact ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label={`แก้ไข ${f.factoryName}`} title="แก้ไขข้อมูล">
          <Pencil />
        </Button>
      ) : (
        <Button variant="outline" className="h-10" onClick={() => setOpen(true)}>
          <Pencil /> แก้ไขข้อมูล
        </Button>
      )}
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        wide
        title="แก้ไขข้อมูลโรงงาน"
        description="รหัสโรงงานแก้ไขไม่ได้ เพราะใช้อ้างอิงในรายการบันทึกและ QR Code"
        pending={pending}
        onSubmit={async (fd) => {
          fd.set("factoryId", String(f.factoryId));
          const r = await run(fd);
          if (r.ok) setOpen(false);
        }}
      >
        <FormSection title="ข้อมูลโรงงาน">
          <Text id="factoryName" label="ชื่อโรงงาน" required errors={errors} value={f.factoryName} />
          <Text id="timezone" label="เขตเวลา" hint="ชื่อเขตเวลา IANA เช่น Asia/Bangkok" errors={errors} value={f.timezone ?? "Asia/Bangkok"} />
        </FormSection>
        <LocationFields errors={errors} f={f} />
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

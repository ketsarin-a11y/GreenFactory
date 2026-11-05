"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Field } from "@/components/account/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/server/actions/contact";

const FACTORY_COUNTS = [
  ["1", "1 โรงงาน"],
  ["2-5", "2–5 โรงงาน"],
  ["6-20", "6–20 โรงงาน"],
  ["20+", "มากกว่า 20"],
] as const;

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, undefined);

  if (state?.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 py-6">
        <CheckCircle2 className="size-8 text-status-good" aria-hidden />
        <h2 className="text-xl font-semibold">ได้รับคำขอของคุณแล้ว</h2>
        <p className="text-muted-foreground">ทีมงานจะติดต่อกลับทางอีเมลหรือโทรศัพท์ที่ให้ไว้ เพื่อนัดวันสาธิตระบบ</p>
      </div>
    );
  }

  const err = (k: string) => state?.fieldErrors?.[k];
  const props = (k: string) => ({
    id: k,
    name: k,
    defaultValue: state?.values?.[k],
    ...(err(k) && { "aria-invalid": true, "aria-describedby": `${k}-error` }),
  });

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.message && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="ชื่อ - นามสกุล" required error={err("name")}>
          <Input {...props("name")} required autoComplete="name" className="h-10" />
        </Field>
        <Field id="company" label="บริษัท / โรงงาน" required error={err("company")}>
          <Input {...props("company")} required autoComplete="organization" className="h-10" />
        </Field>
        <Field id="email" label="อีเมล" required error={err("email")}>
          <Input {...props("email")} type="email" required autoComplete="email" placeholder="name@company.com" className="h-10" />
        </Field>
        <Field id="phone" label="โทรศัพท์" error={err("phone")}>
          <Input {...props("phone")} type="tel" autoComplete="tel" className="h-10" />
        </Field>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">
          จำนวนโรงงาน<span className="text-status-critical" aria-hidden> *</span>
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FACTORY_COUNTS.map(([value, label]) => (
            <label key={value} className="flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm has-checked:border-primary has-checked:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring">
              <input type="radio" name="factoryCount" value={value} required defaultChecked={state?.values?.factoryCount === value} className="accent-primary" />
              {label}
            </label>
          ))}
        </div>
        {err("factoryCount") && <p id="factoryCount-error" role="alert" className="mt-1.5 text-xs text-status-critical">{err("factoryCount")}</p>}
      </fieldset>
      <Field id="message" label="ข้อความ" hint="เช่น ข้อมูลที่มีอยู่ตอนนี้ ปัญหาที่พบ หรือเป้าหมายด้านพลังงานและคาร์บอน" error={err("message")}>
        <Textarea {...props("message")} rows={5} />
      </Field>
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">ข้อมูลนี้ใช้เพื่อติดต่อกลับเรื่องคำขอของคุณเท่านั้น</p>
        <Button type="submit" className="h-10 px-5" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          ส่งคำขอเดโม
        </Button>
      </div>
    </form>
  );
}

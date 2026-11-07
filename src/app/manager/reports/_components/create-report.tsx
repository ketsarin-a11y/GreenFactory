"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/account/field";
import { useAction } from "@/hooks/use-action";
import { createReport } from "@/server/actions/manager";

const TYPES = [
  { value: "RESOURCE_USAGE", label: "การใช้ทรัพยากร" },
  { value: "CARBON", label: "การปล่อยคาร์บอน" },
  { value: "KPI", label: "ผล KPI" },
] as const;
const FORMATS = [
  { value: "XLSX", label: "Excel (.xlsx)" },
  { value: "CSV", label: "CSV" },
  { value: "PDF", label: "PDF (พิมพ์จากเบราว์เซอร์)" },
] as const;

export function CreateReport({ defaultFrom, defaultTo }: { defaultFrom: string; defaultTo: string }) {
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("RESOURCE_USAGE");
  const [format, setFormat] = useState<(typeof FORMATS)[number]["value"]>("XLSX");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const { run, pending, errors } = useAction(createReport, { success: "สร้างรายงานแล้ว กำลังดาวน์โหลด" });
  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_160px_auto] lg:items-end"
      action={async () => {
        const r = await run({ type, format, from, to });
        if (r.ok) window.open(r.data.format === "PDF" ? `/manager/reports/${r.data.id}/print` : `/api/manager/reports/${r.data.id}/download`, r.data.format === "PDF" ? "_blank" : "_self");
      }}
    >
      <Field id="type" label="ประเภทรายงาน">
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger id="type" className="w-full data-[size=default]:h-10"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="format" label="รูปแบบไฟล์">
        <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
          <SelectTrigger id="format" className="w-full data-[size=default]:h-10"><SelectValue /></SelectTrigger>
          <SelectContent>{FORMATS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="from" label="ตั้งแต่วันที่" error={errors.from}>
        <DateField id="from" className="h-10 w-full" value={from} max={to} onChange={setFrom} />
      </Field>
      <Field id="to" label="ถึงวันที่" error={errors.to}>
        <DateField id="to" className="h-10 w-full" value={to} min={from} onChange={setTo} />
      </Field>
      <Button type="submit" className="h-10" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <FileDown />} สร้างรายงาน</Button>
    </form>
  );
}

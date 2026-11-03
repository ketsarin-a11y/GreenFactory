"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Loader2, MapPin, QrCode, ScanLine, Search, TriangleAlert, X } from "lucide-react";
import { Field } from "@/components/account/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { createUsage } from "@/server/actions/operator";
import type { RecordTarget } from "@/server/queries/operator";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";

type Resource = { id: number; label: string; unitId: number; unit: string };
const EVIDENCE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const EVIDENCE_MAX = 10 * 1024 * 1024;
const KIND = { MACHINE: "เครื่องจักร", CHECKPOINT: "จุดตรวจ" } as const;
const keyOf = (t: RecordTarget) => `${t.kind}-${t.id}`;

export function RecordForm({ targets, resources, scan, scanError, defaultUsageAt, recorder }: {
  targets: RecordTarget[];
  resources: Resource[];
  scan: { scanId: string; target: RecordTarget } | null;
  scanError: string | null;
  defaultUsageAt: string;
  recorder: string;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<RecordTarget | null>(scan?.target ?? null);
  const [query, setQuery] = useState("");
  // Pre-select what this machine/checkpoint is usually read for (its most recent resource).
  const recentOf = (t: RecordTarget | null) =>
    (t && targets.find((x) => x.kind === t.kind && x.id === t.id)?.recent) ?? [];
  const [resourceId, setResourceId] = useState(() => String(recentOf(scan?.target ?? null)[0] ?? ""));
  const orderedResources = useMemo(() => {
    const recent = recentOf(target);
    return [...resources].sort((a, b) => {
      const ia = recent.indexOf(a.id), ib = recent.indexOf(b.id);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, target]);
  const [quantity, setQuantity] = useState("");
  const [usageAt, setUsageAt] = useState(defaultUsageAt);
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "review">("form");
  const [local, setLocal] = useState<Record<string, string>>({});
  const { run, pending, errors: server } = useAction(createUsage, { success: (d) => `บันทึกเรียบร้อย • ${d.usageReference}` });
  const errors = { ...server, ...local };

  const resource = resources.find((r) => String(r.id) === resourceId);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return targets.filter((t) => !q || `${t.name} ${t.code} ${t.location}`.toLowerCase().includes(q)).slice(0, 50);
  }, [targets, query]);

  const clear = (k: string) => setLocal((e) => ({ ...e, [k]: "" }));

  function validate() {
    const e: Record<string, string> = {};
    if (!target) e.targetId = "กรุณาเลือกเครื่องจักรหรือจุดตรวจ";
    if (!resource) e.resourceTypeId = "กรุณาเลือกประเภททรัพยากร";
    if (!(Number(quantity) > 0)) e.quantity = "ปริมาณการใช้ทรัพยากรต้องมากกว่า 0";
    if (!usageAt) e.usageAt = "กรุณาระบุวันที่และเวลา";
    if (file && !EVIDENCE_TYPES.includes(file.type)) e.evidence = "รองรับเฉพาะ JPG, PNG หรือ PDF";
    else if (file && file.size > EVIDENCE_MAX) e.evidence = "ไฟล์ใหญ่เกิน 10 MB";
    setLocal(e);
    return Object.keys(e).length === 0;
  }

  function reset() {
    if (!scan) setTarget(null);
    setResourceId("");
    setQuantity("");
    setUsageAt(defaultUsageAt);
    setRemark("");
    setFile(null);
    setLocal({});
  }

  async function save() {
    if (!target || !resource) return;
    const fd = new FormData();
    fd.set("targetType", target.kind);
    fd.set("targetId", String(target.id));
    fd.set("resourceTypeId", String(resource.id));
    fd.set("unitId", String(resource.unitId));
    fd.set("quantity", quantity);
    fd.set("usageAt", usageAt);
    fd.set("remark", remark);
    if (scan) fd.set("scanId", scan.scanId);
    if (file) fd.set("evidence", file);
    const r = await run(fd);
    if (r.ok) router.push("/operator/history?mine=1");
    else setStep("form");
  }

  const bar = "sticky bottom-0 z-10 -mx-4 mt-6 flex gap-2 border-t bg-background px-4 py-3 md:static md:mx-0 md:justify-end md:border-0 md:px-0";

  if (step === "review" && target && resource) {
    const rows: [string, string][] = [
      [KIND[target.kind], `${target.name} (${target.code})`],
      ["ตำแหน่ง", target.location],
      ["ทรัพยากร", resource.label],
      ["ปริมาณ", `${fmtNum(Number(quantity), 2)} ${resource.unit}`],
      ["วันที่และเวลา", usageAt.replace("T", " ") + " น. (เวลาไทย)"],
      ["ผู้บันทึก", recorder],
      ["ที่มา", scan ? "สแกน QR Code" : "เลือกเอง"],
      ["หมายเหตุ", remark.trim() || "—"],
      ["หลักฐาน", file?.name ?? "—"],
    ];
    return (
      <section className="mx-auto max-w-2xl" aria-labelledby="review">
        <div className="rounded-xl border bg-card p-5">
          <h2 id="review" className="mb-4 font-semibold">ตรวจสอบก่อนบันทึก</h2>
          <dl className="divide-y text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-muted-foreground">{k}</dt>
                <dd className={cn("min-w-0 text-right font-medium break-words", k === "ปริมาณ" && "tabular")}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={bar}>
          <Button type="button" variant="outline" size="lg" className="h-11 flex-1 md:flex-none" onClick={() => setStep("form")} disabled={pending}>
            <ArrowLeft /> แก้ไข
          </Button>
          <Button type="button" size="lg" className="h-11 flex-[2] md:flex-none" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Check />} ยืนยันและบันทึก
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form
      className="mx-auto max-w-2xl space-y-6"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) setStep("review");
      }}
    >
      {scanError && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>{scanError}</AlertTitle>
          <AlertDescription>
            <span>เลือกเครื่องจักรหรือจุดตรวจเองด้านล่าง หรือ <Link href="/operator/scan" className="underline">สแกนใหม่</Link></span>
          </AlertDescription>
        </Alert>
      )}

      <section className="rounded-xl border bg-card p-5" aria-labelledby="step-target">
        <h2 id="step-target" className="mb-3 font-semibold">1. เครื่องจักรหรือจุดตรวจ</h2>
        {target ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 p-4">
            <div className="min-w-0">
              {scan && (
                <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <QrCode className="size-3.5" aria-hidden /> ระบุจาก QR Code
                </p>
              )}
              <p className="text-xs text-muted-foreground">{KIND[target.kind]}</p>
              <p className="font-medium">{target.name} <span className="font-mono text-xs text-muted-foreground">{target.code}</span></p>
              <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />{target.location}</p>
            </div>
            {!scan && (
              <Button type="button" variant="outline" size="lg" className="h-11 shrink-0" onClick={() => setTarget(null)}>
                <X /> เปลี่ยน
              </Button>
            )}
          </div>
        ) : targets.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีเครื่องจักรหรือจุดตรวจในโรงงานของคุณ กรุณาติดต่อผู้ดูแลระบบของบริษัท</p>
        ) : (
          <fieldset aria-describedby={errors.targetId ? "targetId-error" : undefined}>
            <legend className="sr-only">เลือกเครื่องจักรหรือจุดตรวจ</legend>
            <div className="relative mb-3">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อ รหัส หรือไลน์ผลิต" aria-label="ค้นหาเครื่องจักรหรือจุดตรวจ" className="h-11 pl-9" />
            </div>
            <ul className="max-h-80 space-y-1.5 overflow-y-auto">
              {shown.map((t) => (
                <li key={keyOf(t)}>
                  <button
                    type="button"
                    onClick={() => { setTarget(t); clear("targetId"); if (t.recent?.[0]) setResourceId(String(t.recent[0])); }}
                    className="flex min-h-11 w-full items-start gap-3 rounded-lg border p-3 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="mt-0.5 shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{KIND[t.kind]}</span>
                    <span className="min-w-0">
                      <span className="block font-medium">{t.name} <span className="font-mono text-xs text-muted-foreground">{t.code}</span></span>
                      <span className="block text-xs text-muted-foreground">{t.location}</span>
                    </span>
                  </button>
                </li>
              ))}
              {shown.length === 0 && <li className="py-4 text-center text-sm text-muted-foreground">ไม่พบรายการที่ตรงกับ “{query}”</li>}
            </ul>
            <div className="mt-3 flex justify-between gap-2 text-sm">
              <Link href="/operator/scan" className="inline-flex min-h-11 items-center gap-1.5 text-primary underline-offset-4 hover:underline"><ScanLine className="size-4" aria-hidden /> หรือสแกน QR Code</Link>
            </div>
          </fieldset>
        )}
        {errors.targetId && <p id="targetId-error" role="alert" className="mt-2 text-xs text-status-critical">{errors.targetId}</p>}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5" aria-labelledby="step-reading">
        <h2 id="step-reading" className="font-semibold">2. ค่าที่บันทึก</h2>
        <Field id="resourceTypeId" label="ประเภททรัพยากร" error={errors.resourceTypeId} required>
          <Select value={resourceId} onValueChange={(v) => { setResourceId(v); clear("resourceTypeId"); }}>
            <SelectTrigger id="resourceTypeId" className="h-11 w-full" aria-invalid={!!errors.resourceTypeId}>
              <SelectValue placeholder="เลือกประเภททรัพยากร" />
            </SelectTrigger>
            <SelectContent>
              {orderedResources.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field id="quantity" label="ปริมาณการใช้" error={errors.quantity} required>
            <Input id="quantity" type="number" inputMode="decimal" step="0.01" min="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="tabular h-11" aria-invalid={!!errors.quantity} />
          </Field>
          <Field id="unit" label="หน่วยวัด">
            <Input id="unit" value={resource?.unit ?? "—"} readOnly tabIndex={-1} className="h-11 bg-muted" />
          </Field>
        </div>
        <Field id="usageAt" label="วันที่และเวลา" error={errors.usageAt} hint="เวลาไทย ย้อนหลังได้ไม่เกิน 31 วัน" required>
          <Input id="usageAt" type="datetime-local" value={usageAt} onChange={(e) => setUsageAt(e.target.value)} className="h-11" aria-invalid={!!errors.usageAt} />
        </Field>
        <Field id="remark" label="หมายเหตุ" error={errors.remark} hint={`${remark.length.toLocaleString("th-TH")}/1,000 ตัวอักษร`}>
          <Textarea id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} maxLength={1000} rows={3} />
        </Field>
        <Field id="evidence" label="หลักฐาน (ไม่บังคับ)" error={errors.evidence} hint="รูปมิเตอร์หรือเอกสาร JPG, PNG, PDF ไม่เกิน 10 MB">
          <Input id="evidence" type="file" accept="image/jpeg,image/png,application/pdf" className="h-11 py-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
      </section>

      <div className={bar}>
        <Button type="button" variant="outline" size="lg" className="h-11 flex-1 md:flex-none" onClick={reset}>ล้างข้อมูล</Button>
        <Button type="submit" size="lg" className="h-11 flex-[2] md:flex-none"><CheckCircle2 /> ตรวจสอบข้อมูล</Button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Cog, Gauge, History, Home, Loader2, MapPin, QrCode, ScanLine, Search, TriangleAlert, X } from "lucide-react";
import { Field } from "@/components/account/field";
import { Nameplate } from "@/components/data/nameplate";
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

type Resource = { id: number; label: string; category: string; unitId: number; unit: string };
type Next = { kind: RecordTarget["kind"]; id: number; name: string; code: string };
const EVIDENCE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const EVIDENCE_MAX = 10 * 1024 * 1024;
const KIND = { MACHINE: "เครื่องจักร", CHECKPOINT: "จุดตรวจ" } as const;
const keyOf = (t: { kind: string; id: number }) => `${t.kind}-${t.id}`;
const KindIcon = ({ kind }: { kind: RecordTarget["kind"] }) => {
  const Icon = kind === "MACHINE" ? Cog : Gauge;
  return <Icon className="size-4 shrink-0 text-muted-foreground" aria-label={KIND[kind]} />;
};

export function RecordForm({ targets, resources, scan, scanError, preset, todo, defaultUsageAt, recorder }: {
  targets: RecordTarget[];
  resources: Resource[];
  scan: { scanId: string; target: RecordTarget } | null;
  scanError: string | null;
  /** From `?target=` (already scoped on the server). The operator can still change it. */
  preset: RecordTarget | null;
  /** Today's unrecorded routine targets, for "บันทึกเครื่องถัดไป". */
  todo: Next[];
  defaultUsageAt: string;
  recorder: string;
}) {
  const initial = scan?.target ?? preset;
  const [target, setTarget] = useState<RecordTarget | null>(initial);
  const [query, setQuery] = useState("");
  // Pre-select what this machine/checkpoint is usually read for (its most recent resource).
  const recentOf = (t: RecordTarget | null) =>
    (t && targets.find((x) => x.kind === t.kind && x.id === t.id)?.recent) ?? [];
  const [resourceId, setResourceId] = useState(() => String(recentOf(initial)[0] ?? ""));
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
  const [step, setStep] = useState<"form" | "review" | "saved">("form");
  const [saved, setSaved] = useState<{ reference: string; target: RecordTarget; resource: string; quantity: number; unit: string } | null>(null);
  const [local, setLocal] = useState<Record<string, string>>({});
  // The success screen replaces a toast.
  const { run, pending, errors: server } = useAction(createUsage);
  const errors = { ...server, ...local };

  const resource = resources.find((r) => String(r.id) === resourceId);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Today's unrecorded routine targets first, then the rest.
    const rank = (t: RecordTarget) => { const i = todo.findIndex((x) => keyOf(x) === keyOf(t)); return i < 0 ? 1e6 : i; };
    return targets
      .filter((t) => !q || `${t.name} ${t.code} ${t.location}`.toLowerCase().includes(q))
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, 50);
  }, [targets, query, todo]);

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
    if (r.ok) {
      setSaved({ reference: r.data.usageReference, target, resource: resource.label, quantity: Number(quantity), unit: resource.unit });
      setStep("saved");
      window.scrollTo({ top: 0 });
    } else setStep("form");
  }

  const bar = "sticky bottom-0 z-10 -mx-4 mt-6 flex gap-2 border-t bg-background px-4 py-3 md:static md:mx-0 md:justify-end md:border-0 md:px-0";

  if (step === "saved" && saved) {
    const next = todo.find((t) => keyOf(t) !== keyOf(saved.target));
    return (
      <section className="mx-auto max-w-md" aria-labelledby="saved">
        <div className="rounded-[14px] border bg-card">
          <div className="flex flex-col items-center px-5 pt-8 pb-6 text-center">
            <CheckCircle2 className="size-10 text-primary" aria-hidden />
            <h2 id="saved" className="mt-3 font-display text-2xl font-semibold">บันทึกแล้ว</h2>
            <p className="mt-4 font-display text-5xl leading-none font-semibold tracking-tight tabular">
              {fmtNum(saved.quantity, 2)}
              <span className="ml-2 font-sans text-base font-normal text-muted-foreground">{saved.unit}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{saved.resource}</p>
          </div>
          <dl className="divide-y border-t text-sm">
            <div className="flex items-start justify-between gap-4 px-5 py-3">
              <dt className="shrink-0 text-muted-foreground">{KIND[saved.target.kind]}</dt>
              <dd className="min-w-0 text-right">
                <span className="block font-medium">{saved.target.name}</span>
                <Nameplate className="mt-1 whitespace-nowrap">{saved.target.code}</Nameplate>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">เลขอ้างอิง</dt>
              <dd className="min-w-0 font-mono text-xs break-all">{saved.reference}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-6 space-y-2">
          {next ? (
            <Button asChild size="lg" className="h-auto min-h-14 w-full flex-col gap-0 py-2.5">
              <Link href={`/operator/record?target=${next.kind}:${next.id}`}>
                <span className="text-base">บันทึกเครื่องถัดไป</span>
                <span className="text-xs font-normal opacity-80">{next.name} ({next.code})</span>
              </Link>
            </Button>
          ) : (
            <>
              <p className="pb-2 text-center text-sm text-muted-foreground">บันทึกครบทุกเครื่องในงานวันนี้แล้ว</p>
              <Button asChild size="lg" className="h-12 w-full text-base"><Link href="/operator"><Home /> กลับหน้าหลัก</Link></Button>
            </>
          )}
          <Button asChild variant="outline" size="lg" className="h-11 w-full">
            <Link href="/operator/history?mine=1"><History /> ดูประวัติ</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (step === "review" && target && resource) {
    const rows: [string, React.ReactNode][] = [
      [KIND[target.kind], <span key="t" className="inline-flex flex-wrap items-center justify-end gap-2">{target.name}<Nameplate className="shrink-0 whitespace-nowrap">{target.code}</Nameplate></span>],
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {scan && (
                <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <QrCode className="size-3.5" aria-hidden /> ระบุจาก QR Code
                </p>
              )}
              <p className="text-xs text-muted-foreground">{KIND[target.kind]}</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">{target.name} <Nameplate className="shrink-0 whitespace-nowrap">{target.code}</Nameplate></p>
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
            <ul className="max-h-80 divide-y overflow-y-auto rounded-lg border">
              {shown.map((t) => (
                <li key={keyOf(t)}>
                  <button
                    type="button"
                    onClick={() => { setTarget(t); clear("targetId"); if (t.recent?.[0]) setResourceId(String(t.recent[0])); }}
                    className="flex min-h-12 w-full items-start gap-3 px-3 py-3 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                  >
                    <span className="mt-0.5"><KindIcon kind={t.kind} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">{t.location}</span>
                    </span>
                    <Nameplate className="mt-0.5 shrink-0 whitespace-nowrap">{t.code}</Nameplate>
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
              {/* Trigger shows the name only; the list shows the category as a muted second line. */}
              <SelectValue placeholder="เลือกประเภททรัพยากร">{resource?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {orderedResources.map((r) => (
                <SelectItem key={r.id} value={String(r.id)} className="py-2">
                  <span className="flex flex-col items-start">
                    <span>{r.label}</span>
                    <span className="text-xs text-muted-foreground">{r.category}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="quantity" label="ปริมาณการใช้" error={errors.quantity} hint={resource ? `หน่วยวัด ${resource.unit} ตามประเภททรัพยากร` : undefined} required>
          <div className="relative">
            <Input id="quantity" type="number" inputMode="decimal" step="0.01" min="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" className="tabular h-14 pr-20 font-display text-2xl md:text-2xl" aria-invalid={!!errors.quantity} />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground" aria-hidden>{resource?.unit ?? "หน่วย"}</span>
          </div>
        </Field>
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

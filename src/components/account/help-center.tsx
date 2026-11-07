"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { createSupportTicket } from "@/server/actions/account";
import { Field } from "./field";

export type Faq = { q: string; a: string; tag: string };

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL: "ทั่วไป", QR: "QR Code", RECORD: "การบันทึกข้อมูล", ACCOUNT: "บัญชีผู้ใช้",
  HISTORY: "ประวัติการบันทึก", REPORT: "รายงาน", SENSOR: "เซนเซอร์", SYSTEM: "ระบบผิดปกติ",
};
const PRIORITY_LABEL = { LOW: "ต่ำ", NORMAL: "ปกติ", HIGH: "สูง", URGENT: "เร่งด่วน" };

export function HelpCenter({ faqs, categories }: { faqs: Faq[]; categories: (keyof typeof CATEGORY_LABEL)[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => faqs.filter((f) => !q || (f.q + f.a).toLowerCase().includes(q.toLowerCase())), [faqs, q]);
  const form = useRef<HTMLFormElement>(null);
  const [category, setCategory] = useState<string>("GENERAL");
  const [priority, setPriority] = useState<string>("NORMAL");
  const { run, pending, errors } = useAction(createSupportTicket, { success: (d) => `ส่งคำร้องแล้ว เลขอ้างอิง ${d.ticketReference}` });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">คำถามที่พบบ่อย</h2>
        <div className="relative mt-3 mb-2">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาคำถาม" aria-label="ค้นหาคำถาม" className="pl-8" />
        </div>
        <div className="divide-y">
          {shown.map((f) => (
            <details key={f.q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-medium">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
          {shown.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">ไม่พบคำถามที่ตรงกัน ลองส่งคำร้องถึงทีมงาน</p>}
        </div>
      </section>
      <section className="h-fit rounded-xl border bg-card p-5">
        <h2 className="font-semibold">แจ้งปัญหาหรือขอความช่วยเหลือ</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">ทีมดูแลระบบจะติดตามจากเลขอ้างอิงที่ได้รับ</p>
        <form
          ref={form}
          className="space-y-4"
          action={async (fd) => {
            fd.set("category", category);
            fd.set("priority", priority);
            fd.set("pageUrl", typeof window === "undefined" ? "" : document.referrer.replace(window.location.origin, ""));
            const r = await run(fd);
            if (r.ok) form.current?.reset();
          }}
        >
          <Field id="subject" label="หัวข้อ" error={errors.subject} required>
            <Input id="subject" name="subject" required maxLength={150} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="category" label="ประเภท">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field id="priority" label="ความสำคัญ">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PRIORITY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <Field id="description" label="รายละเอียด" error={errors.description} hint="เล่าว่าเกิดอะไรขึ้น ที่หน้าไหน และทำอะไรอยู่" required>
            <Textarea id="description" name="description" rows={5} required maxLength={3000} />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />} ส่งคำร้อง
          </Button>
        </form>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, Section, SectionHeading } from "@/components/marketing/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ราคา",
  description: "แพ็กเกจ TRIAL, STANDARD และ ENTERPRISE ของ GreenFactory Insight ราคาเสนอตามขนาดการใช้งาน ติดต่อฝ่ายขายเพื่อรับใบเสนอราคา",
  openGraph: { title: "ราคา · GreenFactory Insight" },
};

const PLANS = [
  {
    code: "TRIAL",
    name: "ทดลองใช้",
    fit: "สำหรับโรงงานที่อยากลองกับข้อมูลจริงก่อนตัดสินใจ",
    features: ["เริ่มจาก 1 โรงงาน", "บันทึกด้วย QR Code พลังงาน น้ำ และคาร์บอน", "แดชบอร์ดและการแจ้งเตือนความผิดปกติ", "ทีมงานช่วยตั้งค่าโครงสร้างโรงงานเริ่มต้น"],
  },
  {
    code: "STANDARD",
    name: "มาตรฐาน",
    fit: "สำหรับบริษัทที่ใช้งานจริงประจำวัน",
    features: ["ทุกอย่างในแพ็กเกจทดลอง", "หลายโรงงานในบริษัทเดียว", "KPI รายงาน และส่งออก Excel, CSV, PDF", "ผู้ช่วย AI G-FAY สำหรับผู้จัดการ", "ช่องทางแจ้งปัญหาในระบบ"],
    featured: true,
  },
  {
    code: "ENTERPRISE",
    name: "องค์กร",
    fit: "สำหรับกลุ่มบริษัทหรือโรงงานที่มีความต้องการเฉพาะ",
    features: ["ทุกอย่างในแพ็กเกจมาตรฐาน", "วางแผนการเชื่อมต่อเซนเซอร์และระบบเดิม", "ปรับค่า Emission Factor และ KPI ให้ตรงกับมาตรฐานขององค์กร", "อบรมผู้ใช้งานแต่ละบทบาท"],
  },
];

const FAQ = [
  { q: "ทำไมไม่มีราคาแสดงบนหน้านี้", a: "ราคาขึ้นกับจำนวนโรงงาน จุดวัด และความช่วยเหลือที่ต้องการ เราจึงเสนอราคาหลังจากพูดคุยเรื่องการใช้งานจริงแล้ว" },
  { q: "ต้องติดตั้งอุปกรณ์หรือเซนเซอร์ก่อนไหม", a: "ไม่จำเป็น เริ่มได้จากการติด QR Code ที่จุดวัดและให้ผู้ปฏิบัติงานบันทึกค่ามิเตอร์ผ่านมือถือ ส่วนการเชื่อมเซนเซอร์คุยกันได้ภายหลัง" },
  { q: "แพลตฟอร์มรองรับหลายโรงงานหรือหลายหน่วยงานไหม", a: "รองรับ ระบบแยกข้อมูล ผู้ใช้งาน หน่วยงาน และสิทธิ์การเข้าถึงของแต่ละบริษัทและโรงงานไว้อย่างเป็นระบบ" },
  { q: "ต้องเตรียมข้อมูลอะไรบ้างก่อนติดต่อ", a: "ประเภทโรงงาน จำนวนโรงงาน ข้อมูลที่มีอยู่ เช่น ค่าไฟ ค่าน้ำ เชื้อเพลิง หรือข้อมูลจากเครื่องจักร และเป้าหมายที่ต้องการ" },
  { q: "ย้ายข้อมูลออกจากระบบได้ไหม", a: "ได้ รายงานและข้อมูลการใช้ทรัพยากรส่งออกเป็น Excel หรือ CSV ได้" },
];

export default function PricingPage() {
  return (
    <>
      <PageIntro
        eyebrow="ราคา"
        title="เลือกแพ็กเกจตามขนาดการใช้งาน"
        body="ทุกแพ็กเกจใช้ระบบเดียวกัน ต่างกันที่จำนวนโรงงานและความช่วยเหลือที่ได้รับ ติดต่อฝ่ายขายเพื่อรับใบเสนอราคาที่ตรงกับโรงงานของคุณ"
      />
      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.code} className={cn("flex flex-col rounded-xl border bg-card p-6", p.featured && "border-primary ring-1 ring-primary")}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground">{p.code}</p>
                {p.featured && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">แนะนำ</span>}
              </div>
              <h2 className="mt-2 text-2xl font-semibold">{p.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.fit}</p>
              <p className="mt-6 text-lg font-semibold">ติดต่อฝ่ายขาย</p>
              <ul className="mt-6 flex-1 space-y-3 border-t pt-6">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.featured ? "default" : "outline"} className="mt-8 h-10">
                <Link href="/contact">ติดต่อฝ่ายขาย</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="คำถามที่พบบ่อย" title="ก่อนเริ่มพูดคุย" />
          <div className="divide-y border-y">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

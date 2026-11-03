import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BellRing, Building2, ClipboardList, Droplets, FileBarChart, HardHat, Leaf, LineChart, QrCode, ShieldCheck, UserCog, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/components/marketing/product-preview";
import { CtaBand, Eyebrow, Section, SectionHeading } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: { absolute: "GreenFactory Insight · ข้อมูลพลังงานและคาร์บอนของโรงงานในระบบเดียว" },
  description:
    "บันทึกมิเตอร์หน้างานด้วย QR Code ติดตามไฟฟ้า น้ำ เชื้อเพลิง และคำนวณคาร์บอนอัตโนมัติ พร้อมแจ้งเตือนเมื่อการใช้ผิดปกติ สำหรับโรงงานอุตสาหกรรมไทย",
  openGraph: {
    title: "GreenFactory Insight",
    description: "ข้อมูลพลังงาน น้ำ และคาร์บอนของโรงงาน ในระบบเดียวที่ทีมหน้างานและผู้บริหารใช้ร่วมกัน",
    images: ["/images/hero-factory.jpg"],
  },
};

const STEPS = [
  { icon: QrCode, title: "สแกน QR", body: "ผู้ปฏิบัติงานสแกน QR Code ที่ติดไว้กับเครื่องจักรหรือจุดวัด ระบบรู้ทันทีว่าเป็นมิเตอร์ตัวไหน" },
  { icon: ClipboardList, title: "บันทึก", body: "กรอกค่าที่อ่านได้ หน่วยถูกล็อกตามจุดวัด แนบรูปหลักฐานได้ วันและเวลาเป็นเวลาไทย" },
  { icon: LineChart, title: "วิเคราะห์", body: "ระบบเทียบกับค่าย้อนหลัง คำนวณคาร์บอน และแจ้งเตือนเมื่อค่าสูงหรือต่ำผิดปกติ" },
  { icon: FileBarChart, title: "รายงาน", body: "ผู้จัดการดูแนวโน้ม เปรียบเทียบ และส่งออกรายงานเป็น Excel, CSV หรือ PDF" },
];

const FEATURES = [
  { icon: Zap, title: "พลังงานไฟฟ้าและเชื้อเพลิง", body: "ติดตามการใช้ตามโรงงาน อาคาร แผนก สายการผลิต และเครื่องจักร", href: "/features#energy" },
  { icon: Droplets, title: "น้ำและทรัพยากร", body: "เห็นปริมาณการใช้น้ำของแต่ละจุด เพื่อหาจุดที่ใช้สูงกว่าปกติ", href: "/features#water" },
  { icon: Leaf, title: "คาร์บอน", body: "คำนวณจากข้อมูลกิจกรรม × ค่า Emission Factor แยกตาม Scope และตรวจสอบย้อนหลังได้", href: "/features#carbon" },
  { icon: BellRing, title: "แจ้งเตือนความผิดปกติ", body: "เทียบค่าล่าสุดกับประวัติของจุดเดียวกัน แจ้งเมื่อค่าหลุดจากช่วงปกติ", href: "/features#alerts" },
  { icon: Building2, title: "หลายโรงงาน หลายบทบาท", body: "แต่ละบริษัทมีพื้นที่ข้อมูลของตัวเอง ผู้ใช้เห็นเฉพาะข้อมูลตามสิทธิ์", href: "/features#security" },
];

const ROLES = [
  { icon: UserCog, title: "ผู้ดูแลบริษัท", body: "จัดการข้อมูลบริษัท โรงงาน ผู้ใช้งาน สิทธิ์การเข้าถึง เครื่องจักร และ QR Code" },
  { icon: LineChart, title: "ผู้จัดการโรงงาน", body: "ติดตาม KPI การใช้ทรัพยากร คาร์บอน การแจ้งเตือน และออกรายงาน" },
  { icon: HardHat, title: "ผู้ปฏิบัติงาน", body: "สแกน QR และบันทึกค่ามิเตอร์จากหน้างานบนมือถือ ดูประวัติของตัวเอง" },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <Eyebrow>แพลตฟอร์มข้อมูลพลังงานและคาร์บอนสำหรับโรงงาน</Eyebrow>
            <h1 className="mt-4 text-4xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-5xl">
              รู้ว่าโรงงานใช้พลังงานเท่าไร และปล่อยคาร์บอนจากตรงไหน
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              รวมค่ามิเตอร์ไฟฟ้า น้ำ และเชื้อเพลิงจากหน้างานไว้ในระบบเดียว คำนวณคาร์บอนให้อัตโนมัติ
              และแจ้งเตือนเมื่อการใช้ผิดปกติ เพื่อให้ทีมหน้างานและผู้บริหารเห็นข้อมูลชุดเดียวกัน
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 px-5">
                <Link href="/contact">ขอเดโม <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outline" className="h-11 px-5">
                <Link href="/login">เข้าสู่ระบบ</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl border">
            <Image
              src="/images/hero-factory.jpg"
              alt="ภายในโรงงานอุตสาหกรรมที่มีเครื่องจักรและสายการผลิต"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="หน้าจอผู้จัดการ"
            title="เปิดมาก็เห็นว่าวันนี้ต้องดูอะไร"
            body="ยอดใช้ไฟฟ้า น้ำ และคาร์บอนของเดือน แนวโน้มรายวัน และรายการที่ผิดปกติ อยู่ในหน้าเดียว และย้อนดูค่าที่บันทึกจากหน้างานได้"
          />
          <ProductPreview />
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="วิธีการทำงาน" title="จากมิเตอร์หน้างาน ถึงรายงานผู้บริหาร" />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-xl border bg-background p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-md bg-accent text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-muted-foreground tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="ความสามารถหลัก"
          title="ทุกข้อมูลสำคัญของโรงงาน ในที่เดียว"
          body="ติดตามพลังงาน น้ำ และคาร์บอน โดยแต่ละองค์กรมีพื้นที่ข้อมูล ผู้ใช้งาน และสิทธิ์ของตนเอง"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, href }) => (
            <Link key={title} href={href} className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/40">
              <Icon className="size-5 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                อ่านเพิ่มเติม <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
              </span>
            </Link>
          ))}
          <div className="flex gap-4 rounded-xl border bg-[#062e22] p-5 text-white">
            <Image src="/images/g-fay.gif" alt="G-FAY ผู้ช่วย AI ของ GreenFactory" width={88} height={88} unoptimized className="size-20 shrink-0 rounded-lg bg-white/5" />
            <div>
              <h3 className="font-semibold text-white">ผู้ช่วย AI “G-FAY”</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                ถามเป็นภาษาไทยได้ เช่น “เดือนนี้เครื่องไหนใช้ไฟมากผิดปกติ” G-FAY สรุปคำตอบจากข้อมูลที่บันทึกในโรงงานของคุณ
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="สำหรับใคร"
          title="แต่ละบทบาทเห็นเครื่องมือที่ตรงกับงานของตัวเอง"
          body="ลดความซับซ้อนของหน้าจอ และควบคุมการเข้าถึงข้อมูลภายในองค์กร"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ROLES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-background p-5">
              <Icon className="size-5 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" aria-hidden />
          ข้อมูลของแต่ละบริษัทแยกจากกัน และทุกการแก้ไขสำคัญถูกบันทึกไว้ตรวจสอบได้
        </p>
      </Section>

      <CtaBand />
    </>
  );
}

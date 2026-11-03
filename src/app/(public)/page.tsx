import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CtaBand, Section, SectionHeading } from "@/components/marketing/section";
import { PhoneShot, Shot } from "@/components/marketing/shot";
import { CodeBlock, INGEST_CURL, MeterList, Points } from "@/components/marketing/bits";

export const metadata: Metadata = {
  title: { absolute: "GreenFactory Insight ระบบข้อมูลพลังงานและคาร์บอนสำหรับโรงงาน" },
  description:
    "ผู้ปฏิบัติงานสแกน QR ที่เครื่องจักรแล้วบันทึกค่ามิเตอร์ไฟฟ้า น้ำ และเชื้อเพลิงจากมือถือ เซนเซอร์ส่งค่าเข้ามาเองผ่าน API ผู้จัดการเห็นพลังงาน คาร์บอน และค่าผิดปกติรายเครื่องทุกวัน",
  openGraph: {
    title: "GreenFactory Insight",
    description: "สแกน QR ที่มิเตอร์ แล้วเห็นพลังงานและคาร์บอนของทุกเครื่องจักร ทุกวัน",
  },
};

const STEPS = [
  { title: "สแกน QR ที่เครื่อง", body: "ป้าย QR ติดไว้ที่เครื่องจักรหรือจุดวัด สแกนแล้วระบบรู้ทันทีว่าเป็นมิเตอร์ตัวไหน อยู่อาคารไหน", shot: "qr", w: "w-[72%]" },
  { title: "กรอกค่าที่อ่านได้", body: "หน่วยถูกกำหนดตามประเภททรัพยากร แนบรูปหน้าปัดมิเตอร์ได้ เวลาเป็นเวลาไทย", shot: "record", w: "w-[70%]" },
  { title: "ระบบเทียบกับค่าเดิม", body: "ค่าใหม่ถูกเทียบกับประวัติของจุดเดียวกัน ถ้าสูงหรือต่ำผิดปกติ ผู้จัดการเห็นเป็นการแจ้งเตือน", shot: "alerts", w: "w-[86%]" },
  { title: "ออกรายงาน", body: "เลือกช่วงวันที่ แล้วดาวน์โหลดเป็น Excel, CSV หรือ PDF ไปใช้ต่อในรายงานขององค์กร", shot: "report", w: "w-[80%]" },
] as const;

const ROLES = [
  { who: "ผู้ปฏิบัติงาน", what: "สแกน QR บันทึกค่ามิเตอร์ และดูประวัติการบันทึกของตัวเอง บนมือถือ" },
  { who: "ผู้จัดการโรงงาน", what: "ดูภาพรวม คาร์บอน KPI และการแจ้งเตือน เฉพาะโรงงานที่ได้รับมอบหมาย แล้วออกรายงาน" },
  { who: "ผู้ดูแลบริษัท", what: "ตั้งค่าโรงงาน โครงสร้าง เครื่องจักร เซนเซอร์ QR และผู้ใช้ เทียบทุกโรงงานในบริษัท" },
];

const SECURITY = [
  "ข้อมูลของแต่ละบริษัทแยกจากกัน ผู้ใช้เห็นเฉพาะโรงงานที่ได้รับสิทธิ์",
  "การสร้าง แก้ไข และลบข้อมูลสำคัญถูกบันทึกใน Audit log ว่าใครทำ เมื่อไร ค่าก่อนและหลังเป็นอย่างไร",
  "ระงับบัญชีผู้ใช้แล้ว ทุกเซสชันที่เปิดค้างอยู่ถูกตัดออกทันที",
  "กรอกรหัสผ่านผิดหลายครั้ง บัญชีถูกล็อกชั่วคราว",
  "Token ของเซนเซอร์ออกแยกรายตัว แสดงครั้งเดียว และออกใหม่แทนตัวเดิมได้",
];

export default function HomePage() {
  return (
    <>
      {/* The one bold element: the control-room band, with the real product rising out of it. */}
      <section className="overflow-hidden bg-control-room text-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-12">
            <h1 className="text-[30px] leading-[1.2] font-semibold tracking-tight text-white sm:text-[46px]">
              <span className="block">สแกน QR ที่มิเตอร์</span>
              <span className="block">แล้วเห็นพลังงานและคาร์บอน</span>
              <span className="block">ของทุกเครื่องจักร</span>
            </h1>
            <div>
              <p className="text-base leading-relaxed text-white/75 sm:text-[17px]">
                ผู้ปฏิบัติงานบันทึกค่าไฟฟ้า น้ำ และเชื้อเพลิงจากมือถือที่หน้าเครื่อง เซนเซอร์ส่งค่าเข้ามาเอง
                ผู้จัดการเห็นยอดใช้ คาร์บอน และค่าที่ผิดปกติของแต่ละเครื่องในหน้าเดียว
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="h-11 bg-[#a3d92b] px-6 text-[15px] text-[#0c110e] hover:bg-[#b4e44a]">
                  <Link href="/contact">ขอเดโม</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 border-white/30 bg-transparent px-6 text-[15px] text-white hover:bg-white/10 hover:text-white dark:border-white/30 dark:bg-transparent">
                  <Link href="/login">เข้าสู่ระบบ</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="relative mt-10 h-[300px] sm:mt-14 sm:h-[420px] lg:h-[470px]">
            <div className="absolute top-0 left-0 w-[170%] overflow-hidden rounded-t-[14px] border border-b-0 border-white/15 sm:right-0 sm:left-[14%] sm:w-auto lg:left-[19%]">
              <Shot name="managerHome" priority sizes="(min-width: 1152px) 940px, (min-width: 640px) 86vw, 170vw" className="rounded-none border-0" />
            </div>
            <PhoneShot
              name="operatorHome"
              priority
              sizes="(min-width: 1024px) 236px, (min-width: 640px) 200px, 150px"
              className="absolute top-16 right-3 w-[150px] sm:top-10 sm:right-auto sm:left-0 sm:w-[200px] lg:w-[236px]"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="meters-title" className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_2.2fr] lg:gap-12">
          <div>
            <h2 id="meters-title" className="font-semibold">บันทึกได้ทุกมิเตอร์ที่โรงงานมี</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              คาร์บอนคำนวณจากปริมาณที่ใช้ × ค่า Emission Factor ที่ตั้งตามแหล่งอ้างอิง เช่น อบก. แยก Scope 1 และ 2
            </p>
          </div>
          <MeterList />
        </div>
      </section>

      <Section>
        <SectionHeading title="จากมิเตอร์หน้าเครื่อง ถึงรายงานผู้บริหาร" body="ไม่ต้องจดลงกระดาษแล้วมาพิมพ์ใส่ Excel ตอนเย็น ค่าที่บันทึกเข้าระบบทันทีและทุกคนเห็นชุดเดียวกัน" />
        <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <div className="relative h-60 overflow-hidden rounded-[10px] border bg-muted/70" aria-hidden>
                <Shot name={s.shot} sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 90vw" className={`absolute top-6 left-1/2 -translate-x-1/2 shadow-[0_8px_24px_rgb(6_46_34/0.10)] ${s.w}`} />
              </div>
              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-2xl leading-none font-semibold text-primary tabular-nums">{i + 1}</span>
                <h3 className="font-semibold">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section aria-labelledby="heatmap-title" className="overflow-hidden border-y bg-card py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[340px_1fr] lg:items-center lg:gap-14">
          <div>
            <SectionHeading id="heatmap-title" title="เห็นทุกเครื่อง ทุกวัน" body="แต่ละแถวคือเครื่องจักร แต่ละช่องคือหนึ่งวัน สีเข้มคือใช้ไฟมาก วันที่เครื่องหยุดหรือมิเตอร์ไม่ได้บันทึกเห็นได้ทันที โดยไม่ต้องไล่อ่านตาราง" />
            <Points className="mt-6" items={["เรียงจากเครื่องที่ใช้มากที่สุด", "กดที่วันเพื่อดูค่าที่บันทึกจริงของวันนั้น", "ช่องลายเฉียงคือวันที่ไม่มีข้อมูล"]} />
          </div>
          {/* On phones the matrix would be unreadable at screen width, so it scrolls sideways instead. */}
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:-mr-48 lg:overflow-visible" tabIndex={0} aria-label="ภาพตารางสีการใช้ไฟฟ้า เลื่อนดูด้านข้างได้">
            <Shot name="heatmap" sizes="(min-width: 1024px) 1000px, (min-width: 640px) 100vw, 760px" className="w-[760px] sm:w-auto" />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:gap-14">
          <div>
            <SectionHeading title="คาร์บอนที่ตอบได้ว่ามาจากไหน" body="ทุกค่าคาร์บอนคำนวณจากปริมาณที่บันทึกจริง คูณค่า Factor ที่มีผล ณ วันที่ของข้อมูล หน้าคาร์บอนแสดงสูตร ค่า Factor และแหล่งที่มาไว้ข้างตัวเลข" />
            <Points className="mt-6" items={["แยก Scope 1 การเผาไหม้เชื้อเพลิง และ Scope 2 ไฟฟ้าที่ซื้อ", "จัดอันดับเครื่องจักรที่ปล่อยมากที่สุด", "รายการที่ยังไม่มีค่า Factor ถูกแจ้งไว้ ไม่ถูกนับเงียบ ๆ"]} />
          </div>
          <Shot name="carbon" sizes="(min-width: 1024px) 660px, 100vw" />
        </div>
        <div className="mt-20 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-14">
          <Shot name="kpi" sizes="(min-width: 1024px) 660px, 100vw" className="lg:order-first" />
          <div className="order-first lg:order-none">
            <SectionHeading title="ตั้งเป้า แล้วดูว่าผ่านกี่งวด" body="กำหนด KPI เช่น ไฟฟ้ารวมต่อเดือน หรือไฟฟ้าของเตาอบหนึ่งเครื่องต่อวัน ระบบคำนวณผลทุกงวดและแสดง 12 งวดล่าสุดเป็นแถบ เห็นว่าพลาดเป้าครั้งเดียวหรือพลาดต่อเนื่อง" />
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-14">
          <SectionHeading title="หลายโรงงาน เทียบกันบนกราฟเดียว" />
          <p className="leading-relaxed text-muted-foreground sm:text-[17px]">
            ผู้ดูแลบริษัทเห็นไฟฟ้าต่อวัน คาร์บอน และความพร้อมของข้อมูลของทุกโรงงานในช่วงเวลาเดียวกัน
            เช่น เห็นว่าโรงงานระยองใช้ไฟต่อวันลดลงหลังปรับปรุงเครื่อง
          </p>
        </div>
        <Shot name="compare" sizes="(min-width: 1152px) 1104px, 100vw" className="mt-10" />
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.45fr] lg:gap-12">
          <div className="min-w-0">
            <SectionHeading title="มีเซนเซอร์ก็ส่งค่าเข้ามาเอง ไม่มีก็สแกน QR" body="ข้อมูลจากสองทางเข้าตารางเดียวกัน ใช้ในกราฟ คาร์บอน และ KPI ชุดเดียวกัน" />
            <h3 className="mt-10 font-semibold">เครื่องที่มีเซนเซอร์</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              ออก token ให้เซนเซอร์แต่ละตัว แล้วให้อุปกรณ์หรือเกตเวย์ส่งค่าเข้า API ส่งทีละค่าหรือหลายค่าพร้อมกันก็ได้ หน้าเซนเซอร์บอกว่าตัวไหนออนไลน์ ตัวไหนเงียบไป
            </p>
            <CodeBlock className="mt-4" code={INGEST_CURL} label="ตัวอย่างคำสั่งส่งค่าจากเซนเซอร์" />
            <h3 className="mt-10 font-semibold">มิเตอร์ที่ยังไม่มีเซนเซอร์</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              ติดป้าย QR ที่มิเตอร์ ผู้ปฏิบัติงานสแกนและกรอกค่าตามรอบ หน้าแรกของผู้ปฏิบัติงานบอกว่าวันนี้ยังเหลือจุดไหนที่ยังไม่ได้บันทึก
            </p>
          </div>
          <Shot name="sensors" sizes="(min-width: 1024px) 660px, 100vw" className="self-start lg:mt-2" />
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading title="แต่ละคนเห็นเฉพาะงานของตัวเอง" />
            <dl className="mt-8 divide-y border-y">
              {ROLES.map((r) => (
                <div key={r.who} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="font-semibold">{r.who}</dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">{r.what}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight sm:text-[32px]">ความปลอดภัยของข้อมูล</h2>
            <Points className="mt-8" items={SECURITY} />
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CtaBand, PageIntro } from "@/components/marketing/section";
import { PhoneShot, Shot } from "@/components/marketing/shot";
import { CodeBlock, INGEST_CURL, MeterList, Points } from "@/components/marketing/bits";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "โซลูชัน",
  description: "พลังงาน น้ำ คาร์บอน KPI การแจ้งเตือนความผิดปกติ การบันทึกด้วย QR Code เซนเซอร์ IoT รายงาน และการแบ่งสิทธิ์ ใน GreenFactory Insight",
  openGraph: { title: "โซลูชัน GreenFactory Insight", description: "บันทึกมิเตอร์ด้วย QR เห็นพลังงานและคาร์บอนรายเครื่อง ในระบบเดียว" },
};

const TOC = [
  ["energy", "พลังงานและน้ำ"], ["carbon", "คาร์บอน"], ["kpi", "KPI"], ["alerts", "การแจ้งเตือน"],
  ["qr", "QR Code"], ["sensors", "เซนเซอร์"], ["reports", "รายงาน"], ["security", "สิทธิ์และความปลอดภัย"],
] as const;

export default function FeaturesPage() {
  return (
    <>
      <PageIntro
        title="ทุกมิเตอร์ในโรงงาน อยู่ในระบบเดียว"
        body="ค่าที่ผู้ปฏิบัติงานบันทึกและค่าที่เซนเซอร์ส่งเข้ามา ถูกรวมเป็นภาพรวม คาร์บอน KPI และรายงาน ที่ผู้จัดการและผู้บริหารใช้ร่วมกัน"
      >
        <MeterList className="mt-8 max-w-4xl" />
      </PageIntro>
      <nav aria-label="หัวข้อในหน้านี้" className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur">
        <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="block rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Feature id="energy" title="เห็นการใช้ไฟฟ้า น้ำ และเชื้อเพลิง ลงถึงเครื่องจักร"
        body="ภาพรวมเปิดด้วยค่าหลักของช่วงที่เลือก เทียบกับช่วงก่อนหน้า ตามด้วยกราฟรายวันแยกเครื่องจักร และตารางสีเครื่อง × วัน ทุกตัวเลขกดลงไปดูค่าที่บันทึกจริงได้"
        points={["แยกตามโรงงาน อาคาร แผนก สายการผลิต และเครื่องจักร", "เทียบช่วงเวลา เช่น เดือนนี้กับเดือนก่อน", "บอกสัดส่วนข้อมูลที่มาจากการสแกน QR เทียบกับการกรอกเอง"]}
        media={<Shot name="managerHome" sizes="(min-width: 1024px) 600px, 100vw" />} />

      <Feature id="carbon" flip tone="surface" title="คาร์บอนที่ตรวจสอบย้อนกลับได้"
        body="ระบบคำนวณการปล่อยก๊าซเรือนกระจกจากปริมาณที่บันทึก และเก็บค่า Emission Factor ที่ใช้ไว้กับผลคำนวณทุกครั้ง จึงตอบได้ว่าตัวเลขมาจากไหน"
        points={["Scope 1 การเผาไหม้เชื้อเพลิงในโรงงาน", "Scope 2 ไฟฟ้าที่ซื้อจากภายนอก", "ค่า Factor ตั้งตามแหล่งอ้างอิง เช่น อบก. มีวันเริ่มและวันสิ้นสุด ระบบเลือกค่าที่มีผล ณ วันที่ของข้อมูล", "ค่าตัวอย่างในระบบเดโมยังไม่ผ่านการทวนสอบ ควรตรวจกับ อบก. ก่อนรายงานอย่างเป็นทางการ"]}
        media={
          <>
            <Shot name="carbon" sizes="(min-width: 1024px) 600px, 100vw" />
            <div className="mt-4 rounded-[10px] border bg-background px-4 py-3 text-sm">
              <p className="text-muted-foreground">ตัวอย่างการคำนวณ</p>
              <p className="mt-1 font-display text-base font-semibold tabular-nums">1,000 kWh × 0.4999 kgCO₂e/kWh = 499.9 kgCO₂e</p>
            </div>
          </>
        } />

      <Feature id="kpi" title="ตั้งเป้าหมาย แล้วดูผลทุกงวด"
        body="KPI ผูกกับทรัพยากรและขอบเขต เช่น ไฟฟ้ารวมของโรงงานต่อเดือน หรือไฟฟ้าของเตาอบหนึ่งเครื่องต่อวัน ระบบคำนวณผลเมื่อปิดงวดและเก็บประวัติไว้"
        points={["มาตรวัดความสำเร็จของงวดล่าสุด", "แถบผล 12 งวดล่าสุด เห็นว่าพลาดครั้งเดียวหรือพลาดต่อเนื่อง", "งวดที่ยังไม่ปิดแสดงค่าคาดการณ์ทั้งงวด"]}
        media={<Shot name="kpi" sizes="(min-width: 1024px) 600px, 100vw" />} />

      <Feature id="alerts" flip tone="surface" title="รู้เมื่อค่าที่บันทึกไม่เหมือนเดิม"
        body="ทุกครั้งที่มีค่าใหม่ ระบบเทียบกับประวัติของจุดวัดเดียวกัน (สูงสุด 30 ครั้งล่าสุด) ถ้าห่างจากปกติมากเกินไป จะสร้างการแจ้งเตือนให้ผู้จัดการตรวจสอบ"
        points={["ใช้ได้ทั้งค่าที่สูงผิดปกติและต่ำผิดปกติ", "ผู้จัดการรับทราบและปิดการแจ้งเตือนเมื่อแก้ไขแล้ว", "ถ้ามีประวัติน้อยกว่า 5 ครั้ง ใช้เกณฑ์ต่างจากค่าเฉลี่ย 60% เพื่อไม่ให้แจ้งถี่เกินไป"]}
        media={
          <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr] sm:items-start">
            <Shot name="alerts" sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw" />
            <div className="rounded-[10px] border bg-background p-4 text-sm leading-relaxed">
              <p className="font-semibold">เกณฑ์ที่ใช้</p>
              <p className="mt-2 text-muted-foreground">
                ค่าใหม่ถือว่าผิดปกติเมื่ออยู่นอกช่วงค่าเฉลี่ย ± 2 เท่าของส่วนเบี่ยงเบนมาตรฐาน และต่างจากค่าเฉลี่ยตั้งแต่ 30% ขึ้นไป
              </p>
            </div>
          </div>
        } />

      <Feature id="qr" title="บันทึกมิเตอร์หน้าเครื่องด้วย QR"
        body="พิมพ์ป้าย QR ลงกระดาษ A4 ติดที่เครื่องจักรหรือจุดวัด ผู้ปฏิบัติงานสแกนด้วยมือถือแล้วกรอกค่าได้ทันที ไม่ต้องจำรหัสหรือเลือกจากรายการยาว"
        points={["หน่วยถูกกำหนดตามประเภททรัพยากร ลดการกรอกผิดหน่วย", "แนบรูปหน้าปัดมิเตอร์เป็นหลักฐาน", "หน้าแรกบอกว่าวันนี้ยังเหลือจุดไหนที่ยังไม่บันทึก", "ระงับหรือเปลี่ยนป้าย QR ได้เมื่อสูญหาย"]}
        media={
          <div className="flex items-start justify-center gap-6 rounded-[10px] bg-muted/70 px-4 pt-8 sm:gap-10">
            <PhoneShot name="operatorHome" sizes="200px" className="-mb-24 w-[46%] max-w-[220px]" />
            <Shot name="qr" sizes="200px" className="mt-10 w-[40%] max-w-[200px]" />
          </div>
        } />

      <Feature id="sensors" flip tone="surface" title="เซนเซอร์ส่งค่าเข้ามาเองผ่าน API"
        body="ออก token ให้เซนเซอร์แต่ละตัว แล้วให้อุปกรณ์หรือเกตเวย์ส่งค่าเข้ามา หน้าเซนเซอร์คำนวณสถานะจากเวลาที่ส่งล่าสุด บอกว่าตัวไหนออนไลน์ ตัวไหนขาดการเชื่อมต่อ"
        points={["ส่งทีละค่า หรือหลายค่าพร้อมเวลาที่วัดได้", "token แสดงครั้งเดียว ออกใหม่แทนตัวเดิมได้ทันที", "ค่าจากเซนเซอร์ใช้ในกราฟ คาร์บอน และ KPI ชุดเดียวกับค่าที่บันทึกเอง"]}
        media={
          <>
            <Shot name="sensors" sizes="(min-width: 1024px) 600px, 100vw" />
            <CodeBlock className="mt-4" code={INGEST_CURL} label="ตัวอย่างคำสั่งส่งค่าจากเซนเซอร์" />
          </>
        } />

      <Feature id="reports" title="รายงานที่พร้อมส่งต่อ"
        body="สรุปการใช้ทรัพยากร คาร์บอน และ KPI ตามช่วงเวลาและโรงงานที่เลือก ทุกครั้งที่ดาวน์โหลด ระบบสร้างไฟล์ใหม่จากข้อมูลล่าสุด"
        points={["Excel (XLSX), CSV และ PDF", "ผู้ดูแลบริษัทเทียบทุกโรงงานในบริษัทบนกราฟเดียว", "ผู้ช่วย G-FAY ตอบคำถามภาษาไทยจากข้อมูลของโรงงาน เช่น เดือนนี้เครื่องไหนใช้ไฟผิดปกติ"]}
        media={<Shot name="compare" sizes="(min-width: 1024px) 600px, 100vw" />} />

      <Feature id="security" flip tone="surface" title="แต่ละคนเห็นเฉพาะข้อมูลที่เกี่ยวกับงานของตัวเอง"
        body="ระบบแยกข้อมูลของแต่ละบริษัทออกจากกัน และแบ่งสิทธิ์ตามบทบาท ผู้ดูแลบริษัท ผู้จัดการโรงงาน และผู้ปฏิบัติงาน"
        points={["เข้าสู่ระบบด้วยรหัสองค์กร อีเมล และรหัสผ่าน ล็อกชั่วคราวเมื่อกรอกผิดหลายครั้ง", "ผู้จัดการและผู้ปฏิบัติงานเห็นเฉพาะโรงงานที่ได้รับมอบหมาย", "ระงับบัญชีแล้ว ทุกเซสชันที่เปิดอยู่ถูกตัดทันที", "บันทึกประวัติการแก้ไขข้อมูลสำคัญ (Audit log)", "ไฟล์แนบเปิดได้เฉพาะผู้มีสิทธิ์"]} />

      <CtaBand title="ดูว่าใช้กับโรงงานของคุณได้อย่างไร" />
    </>
  );
}

function Feature({ id, title, body, points, tone, flip, media }: {
  id: string;
  title: string;
  body: string;
  points: string[];
  tone?: "surface";
  flip?: boolean;
  media?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-32 overflow-hidden py-16 sm:py-20", tone && "border-y bg-card")}>
      <div className={cn("mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:gap-14", media ? "lg:grid-cols-[1fr_1.25fr] lg:items-center" : "lg:grid-cols-2")}>
        <div className={cn(flip && media && "lg:order-last")}>
          <h2 id={`${id}-title`} className="font-display text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-[30px]">{title}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>
          {media && <Points className="mt-6" items={points} />}
        </div>
        {media ? <div className="min-w-0">{media}</div> : <Points items={points} />}
      </div>
    </section>
  );
}

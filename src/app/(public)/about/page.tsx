import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand, PageIntro, Section, SectionHeading } from "@/components/marketing/section";
import { PhoneShot } from "@/components/marketing/shot";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "GreenFactory Insight ระบบที่เกิดจากปัญหาข้อมูลกระจัดกระจายในโรงงาน พัฒนาที่มหาวิทยาลัยเทคโนโลยีสุรนารี",
  openGraph: { title: "เกี่ยวกับ GreenFactory Insight" },
};

const DIRECTION = [
  { label: "วิสัยทัศน์", body: "พัฒนาแพลตฟอร์มที่ช่วยให้องค์กรอุตสาหกรรมใช้ข้อมูลในการบริหารจัดการทรัพยากรและการดำเนินงานได้อย่างมีประสิทธิภาพ" },
  { label: "พันธกิจ", body: "เชื่อมโยงข้อมูลจากบุคลากร เครื่องจักร เซนเซอร์ และกระบวนการผลิตให้อยู่ในระบบเดียวที่เข้าใจง่ายและนำไปใช้ได้จริง" },
  { label: "เป้าหมาย", body: "ช่วยให้องค์กรเห็นข้อมูลที่สำคัญ ลดการทำงานที่ซ้ำซ้อน ลดต้นทุน และวางแผนบนพื้นฐานของข้อมูลที่เชื่อถือได้" },
];

const APPROACH = [
  { title: "รองรับโครงสร้างโรงงานจริง", body: "จัดเก็บข้อมูลตั้งแต่บริษัท โรงงาน อาคาร แผนก สายการผลิต เครื่องจักร ไปจนถึงเซนเซอร์" },
  { title: "ข้อมูลทุกชุดมีที่มา", body: "รวมข้อมูลจากการบันทึกของบุคลากร เครื่องจักร และระบบภายนอกไว้ในที่เดียว ตรวจสอบย้อนหลังได้" },
  { title: "แบ่งสิทธิ์ตามบทบาท", body: "ผู้ใช้แต่ละระดับเห็นและจัดการเฉพาะข้อมูลที่เกี่ยวข้องกับหน้าที่ของตนเอง" },
  { title: "พร้อมใช้ตัดสินใจ", body: "เปลี่ยนข้อมูลหน้างานเป็นแดชบอร์ด ตัวชี้วัด รายงาน และข้อเสนอแนะที่เข้าใจง่าย" },
];

const VALUES = [
  { title: "ตัวเลขต้องตอบได้ว่ามาจากไหน", body: "เราไม่แสดงตัวเลขที่ตรวจสอบย้อนกลับไม่ได้ และไม่ใส่ข้อมูลสมมติในหน้าจอที่ใช้งานจริง" },
  { title: "ง่ายสำหรับคนหน้างาน", body: "หน้าจอบันทึกออกแบบให้ใช้บนมือถือด้วยมือเดียว งานหนึ่งหน้าจอ ปุ่มกดง่ายบนจอสัมผัส" },
  { title: "ลดหน้าจอ ไม่เพิ่มหน้าจอ", body: "ระบบที่ดีควรทำให้ข้อมูลสำคัญเข้าใจง่าย ไม่บังคับให้ผู้ใช้เรียนรู้โครงสร้างที่ซับซ้อนเกินจำเป็น" },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="ระบบที่เกิดขึ้นจากปัญหาของข้อมูลในโรงงาน"
        body="GreenFactory Insight ช่วยโรงงานติดตามการใช้พลังงาน ทรัพยากร การปล่อยคาร์บอน และตัวชี้วัด จากค่ามิเตอร์ที่บันทึกจริง เพื่อใช้วางแผนและตัดสินใจได้ชัดเจนขึ้น"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <SectionHeading title="จากสมุดจดมิเตอร์และไฟล์ Excel สู่ข้อมูลชุดเดียว" />
            <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
              <p>ในโรงงานหนึ่งแห่งมีข้อมูลเกิดขึ้นตลอดเวลา ทั้งจากผู้ปฏิบัติงาน เครื่องจักร เซนเซอร์ และกระบวนการผลิต</p>
              <p>ปัญหาคือข้อมูลเหล่านี้มักถูกเก็บแยกกัน บางส่วนอยู่ในสมุดจด บางส่วนอยู่ในไฟล์ตาราง บางส่วนอยู่ในระบบของเครื่องจักร การสรุปยอดประจำเดือนจึงใช้เวลานาน และตอบยากว่าตัวเลขมาจากไหน</p>
              <p>เป้าหมายจึงไม่ใช่แค่แดชบอร์ด แต่คือระบบที่ทำให้ผู้ปฏิบัติงานบันทึกได้ง่ายที่หน้าเครื่อง ผู้จัดการเห็นปัญหาเร็วขึ้น และผู้บริหารมีข้อมูลเพียงพอสำหรับการตัดสินใจ</p>
            </div>
            <dl className="mt-10 divide-y border-y">
              {DIRECTION.map((d) => (
                <div key={d.label} className="grid gap-1 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                  <dt className="font-semibold">{d.label}</dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">{d.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex h-[420px] justify-center self-center overflow-hidden rounded-[14px] bg-control-room px-6 pt-10 sm:h-[460px]">
            <PhoneShot name="record" sizes="280px" className="w-full max-w-[280px]" />
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          title="ออกแบบจากการทำงานของโรงงานจริง"
          body="ให้ความสำคัญทั้งการใช้งาน โครงสร้างข้อมูล ความปลอดภัย และการขยายระบบในอนาคต"
        />
        <dl className="mt-10 grid gap-x-12 sm:grid-cols-2">
          {APPROACH.map(({ title, body }) => (
            <div key={title} className="border-t py-5">
              <dt className="font-semibold">{title}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <SectionHeading title="หลักการทำงานของเรา" />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="border-t-2 border-primary pt-4">
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">โครงการพัฒนาที่มหาวิทยาลัยเทคโนโลยีสุรนารี จังหวัดนครราชสีมา</p>
      </Section>

      <Section tone="surface">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <div className="relative flex h-[340px] items-end justify-center overflow-hidden rounded-[14px] bg-control-room sm:h-[400px]">
            <Image src="/images/team/founder-portrait.webp" alt="เบบี้มาย ผู้ก่อตั้ง GreenFactory Insight" width={900} height={1131} sizes="(min-width: 768px) 420px, 100vw" className="h-[88%] w-full object-cover object-top" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">ผู้ก่อตั้ง</p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">เบบี้มาย</h2>
            <div className="mt-5 max-w-xl space-y-4 leading-relaxed text-muted-foreground">
              <p>เบบี้มายเริ่ม GreenFactory Insight จากคำถามง่าย ๆ ว่า ทำไมค่ามิเตอร์ที่โรงงานจดทุกวัน ถึงต้องรอจนสิ้นเดือนกว่าจะรู้ว่าใช้ไฟไปเท่าไหร่ และปล่อยคาร์บอนไปเท่าไหร่</p>
              <p>คำตอบที่อยากได้คือระบบที่คนหน้างานใช้ได้จากมือถือในไม่กี่วินาที แล้วผู้จัดการเห็นตัวเลขชุดเดียวกันทันที ไม่ต้องพิมพ์ซ้ำ ไม่ต้องเดาว่าตัวเลขมาจากไหน</p>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand title="เปลี่ยนค่ามิเตอร์ของโรงงาน ให้พร้อมสำหรับการตัดสินใจ" />
    </>
  );
}

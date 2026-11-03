import type { Metadata } from "next";
import Image from "next/image";
import { Boxes, Layers, ListChecks, Users } from "lucide-react";
import { CtaBand, PageIntro, Section, SectionHeading } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "GreenFactory Insight ระบบที่เกิดจากปัญหาข้อมูลกระจัดกระจายในโรงงาน พัฒนาที่มหาวิทยาลัยเทคโนโลยีสุรนารี",
  openGraph: { title: "เกี่ยวกับ GreenFactory Insight", images: ["/images/hero-factory.jpg"] },
};

const DIRECTION = [
  { label: "วิสัยทัศน์", body: "พัฒนาแพลตฟอร์มที่ช่วยให้องค์กรอุตสาหกรรมใช้ข้อมูลในการบริหารจัดการทรัพยากรและการดำเนินงานได้อย่างมีประสิทธิภาพ" },
  { label: "พันธกิจ", body: "เชื่อมโยงข้อมูลจากบุคลากร เครื่องจักร เซนเซอร์ และกระบวนการผลิตให้อยู่ในระบบเดียวที่เข้าใจง่ายและนำไปใช้ได้จริง" },
  { label: "เป้าหมาย", body: "ช่วยให้องค์กรเห็นข้อมูลที่สำคัญ ลดการทำงานที่ซ้ำซ้อน ลดต้นทุน และวางแผนบนพื้นฐานของข้อมูลที่เชื่อถือได้" },
];

const APPROACH = [
  { icon: Layers, title: "รองรับโครงสร้างโรงงานจริง", body: "จัดเก็บข้อมูลตั้งแต่บริษัท โรงงาน อาคาร แผนก สายการผลิต เครื่องจักร ไปจนถึงเซนเซอร์" },
  { icon: Boxes, title: "ข้อมูลทุกชุดมีที่มา", body: "รวมข้อมูลจากการบันทึกของบุคลากร เครื่องจักร และระบบภายนอกไว้ในที่เดียว ตรวจสอบย้อนหลังได้" },
  { icon: Users, title: "แบ่งสิทธิ์ตามบทบาท", body: "ผู้ใช้แต่ละระดับเห็นและจัดการเฉพาะข้อมูลที่เกี่ยวข้องกับหน้าที่ของตนเอง" },
  { icon: ListChecks, title: "พร้อมใช้ตัดสินใจ", body: "เปลี่ยนข้อมูลหน้างานเป็นแดชบอร์ด ตัวชี้วัด รายงาน และข้อเสนอแนะที่เข้าใจง่าย" },
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
        eyebrow="เกี่ยวกับเรา"
        title="ระบบที่เกิดขึ้นจากปัญหาของข้อมูลในโรงงาน"
        body="GreenFactory Insight เป็นแพลตฟอร์มบริหารจัดการข้อมูลสำหรับองค์กรอุตสาหกรรม ช่วยติดตามการใช้พลังงาน ทรัพยากร การปล่อยคาร์บอน และตัวชี้วัด เพื่อใช้วางแผนและตัดสินใจได้ชัดเจนขึ้น"
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="ทำไมต้องมีระบบนี้" title="จากข้อมูลที่กระจัดกระจาย สู่ภาพรวมที่เข้าใจได้" />
            <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
              <p>ในโรงงานหนึ่งแห่งมีข้อมูลเกิดขึ้นตลอดเวลา ทั้งจากบุคลากร เครื่องจักร เซนเซอร์ การใช้ทรัพยากร และกระบวนการผลิต</p>
              <p>ปัญหาคือข้อมูลเหล่านี้มักถูกเก็บแยกกัน บางส่วนอยู่ในเอกสาร บางส่วนอยู่ในไฟล์ตาราง และบางส่วนอยู่ในระบบของเครื่องจักร ทำให้การตรวจสอบและสรุปผลใช้เวลานาน</p>
              <p>เป้าหมายจึงไม่ใช่แค่การสร้างแดชบอร์ด แต่คือระบบที่ช่วยให้ผู้ปฏิบัติงานทำงานง่ายขึ้น ผู้จัดการเห็นปัญหาเร็วขึ้น และผู้บริหารมีข้อมูลเพียงพอสำหรับการตัดสินใจ</p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border">
            <Image src="/images/hero-factory.jpg" alt="สายการผลิตภายในโรงงานอุตสาหกรรม" fill sizes="(min-width: 1024px) 540px, 100vw" className="object-cover" />
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="ทิศทาง" title="วิสัยทัศน์ พันธกิจ และเป้าหมาย" />
        <dl className="mt-10 grid gap-4 md:grid-cols-3">
          {DIRECTION.map((d, i) => (
            <div key={d.label} className="rounded-xl border bg-background p-5">
              <dt className="flex items-baseline gap-3 font-semibold">
                <span className="text-sm text-muted-foreground tabular-nums">0{i + 1}</span>
                {d.label}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="แนวทาง"
          title="ออกแบบจากกระบวนการทำงานขององค์กรจริง"
          body="ให้ความสำคัญทั้งการใช้งาน โครงสร้างข้อมูล ความปลอดภัย และการขยายระบบในอนาคต"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {APPROACH.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 rounded-xl border bg-card p-5">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="สิ่งที่ทีมยึดถือ" title="หลักการทำงานของเรา" />
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

      <CtaBand title="เปลี่ยนข้อมูลของโรงงาน ให้พร้อมสำหรับการตัดสินใจ" />
    </>
  );
}

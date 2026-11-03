import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BellRing, Check, Droplets, FileBarChart, Leaf, QrCode, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import { CtaBand, PageIntro } from "@/components/marketing/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "โซลูชัน",
  description: "พลังงาน น้ำ คาร์บอน การแจ้งเตือนความผิดปกติ การบันทึกด้วย QR Code รายงาน และการแบ่งสิทธิ์ ใน GreenFactory Insight",
  openGraph: { title: "โซลูชัน · GreenFactory Insight", description: "ทุกข้อมูลสำคัญของโรงงานในแพลตฟอร์มเดียว" },
};

const TOC = [
  ["energy", "พลังงาน"], ["water", "น้ำ"], ["carbon", "คาร์บอน"], ["alerts", "การแจ้งเตือน"],
  ["qr", "QR Code"], ["reports", "รายงาน"], ["security", "ความปลอดภัย"],
] as const;

export default function FeaturesPage() {
  return (
    <>
      <PageIntro
        eyebrow="โซลูชัน"
        title="ทุกข้อมูลสำคัญของโรงงาน ในแพลตฟอร์มเดียว"
        body="ติดตามพลังงาน น้ำ และคาร์บอนจากข้อมูลหน้างาน เพื่อให้ผู้ปฏิบัติงานและผู้บริหารมองเห็นข้อมูลชุดเดียวกัน"
      />
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

      <Feature id="energy" icon={Zap} eyebrow="พลังงาน" title="มองเห็นการใช้พลังงาน ก่อนต้นทุนจะเพิ่มขึ้น"
        body="ติดตามการใช้ไฟฟ้าและเชื้อเพลิงของโรงงาน อาคาร แผนก สายการผลิต และเครื่องจักร ข้อมูลมาจากการบันทึกของผู้ปฏิบัติงานหรือเซนเซอร์ แล้วสรุปเป็นภาพรวมสำหรับผู้บริหาร"
        points={["แนวโน้มรายวัน รายเดือน และเปรียบเทียบช่วงเวลา", "จัดอันดับเครื่องจักรหรือจุดวัดที่ใช้มากที่สุด", "ตั้ง KPI และติดตามผลเทียบเป้าหมาย", "ทุกตัวเลขย้อนดูค่าที่บันทึกจริงได้"]} />

      <Feature id="water" icon={Droplets} tone="surface" eyebrow="น้ำ" title="บริหารน้ำให้สัมพันธ์กับการผลิต"
        body="เห็นปริมาณการใช้น้ำในแต่ละอาคารและหน่วยงาน เพื่อค้นหาจุดที่ใช้สูงกว่าปกติ ข้อมูลน้ำเชื่อมกับหน่วยงาน สายการผลิต เครื่องจักร และผู้บันทึกได้"
        points={["บันทึกมิเตอร์น้ำแยกตามจุดวัด หน่วยเป็น m³", "เปรียบเทียบระหว่างอาคารหรือช่วงเวลา", "แจ้งเตือนเมื่อการใช้น้ำสูงผิดปกติ"]} />

      <Feature id="carbon" icon={Leaf} eyebrow="คาร์บอน" title="ติดตามคาร์บอน จากข้อมูลที่ตรวจสอบย้อนกลับได้"
        body="ระบบคำนวณการปล่อยก๊าซเรือนกระจกจากข้อมูลการใช้ทรัพยากรที่บันทึกไว้ และเก็บค่า Emission Factor ที่ใช้จริงไว้กับผลคำนวณทุกครั้ง จึงตอบได้ว่าตัวเลขมาจากไหน"
        points={["Scope 1 การเผาไหม้เชื้อเพลิงในโรงงาน", "Scope 2 ไฟฟ้าที่ซื้อจากภายนอก", "Scope 3 รายการอื่นตามที่ตั้งค่า Factor ไว้", "ค่า Factor อ้างอิงแหล่ง เช่น อบก. (TGO) มีวันเริ่มและวันสิ้นสุด ระบบเลือกค่าที่มีผล ณ วันที่ของข้อมูล"]}>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">สูตรที่ใช้</p>
          <p className="mt-3 text-lg font-semibold sm:text-xl">
            ข้อมูลกิจกรรม <span className="text-muted-foreground">×</span> Emission Factor <span className="text-muted-foreground">=</span> คาร์บอน
          </p>
          <div className="mt-4 rounded-lg bg-muted px-4 py-3 font-mono text-sm tabular-nums">
            1,000 kWh × 0.4999 kgCO₂e/kWh = 499.9 kgCO₂e
          </div>
          <p className="mt-3 text-xs text-muted-foreground">ตัวอย่างการคำนวณ ค่า Factor จริงขึ้นกับปีและแหล่งอ้างอิงที่ตั้งค่าไว้ในระบบ</p>
        </div>
      </Feature>

      <Feature id="alerts" icon={BellRing} tone="surface" eyebrow="การแจ้งเตือนความผิดปกติ" title="รู้ทันทีเมื่อค่าที่บันทึกไม่เหมือนเดิม"
        body="ทุกครั้งที่มีการบันทึก ระบบเทียบค่าใหม่กับประวัติของจุดวัดเดียวกัน (สูงสุด 30 ครั้งล่าสุด) ถ้าค่าห่างจากปกติมากเกินไป จะสร้างการแจ้งเตือนให้ผู้จัดการตรวจสอบ"
        points={["ระดับความรุนแรง ปานกลาง / สูง / วิกฤต ตามขนาดของความต่าง", "ผู้จัดการกดรับทราบและปิดการแจ้งเตือนเมื่อแก้ไขแล้ว", "ใช้ได้ทั้งค่าที่สูงผิดปกติและต่ำผิดปกติ"]}>
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">อธิบายแบบง่าย</p>
          <ol className="mt-3 space-y-3 text-sm leading-relaxed">
            <li><span className="font-semibold">μ (ค่าเฉลี่ย)</span> ของค่าที่ผ่านมา คือระดับ “ปกติ” ของจุดนี้</li>
            <li><span className="font-semibold">σ (ส่วนเบี่ยงเบนมาตรฐาน)</span> บอกว่าปกติแล้วค่าแกว่งขึ้นลงแค่ไหน</li>
            <li>
              <span className="font-semibold">z-score</span> = (ค่าใหม่ − μ) ÷ σ ถ้าค่าใหม่อยู่นอกช่วง <span className="font-mono">μ ± 2σ</span> และต่างจากค่าเฉลี่ยตั้งแต่ 30% ขึ้นไป ถือว่าผิดปกติ
            </li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">ถ้ามีประวัติน้อยกว่า 5 ครั้ง ระบบใช้เกณฑ์ต่างจากค่าเฉลี่ย 60% แทน เพื่อไม่ให้แจ้งเตือนถี่เกินไป</p>
        </div>
      </Feature>

      <Feature id="qr" icon={QrCode} eyebrow="บันทึกหน้างานด้วย QR Code" title="บันทึกมิเตอร์ได้ในไม่กี่วินาที"
        body="ติด QR Code ไว้ที่เครื่องจักรหรือจุดวัด ผู้ปฏิบัติงานสแกนด้วยมือถือแล้วกรอกค่าได้ทันที ไม่ต้องจำรหัสหรือเลือกจากรายการยาว ๆ"
        points={["หน่วยถูกล็อกตามจุดวัด ลดการกรอกผิดหน่วย", "แนบรูปถ่ายมิเตอร์เป็นหลักฐาน", "พิมพ์ QR เป็นแผ่น A4 ระงับหรือเปลี่ยน QR ได้เมื่อสูญหาย", "ทุกการสแกนถูกบันทึกไว้"]} />

      <Feature id="reports" icon={FileBarChart} tone="surface" eyebrow="รายงานและการส่งออก" title="รายงานที่พร้อมส่งต่อ"
        body="สรุปการใช้ทรัพยากร คาร์บอน และ KPI ตามช่วงเวลาและโรงงานที่เลือก แล้วส่งออกไปใช้ต่อในงานรายงานขององค์กร"
        points={["ส่งออกเป็น Excel (XLSX), CSV และ PDF", "กรองตามช่วงวันที่ โรงงาน และประเภททรัพยากร", "ผู้ปฏิบัติงานดาวน์โหลดประวัติการบันทึกของตัวเองได้"]} />

      <Feature id="security" icon={ShieldCheck} eyebrow="ความปลอดภัยและสิทธิ์" title="แต่ละคนเห็นเฉพาะข้อมูลที่เกี่ยวกับงานของตัวเอง"
        body="ระบบแยกข้อมูลของแต่ละบริษัทออกจากกัน และแบ่งสิทธิ์ตามบทบาท ผู้ดูแลบริษัท ผู้จัดการโรงงาน และผู้ปฏิบัติงาน"
        points={["เข้าสู่ระบบด้วยรหัสองค์กร อีเมล และรหัสผ่าน ล็อกชั่วคราวเมื่อกรอกผิดหลายครั้ง", "ผู้จัดการและผู้ปฏิบัติงานเห็นเฉพาะโรงงานที่ได้รับมอบหมาย", "บันทึกประวัติการแก้ไขข้อมูลสำคัญ (Audit log)", "ไฟล์แนบเปิดดูได้เฉพาะผู้มีสิทธิ์"]} />

      <CtaBand title="อยากดูว่าใช้กับโรงงานของคุณได้อย่างไร" />
    </>
  );
}

function Feature({ id, icon: Icon, eyebrow, title, body, points, tone, children }: {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  tone?: "surface";
  children?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-32 py-16 sm:py-20", tone && "border-y bg-card")}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Icon className="size-4" aria-hidden /> {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>
        </div>
        <div className="space-y-6">
          <ul className="space-y-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          {children}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
<<<<<<< HEAD
  Building2,
  Factory,
  Gauge,
  Leaf,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
  Zap,
} from "lucide-react";

const platformFeatures = [
  {
    icon: Zap,
    title: "การใช้พลังงาน",
    description:
      "ติดตามและวิเคราะห์การใช้ไฟฟ้าและพลังงานของแต่ละโรงงาน อาคาร และสายการผลิต",
  },
  {
    icon: Waves,
    title: "ทรัพยากรและน้ำ",
    description:
      "รวบรวมข้อมูลการใช้ทรัพยากรจากหน้างาน เพื่อให้ตรวจสอบและเปรียบเทียบได้ง่าย",
  },
  {
    icon: Leaf,
    title: "คาร์บอนและสิ่งแวดล้อม",
    description:
      "คำนวณและสรุปข้อมูลการปล่อยคาร์บอนจากกิจกรรมที่เกิดขึ้นภายในองค์กร",
  },
  {
    icon: BarChart3,
    title: "KPI และรายงาน",
    description:
      "แสดงตัวชี้วัดสำคัญ พร้อมสร้างรายงานสำหรับติดตามผลและใช้ประกอบการตัดสินใจ",
  },
  {
    icon: QrCode,
    title: "เครื่องจักรและ QR Code",
    description:
      "เข้าถึงข้อมูลเครื่องจักรและบันทึกข้อมูลหน้างานได้รวดเร็วผ่าน QR Code",
  },
  {
    icon: Sparkles,
    title: "คำแนะนำจาก AI",
    description:
      "วิเคราะห์ข้อมูลเพื่อค้นหาความผิดปกติและเสนอแนวทางปรับปรุงการดำเนินงาน",
  },
];

=======
  Factory,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
const principles = [
  {
    number: "01",
    eyebrow: "Vision",
    title: "วิสัยทัศน์",
    description:
<<<<<<< HEAD
      "พัฒนาแพลตฟอร์มที่ช่วยให้องค์กรอุตสาหกรรมสามารถใช้ข้อมูลในการบริหารจัดการทรัพยากรและการดำเนินงานได้อย่างมีประสิทธิภาพ",
=======
      "เป็นแพลตฟอร์มที่ช่วยให้องค์กรอุตสาหกรรมใช้ข้อมูลเพื่อขับเคลื่อนการดำเนินงานอย่างมีประสิทธิภาพและยั่งยืน",
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
  },
  {
    number: "02",
    eyebrow: "Mission",
    title: "พันธกิจ",
    description:
<<<<<<< HEAD
      "เชื่อมโยงข้อมูลจากบุคลากร เครื่องจักร เซนเซอร์ และกระบวนการผลิตให้อยู่ในระบบเดียวที่เข้าใจง่ายและนำไปใช้ได้จริง",
  },
  {
    number: "03",
    eyebrow: "Goal",
    title: "เป้าหมาย",
    description:
      "ช่วยให้องค์กรเห็นข้อมูลที่สำคัญ ลดการทำงานที่ซ้ำซ้อน ลดต้นทุน และวางแผนการดำเนินงานบนพื้นฐานของข้อมูลที่เชื่อถือได้",
  },
];

const userGroups = [
  {
    icon: Building2,
    title: "ผู้ดูแลบริษัท",
    description:
      "จัดการข้อมูลบริษัท โรงงาน ผู้ใช้งาน สิทธิ์การเข้าถึง และข้อมูลพื้นฐานของระบบ",
  },
  {
    icon: Factory,
    title: "ผู้จัดการโรงงาน",
    description:
      "ติดตามผลการดำเนินงาน KPI การใช้ทรัพยากร การแจ้งเตือน และข้อมูลภาพรวมของโรงงาน",
  },
  {
    icon: Users,
    title: "ผู้ปฏิบัติงาน",
    description:
      "บันทึกข้อมูลจากหน้างาน ตรวจสอบเครื่องจักร และเข้าถึงงานที่เกี่ยวข้องกับตนเอง",
=======
      "เชื่อมโยงข้อมูลจากบุคลากร เครื่องจักร และกระบวนการผลิต ให้อยู่ในระบบที่เข้าใจง่ายและนำไปใช้ได้จริง",
  },
  {
    number: "03",
    eyebrow: "Purpose",
    title: "เป้าหมาย",
    description:
      "ช่วยให้องค์กรเห็นโอกาสในการลดต้นทุน ลดผลกระทบต่อสิ่งแวดล้อม และเติบโตบนพื้นฐานของข้อมูลที่เชื่อถือได้",
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
  },
];

const strengths = [
  {
    icon: Factory,
<<<<<<< HEAD
    title: "รองรับโครงสร้างโรงงานจริง",
    description:
      "ระบบจัดเก็บข้อมูลตั้งแต่บริษัท โรงงาน อาคาร แผนก สายการผลิต เครื่องจักร ไปจนถึงเซนเซอร์",
  },
  {
    icon: Gauge,
    title: "ติดตามข้อมูลได้เป็นระบบ",
    description:
      "รวมข้อมูลจากการบันทึกด้วยบุคลากร เครื่องจักร และระบบภายนอกไว้ในพื้นที่เดียว",
  },
  {
    icon: ShieldCheck,
    title: "แบ่งสิทธิ์ตามบทบาท",
    description:
      "ผู้ใช้งานแต่ละระดับเห็นและจัดการเฉพาะข้อมูลที่เกี่ยวข้องกับหน้าที่ของตนเอง",
  },
  {
    icon: BarChart3,
    title: "พร้อมใช้ประกอบการตัดสินใจ",
    description:
      "เปลี่ยนข้อมูลจากหน้างานให้เป็น Dashboard ตัวชี้วัด รายงาน และข้อเสนอแนะที่เข้าใจง่าย",
=======
    title: "เข้าใจบริบทของโรงงาน",
    description:
      "โครงสร้างระบบรองรับหน่วยงาน สายการผลิต เครื่องจักร และข้อมูลจากหน้างาน",
  },
  {
    icon: BarChart3,
    title: "เห็นภาพรวมในที่เดียว",
    description:
      "รวมข้อมูลด้านพลังงาน ทรัพยากร ของเสีย และคาร์บอน เพื่อให้ติดตามได้ง่ายขึ้น",
  },
  {
    icon: ShieldCheck,
    title: "ข้อมูลเป็นระบบและปลอดภัย",
    description:
      "กำหนดสิทธิ์การเข้าถึงตามบทบาท พร้อมบันทึกการทำงานที่ตรวจสอบย้อนหลังได้",
  },
  {
    icon: Sparkles,
    title: "พร้อมเติบโตไปกับองค์กร",
    description:
      "รองรับการเพิ่มหน่วยงาน ผู้ใช้งาน เครื่องจักร และข้อมูลที่มากขึ้นในอนาคต",
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
  },
];

export const metadata = {
<<<<<<< HEAD
  title: "เกี่ยวกับเรา | GreenFactory Insight",
  description:
    "รู้จัก GreenFactory Insight แพลตฟอร์มบริหารจัดการข้อมูลสำหรับองค์กรอุตสาหกรรม",
=======
  title: "เกี่ยวกับเรา",
  description:
    "รู้จัก GreenFactory Insight แพลตฟอร์มข้อมูลความยั่งยืนสำหรับองค์กรอุตสาหกรรม",
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
};

export default function AboutPage() {
  return (
<<<<<<< HEAD
    <main className="overflow-hidden bg-[#f7f8f4] text-[#1d2d23]">
      {/* HERO */}
      <section className="relative min-h-[620px] overflow-hidden lg:min-h-[680px]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-factory.jpg"
            alt="โรงงานอุตสาหกรรมสมัยใหม่"
=======
    <main className="overflow-hidden bg-[#f7f8f4]">
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-factory.jpg"
            alt="โรงงานอุตสาหกรรมสมัยใหม่ท่ามกลางพื้นที่สีเขียว"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-[68%_center]"
          />
        </div>

<<<<<<< HEAD
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,248,244,0.99)_0%,rgba(247,248,244,0.96)_38%,rgba(247,248,244,0.72)_58%,rgba(247,248,244,0.16)_82%,rgba(15,30,20,0.08)_100%)]" />

        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f7f8f4] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1380px] items-center px-5 pb-20 pt-32 sm:px-8 lg:min-h-[680px] lg:px-12 lg:pb-24 lg:pt-36 xl:px-16">
          <div className="max-w-[650px]">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.23em] text-[#477257]">
              <span className="h-px w-8 bg-[#477257]" />
              About GreenFactory Insight
            </div>

            <h1 className="mt-6 max-w-[620px] text-[clamp(2.7rem,5vw,4.8rem)] font-medium leading-[1.07] tracking-[-0.045em] text-[#17251d]">
              เกี่ยวกับ
              <span className="block text-[#477257]">
                GreenFactory Insight
              </span>
            </h1>

            <p className="mt-7 max-w-[590px] text-[15px] font-light leading-8 text-[#526158] sm:text-[17px] sm:leading-9">
              แพลตฟอร์มบริหารจัดการข้อมูลสำหรับองค์กรอุตสาหกรรม
              ที่ออกแบบมาเพื่อรวบรวมข้อมูลจากบุคลากร เครื่องจักร
              และกระบวนการผลิตให้อยู่ในระบบเดียว
            </p>

            <p className="mt-4 max-w-[555px] text-[14px] font-light leading-7 text-[#748078]">
              ช่วยให้องค์กรติดตามการใช้พลังงาน ทรัพยากร ของเสีย
              การปล่อยคาร์บอน ตัวชี้วัด และประสิทธิภาพของโรงงาน
              เพื่อใช้ประกอบการวางแผนและตัดสินใจได้อย่างชัดเจนยิ่งขึ้น
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/features"
                className="group inline-flex min-h-[50px] items-center justify-center gap-3 rounded-full bg-[#386849] px-7 py-3 text-[13px] font-medium text-white shadow-[0_14px_30px_rgba(39,89,57,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2f5c3f]"
              >
                ดูความสามารถของระบบ
=======
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,248,244,0.99)_0%,rgba(247,248,244,0.97)_32%,rgba(247,248,244,0.74)_52%,rgba(247,248,244,0.12)_76%,rgba(15,30,20,0.06)_100%)]" />

        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/75 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-[#102017]/50 via-[#102017]/8 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] items-center px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pb-28 lg:pt-36 xl:px-16">
          <div className="max-w-[640px]">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#477257]">
              <span className="h-px w-9 bg-[#477257]" />
              About GreenFactory Insight
            </div>

            <h1 className="mt-7 max-w-[630px] text-[clamp(3rem,6.2vw,6.3rem)] font-medium leading-[1.02] tracking-[-0.055em] text-[#17251d]">
              เทคโนโลยีที่ช่วยให้
              <span className="block text-[#4a7659]">
                องค์กรเติบโตอย่างยั่งยืน
              </span>
            </h1>

            <p className="mt-8 max-w-[540px] text-[15px] font-light leading-8 text-[#5f6c64] sm:text-[16px] sm:leading-9">
              GreenFactory Insight คือแพลตฟอร์มสำหรับองค์กรอุตสาหกรรม
              ที่ช่วยรวบรวม ติดตาม และวิเคราะห์ข้อมูลด้านพลังงาน
              ทรัพยากร ของเสีย และการปล่อยคาร์บอนในระบบเดียว
            </p>

            <p className="mt-4 max-w-[515px] text-[14px] font-light leading-7 text-[#778179]">
              เราช่วยเปลี่ยนข้อมูลที่กระจัดกระจายจากหน้างาน
              ให้กลายเป็นข้อมูลที่ชัดเจนสำหรับการบริหารจัดการ
              และการตัดสินใจในทุกระดับขององค์กร
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/features"
                className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#386849] px-7 py-3.5 text-[13px] font-medium text-white shadow-[0_16px_34px_rgba(39,89,57,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2f5c3f]"
              >
                สำรวจแพลตฟอร์ม
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/contact"
<<<<<<< HEAD
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[#263d2d]/15 bg-white/65 px-7 py-3 text-[13px] font-medium text-[#2d3d32] backdrop-blur-xl transition duration-300 hover:border-[#477257]/35 hover:bg-white hover:text-[#386849]"
=======
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#263d2d]/15 bg-white/60 px-7 py-3.5 text-[13px] font-medium text-[#2d3d32] backdrop-blur-xl transition duration-300 hover:border-[#477257]/35 hover:bg-white hover:text-[#386849]"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>
<<<<<<< HEAD
      </section>

      {/* WHO WE ARE */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#4b7759]">
              Who we are
            </p>

            <h2 className="mt-5 max-w-[470px] text-[clamp(2rem,3.4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.04em] text-[#1e2e24]">
              ระบบที่เกิดขึ้นจาก
              <span className="block text-[#4a7659]">
                ปัญหาของข้อมูลในโรงงาน
=======

        <div className="absolute bottom-8 right-8 z-20 hidden max-w-[300px] border-l border-white/35 pl-6 text-white xl:block">
          <Leaf className="h-5 w-5 text-white/75" strokeWidth={1.5} />

          <p className="mt-4 text-[13px] font-light leading-7 text-white/85">
            ข้อมูลที่ถูกต้อง
            <span className="block text-white/60">
              คือจุดเริ่มต้นของการเปลี่ยนแปลงที่ยั่งยืน
            </span>
          </p>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4b7759]">
              Who we are
            </p>

            <h2 className="mt-5 max-w-[440px] text-[clamp(2.4rem,4vw,4.4rem)] font-medium leading-[1.08] tracking-[-0.045em] text-[#1e2e24]">
              เราสร้างระบบ
              <span className="block text-[#4a7659]">
                ที่ทำให้ข้อมูลมีความหมาย
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
              </span>
            </h2>
          </div>

<<<<<<< HEAD
          <div className="lg:pt-8">
            <p className="max-w-[720px] text-[18px] font-light leading-9 tracking-[-0.012em] text-[#334239] sm:text-[20px]">
              ในโรงงานหนึ่งแห่งมีข้อมูลเกิดขึ้นตลอดเวลา
              ทั้งจากการทำงานของบุคลากร เครื่องจักร เซนเซอร์
              การใช้ทรัพยากร และกระบวนการผลิต
            </p>

            <div className="mt-8 grid gap-6 border-t border-[#263c2d]/10 pt-7 sm:grid-cols-2">
              <p className="text-[14px] font-light leading-7 text-[#707c74]">
                ปัญหาคือข้อมูลเหล่านี้มักถูกจัดเก็บแยกกัน
                บางส่วนอยู่ในเอกสาร บางส่วนอยู่ในไฟล์ตาราง
                และบางส่วนอยู่ในระบบของเครื่องจักร
                ทำให้การตรวจสอบและสรุปผลใช้เวลานาน
              </p>

              <p className="text-[14px] font-light leading-7 text-[#707c74]">
                GreenFactory Insight
                จึงถูกออกแบบให้เป็นศูนย์กลางสำหรับรวบรวมข้อมูล
                ประมวลผล และนำเสนอข้อมูลที่เหมาะสมกับผู้ใช้งานแต่ละระดับ
                ภายในองค์กร
=======
          <div className="lg:pt-10">
            <p className="max-w-[700px] text-[19px] font-light leading-9 tracking-[-0.015em] text-[#334239] sm:text-[22px] sm:leading-10">
              โรงงานในปัจจุบันมีข้อมูลเกิดขึ้นในทุกขั้นตอน
              แต่ข้อมูลเหล่านั้นจะมีคุณค่าได้ก็ต่อเมื่อองค์กรสามารถมองเห็น
              เข้าใจ และนำไปใช้ได้อย่างถูกต้อง
            </p>

            <div className="mt-9 grid gap-6 border-t border-[#263c2d]/10 pt-8 sm:grid-cols-2">
              <p className="text-[14px] font-light leading-7 text-[#747f77]">
                เราจึงออกแบบ GreenFactory Insight
                ให้เชื่อมโยงข้อมูลจากบุคลากร เครื่องจักร เซนเซอร์
                และกระบวนการภายในองค์กรเข้าด้วยกัน
              </p>

              <p className="text-[14px] font-light leading-7 text-[#747f77]">
                เพื่อช่วยให้ผู้ปฏิบัติงาน ผู้ดูแลระบบ
                และผู้บริหารเห็นข้อมูลที่เหมาะสมกับบทบาทของตนเอง
                โดยไม่ต้องทำงานกับข้อมูลที่ซ้ำซ้อน
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
              </p>
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* OUR STORY */}
      <section className="border-y border-[#213728]/[0.07] bg-[#edf1eb] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-20">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#dfe7df]">
              <Image
                src="/images/hero-factory.jpg"
                alt="กระบวนการทำงานภายในโรงงาน"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-[#1d3b28]/10" />

              <div className="absolute bottom-5 left-5 right-5 rounded-[18px] border border-white/25 bg-[#14281d]/80 p-5 text-white backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  Our purpose
                </p>

                <p className="mt-2 max-w-[420px] text-[14px] font-light leading-7 text-white/85">
                  ทำให้ข้อมูลจากทุกส่วนของโรงงานสามารถนำมาใช้งานร่วมกันได้อย่างเป็นระบบ
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#4b7759]">
                Our story
              </p>

              <h2 className="mt-5 max-w-[570px] text-[clamp(2rem,3.4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.04em] text-[#1e2e24]">
                จากข้อมูลที่กระจัดกระจาย
                <span className="block text-[#4a7659]">
                  สู่ภาพรวมที่เข้าใจได้
                </span>
              </h2>

              <div className="mt-7 space-y-5 text-[14px] font-light leading-8 text-[#66736b]">
                <p>
                  แนวคิดของ GreenFactory Insight
                  เริ่มต้นจากการมองเห็นปัญหาที่เกิดขึ้นจริงในองค์กรอุตสาหกรรม
                  ซึ่งมีข้อมูลจำนวนมาก แต่ขาดพื้นที่กลางสำหรับเชื่อมโยงข้อมูลเหล่านั้น
                </p>

                <p>
                  ระบบจึงถูกออกแบบให้รองรับโครงสร้างตั้งแต่ระดับบริษัท
                  โรงงาน อาคาร แผนก สายการผลิต เครื่องจักร และเซนเซอร์
                  เพื่อให้ข้อมูลทุกชุดมีที่มาและสามารถตรวจสอบย้อนหลังได้
                </p>

                <p>
                  เป้าหมายไม่ใช่เพียงการสร้าง Dashboard
                  แต่คือการสร้างระบบที่ช่วยให้ผู้ปฏิบัติงานทำงานง่ายขึ้น
                  ผู้จัดการเห็นปัญหาเร็วขึ้น
                  และผู้บริหารมีข้อมูลที่เพียงพอสำหรับการตัดสินใจ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM OVERVIEW */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#4b7759]">
                Platform overview
              </p>

              <h2 className="mt-5 max-w-[520px] text-[clamp(2rem,3.4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.04em] text-[#1e2e24]">
                ข้อมูลสำคัญของโรงงาน
                <span className="block text-[#4a7659]">
                  อยู่ในระบบเดียว
                </span>
              </h2>
            </div>

            <p className="max-w-[570px] text-[14px] font-light leading-8 text-[#6f7b73] lg:justify-self-end">
              GreenFactory Insight ครอบคลุมการทำงานตั้งแต่การจัดการโครงสร้างองค์กร
              การบันทึกข้อมูลหน้างาน การติดตามตัวชี้วัด
              ไปจนถึงการวิเคราะห์และสร้างรายงาน
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[24px] border border-[#263c2d]/10 bg-[#263c2d]/10 sm:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group min-h-[245px] bg-[#f7f8f4] p-7 transition duration-300 hover:bg-white sm:p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#477257]/15 bg-[#edf3ed]">
                    <Icon
                      className="h-5 w-5 text-[#477257]"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="mt-7 text-[17px] font-medium tracking-[-0.02em] text-[#25372c]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[13px] font-light leading-7 text-[#748078]">
                    {item.description}
                  </p>

                  <span className="mt-6 block h-px w-8 bg-[#477257]/40 transition-all duration-300 group-hover:w-14" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* USERS */}
      <section className="bg-[#173022] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28 xl:px-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-white/45">
                Designed for every role
              </p>

              <h2 className="mt-5 max-w-[530px] text-[clamp(2rem,3.4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.04em]">
                ออกแบบให้ผู้ใช้งาน
                <span className="block text-[#b9d6bf]">
                  แต่ละระดับทำงานร่วมกันได้
                </span>
              </h2>
            </div>

            <p className="max-w-[570px] text-[14px] font-light leading-8 text-white/55 lg:justify-self-end">
              ผู้ใช้งานแต่ละบทบาทจะเห็นข้อมูลและเครื่องมือที่เหมาะสมกับหน้าที่
              ช่วยลดความซับซ้อนและควบคุมการเข้าถึงข้อมูลภายในองค์กร
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 lg:grid-cols-3">
            {userGroups.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="min-h-[260px] bg-[#173022] p-7 transition duration-300 hover:bg-[#1b3928] sm:p-8"
                >
                  <Icon
                    className="h-6 w-6 text-[#acd1b6]"
                    strokeWidth={1.4}
                  />

                  <h3 className="mt-8 text-[18px] font-medium tracking-[-0.02em]">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-[13px] font-light leading-7 text-white/55">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* VISION MISSION GOAL */}
      <section className="border-b border-[#213728]/[0.07] bg-[#edf1eb] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="max-w-[670px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#4b7759]">
              Our direction
            </p>

            <h2 className="mt-5 text-[clamp(2rem,3.4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.04em] text-[#1e2e24]">
              วิสัยทัศน์และทิศทาง
              <span className="block text-[#4a7659]">
                ของ GreenFactory Insight
=======
      {/* VISION / MISSION / PURPOSE */}
      <section className="border-y border-[#213728]/[0.07] bg-[#edf1eb] px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[650px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4b7759]">
              Our direction
            </p>

            <h2 className="mt-5 text-[clamp(2.4rem,4vw,4.4rem)] font-medium leading-[1.08] tracking-[-0.045em] text-[#1e2e24]">
              สิ่งที่เราเชื่อ
              <span className="block text-[#4a7659]">
                และทิศทางที่เรากำลังเดินไป
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
              </span>
            </h2>
          </div>

<<<<<<< HEAD
          <div className="mt-12 border-t border-[#273d2e]/10">
            {principles.map((item) => (
              <article
                key={item.number}
                className="grid gap-5 border-b border-[#273d2e]/10 py-8 sm:grid-cols-[50px_150px_1fr] sm:gap-7 lg:grid-cols-[70px_200px_1fr] lg:py-9"
              >
                <span className="text-[10px] font-medium tracking-[0.18em] text-[#8b988f]">
=======
          <div className="mt-14 border-t border-[#273d2e]/10">
            {principles.map((item) => (
              <article
                key={item.number}
                className="group grid gap-5 border-b border-[#273d2e]/10 py-8 sm:grid-cols-[55px_160px_1fr] sm:gap-8 lg:grid-cols-[80px_220px_1fr] lg:py-10"
              >
                <span className="text-[11px] font-medium tracking-[0.18em] text-[#8b988f]">
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                  {item.number}
                </span>

                <div>
<<<<<<< HEAD
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#4d785b]">
                    {item.eyebrow}
                  </p>

                  <h3 className="mt-2 text-[19px] font-medium tracking-[-0.02em] text-[#24362a]">
=======
                  <p className="text-[9px] font-semibold uppercase tracking-[0.23em] text-[#4d785b]">
                    {item.eyebrow}
                  </p>

                  <h3 className="mt-2 text-[22px] font-medium tracking-[-0.025em] text-[#24362a]">
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                    {item.title}
                  </h3>
                </div>

                <p className="max-w-[720px] text-[14px] font-light leading-8 text-[#68756d]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* STRENGTHS */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#4b7759]">
                Why GreenFactory Insight
              </p>

              <h2 className="mt-5 max-w-[540px] text-[clamp(2rem,3.4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.04em] text-[#1e2e24]">
                ออกแบบจากกระบวนการ
                <span className="block text-[#4a7659]">
                  ทำงานขององค์กรจริง
=======
      {/* WHY US */}
      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4b7759]">
                Why GreenFactory
              </p>

              <h2 className="mt-5 max-w-[520px] text-[clamp(2.4rem,4vw,4.4rem)] font-medium leading-[1.08] tracking-[-0.045em] text-[#1e2e24]">
                ออกแบบให้สอดคล้อง
                <span className="block text-[#4a7659]">
                  กับการทำงานขององค์กร
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                </span>
              </h2>
            </div>

<<<<<<< HEAD
            <p className="max-w-[570px] text-[14px] font-light leading-8 text-[#727e75] lg:justify-self-end">
              ระบบให้ความสำคัญทั้งด้านการใช้งาน โครงสร้างข้อมูล
              ความปลอดภัย และความสามารถในการขยายระบบในอนาคต
            </p>
          </div>

          <div className="mt-12 grid border-y border-[#263c2d]/10 sm:grid-cols-2 lg:grid-cols-4">
=======
            <p className="max-w-[580px] text-[14px] font-light leading-8 text-[#727e75] lg:justify-self-end">
              เราไม่ได้สร้างเพียงหน้ารายงาน
              แต่พัฒนาระบบที่รองรับตั้งแต่การบันทึกข้อมูลหน้างาน
              การประมวลผล ไปจนถึงการสรุปภาพรวมสำหรับผู้บริหาร
            </p>
          </div>

          <div className="mt-14 grid border-y border-[#263c2d]/10 sm:grid-cols-2 lg:grid-cols-4">
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
            {strengths.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
<<<<<<< HEAD
                  className={`group min-h-[280px] py-8 sm:px-6 lg:px-7 ${
=======
                  className={`group min-h-[300px] px-1 py-9 sm:px-7 lg:px-8 ${
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                    index !== strengths.length - 1
                      ? "border-b border-[#263c2d]/10 sm:border-b-0 sm:border-r"
                      : ""
                  } ${
<<<<<<< HEAD
                    index === 1 ? "sm:border-r-0 lg:border-r" : ""
=======
                    index === 1
                      ? "sm:border-r-0 lg:border-r"
                      : ""
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                  }`}
                >
                  <Icon
                    className="h-6 w-6 text-[#4c795a]"
                    strokeWidth={1.4}
                  />

<<<<<<< HEAD
                  <h3 className="mt-8 text-[17px] font-medium leading-7 tracking-[-0.02em] text-[#26372d]">
=======
                  <h3 className="mt-10 text-[18px] font-medium leading-7 tracking-[-0.02em] text-[#26372d]">
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                    {item.title}
                  </h3>

                  <p className="mt-4 text-[13px] font-light leading-7 text-[#748078]">
                    {item.description}
                  </p>

<<<<<<< HEAD
                  <span className="mt-7 block h-px w-8 bg-[#4c795a]/45 transition-all duration-300 group-hover:w-14" />
=======
                  <span className="mt-8 block h-px w-8 bg-[#4c795a]/45 transition-all duration-300 group-hover:w-14" />
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-4 sm:px-6 sm:pb-6">
<<<<<<< HEAD
        <div className="relative mx-auto min-h-[420px] max-w-[1480px] overflow-hidden rounded-[26px] bg-[#183022]">
=======
        <div className="relative mx-auto min-h-[500px] max-w-[1480px] overflow-hidden rounded-[26px] bg-[#183022]">
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          <Image
            src="/images/hero-factory.jpg"
            alt=""
            fill
            sizes="100vw"
<<<<<<< HEAD
            className="object-cover object-[65%_center] opacity-40"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,39,25,0.97)_0%,rgba(20,52,33,0.86)_52%,rgba(20,52,33,0.2)_100%)]" />

          <div className="relative z-10 flex min-h-[420px] items-center px-7 py-14 sm:px-12 lg:px-20">
            <div className="max-w-[680px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-white/50">
                Get in touch
              </p>

              <h2 className="mt-5 text-[clamp(2.2rem,4vw,4rem)] font-medium leading-[1.08] tracking-[-0.045em] text-white">
                เปลี่ยนข้อมูลของโรงงาน
                <span className="block text-[#b9d6bf]">
                  ให้พร้อมสำหรับการตัดสินใจ
                </span>
              </h2>

              <p className="mt-6 max-w-[550px] text-[14px] font-light leading-8 text-white/60">
                เรียนรู้เพิ่มเติมเกี่ยวกับแนวทางการจัดการข้อมูล
                และความสามารถของ GreenFactory Insight
                สำหรับองค์กรอุตสาหกรรม
=======
            className="object-cover object-[65%_center] opacity-45"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,39,25,0.96)_0%,rgba(20,52,33,0.84)_48%,rgba(20,52,33,0.18)_100%)]" />

          <div className="relative z-10 flex min-h-[500px] items-center px-7 py-16 sm:px-12 lg:px-20">
            <div className="max-w-[720px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                For modern organizations
              </p>

              <h2 className="mt-6 text-[clamp(2.6rem,5vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.055em] text-white">
                เริ่มต้นสร้างการเปลี่ยนแปลง
                <span className="block text-[#b9d6bf]">
                  ด้วยข้อมูลที่องค์กรคุณมี
                </span>
              </h2>

              <p className="mt-7 max-w-[570px] text-[14px] font-light leading-8 text-white/65">
                บอกเราเกี่ยวกับเป้าหมายและความต้องการขององค์กร
                เพื่อร่วมกันค้นหาแนวทางจัดการข้อมูลที่เหมาะสมกับการดำเนินงานของคุณ
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
              </p>

              <Link
                href="/contact"
<<<<<<< HEAD
                className="group mt-8 inline-flex min-h-[50px] items-center justify-center gap-3 rounded-full bg-white px-7 py-3 text-[13px] font-medium text-[#294232] transition duration-300 hover:-translate-y-0.5 hover:bg-[#edf3ed]"
=======
                className="group mt-9 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-[13px] font-medium text-[#294232] transition duration-300 hover:-translate-y-0.5 hover:bg-[#edf3ed]"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
              >
                ติดต่อเรา

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
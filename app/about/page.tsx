import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
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

const principles = [
  {
    number: "01",
    eyebrow: "Vision",
    title: "วิสัยทัศน์",
    description:
      "พัฒนาแพลตฟอร์มที่ช่วยให้องค์กรอุตสาหกรรมสามารถใช้ข้อมูลในการบริหารจัดการทรัพยากรและการดำเนินงานได้อย่างมีประสิทธิภาพ",
  },
  {
    number: "02",
    eyebrow: "Mission",
    title: "พันธกิจ",
    description:
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
  },
];

const strengths = [
  {
    icon: Factory,
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
  },
];

export const metadata = {
  title: "เกี่ยวกับเรา | GreenFactory Insight",
  description:
    "รู้จัก GreenFactory Insight แพลตฟอร์มบริหารจัดการข้อมูลสำหรับองค์กรอุตสาหกรรม",
};

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-[#f7f8f4] text-[#1d2d23]">
      {/* HERO */}
      <section className="relative min-h-[620px] overflow-hidden lg:min-h-[680px]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-factory.jpg"
            alt="โรงงานอุตสาหกรรมสมัยใหม่"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-[68%_center]"
          />
        </div>

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

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[#263d2d]/15 bg-white/65 px-7 py-3 text-[13px] font-medium text-[#2d3d32] backdrop-blur-xl transition duration-300 hover:border-[#477257]/35 hover:bg-white hover:text-[#386849]"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>
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
              </span>
            </h2>
          </div>

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
              </p>
            </div>
          </div>
        </div>
      </section>

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
              </span>
            </h2>
          </div>

          <div className="mt-12 border-t border-[#273d2e]/10">
            {principles.map((item) => (
              <article
                key={item.number}
                className="grid gap-5 border-b border-[#273d2e]/10 py-8 sm:grid-cols-[50px_150px_1fr] sm:gap-7 lg:grid-cols-[70px_200px_1fr] lg:py-9"
              >
                <span className="text-[10px] font-medium tracking-[0.18em] text-[#8b988f]">
                  {item.number}
                </span>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#4d785b]">
                    {item.eyebrow}
                  </p>

                  <h3 className="mt-2 text-[19px] font-medium tracking-[-0.02em] text-[#24362a]">
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
                </span>
              </h2>
            </div>

            <p className="max-w-[570px] text-[14px] font-light leading-8 text-[#727e75] lg:justify-self-end">
              ระบบให้ความสำคัญทั้งด้านการใช้งาน โครงสร้างข้อมูล
              ความปลอดภัย และความสามารถในการขยายระบบในอนาคต
            </p>
          </div>

          <div className="mt-12 grid border-y border-[#263c2d]/10 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={`group min-h-[280px] py-8 sm:px-6 lg:px-7 ${
                    index !== strengths.length - 1
                      ? "border-b border-[#263c2d]/10 sm:border-b-0 sm:border-r"
                      : ""
                  } ${
                    index === 1 ? "sm:border-r-0 lg:border-r" : ""
                  }`}
                >
                  <Icon
                    className="h-6 w-6 text-[#4c795a]"
                    strokeWidth={1.4}
                  />

                  <h3 className="mt-8 text-[17px] font-medium leading-7 tracking-[-0.02em] text-[#26372d]">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-[13px] font-light leading-7 text-[#748078]">
                    {item.description}
                  </p>

                  <span className="mt-7 block h-px w-8 bg-[#4c795a]/45 transition-all duration-300 group-hover:w-14" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="relative mx-auto min-h-[420px] max-w-[1480px] overflow-hidden rounded-[26px] bg-[#183022]">
          <Image
            src="/images/hero-factory.jpg"
            alt=""
            fill
            sizes="100vw"
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
              </p>

              <Link
                href="/contact"
                className="group mt-8 inline-flex min-h-[50px] items-center justify-center gap-3 rounded-full bg-white px-7 py-3 text-[13px] font-medium text-[#294232] transition duration-300 hover:-translate-y-0.5 hover:bg-[#edf3ed]"
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
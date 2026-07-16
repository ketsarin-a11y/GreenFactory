import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Factory,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const principles = [
  {
    number: "01",
    eyebrow: "Vision",
    title: "วิสัยทัศน์",
    description:
      "เป็นแพลตฟอร์มที่ช่วยให้องค์กรอุตสาหกรรมใช้ข้อมูลเพื่อขับเคลื่อนการดำเนินงานอย่างมีประสิทธิภาพและยั่งยืน",
  },
  {
    number: "02",
    eyebrow: "Mission",
    title: "พันธกิจ",
    description:
      "เชื่อมโยงข้อมูลจากบุคลากร เครื่องจักร และกระบวนการผลิต ให้อยู่ในระบบที่เข้าใจง่ายและนำไปใช้ได้จริง",
  },
  {
    number: "03",
    eyebrow: "Purpose",
    title: "เป้าหมาย",
    description:
      "ช่วยให้องค์กรเห็นโอกาสในการลดต้นทุน ลดผลกระทบต่อสิ่งแวดล้อม และเติบโตบนพื้นฐานของข้อมูลที่เชื่อถือได้",
  },
];

const strengths = [
  {
    icon: Factory,
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
  },
];

export const metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "รู้จัก GreenFactory Insight แพลตฟอร์มข้อมูลความยั่งยืนสำหรับองค์กรอุตสาหกรรม",
};

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-[#f7f8f4]">
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-factory.jpg"
            alt="โรงงานอุตสาหกรรมสมัยใหม่ท่ามกลางพื้นที่สีเขียว"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-[68%_center]"
          />
        </div>

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

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#263d2d]/15 bg-white/60 px-7 py-3.5 text-[13px] font-medium text-[#2d3d32] backdrop-blur-xl transition duration-300 hover:border-[#477257]/35 hover:bg-white hover:text-[#386849]"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>

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
              </span>
            </h2>
          </div>

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
              </p>
            </div>
          </div>
        </div>
      </section>

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
              </span>
            </h2>
          </div>

          <div className="mt-14 border-t border-[#273d2e]/10">
            {principles.map((item) => (
              <article
                key={item.number}
                className="group grid gap-5 border-b border-[#273d2e]/10 py-8 sm:grid-cols-[55px_160px_1fr] sm:gap-8 lg:grid-cols-[80px_220px_1fr] lg:py-10"
              >
                <span className="text-[11px] font-medium tracking-[0.18em] text-[#8b988f]">
                  {item.number}
                </span>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.23em] text-[#4d785b]">
                    {item.eyebrow}
                  </p>

                  <h3 className="mt-2 text-[22px] font-medium tracking-[-0.025em] text-[#24362a]">
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
                </span>
              </h2>
            </div>

            <p className="max-w-[580px] text-[14px] font-light leading-8 text-[#727e75] lg:justify-self-end">
              เราไม่ได้สร้างเพียงหน้ารายงาน
              แต่พัฒนาระบบที่รองรับตั้งแต่การบันทึกข้อมูลหน้างาน
              การประมวลผล ไปจนถึงการสรุปภาพรวมสำหรับผู้บริหาร
            </p>
          </div>

          <div className="mt-14 grid border-y border-[#263c2d]/10 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={`group min-h-[300px] px-1 py-9 sm:px-7 lg:px-8 ${
                    index !== strengths.length - 1
                      ? "border-b border-[#263c2d]/10 sm:border-b-0 sm:border-r"
                      : ""
                  } ${
                    index === 1
                      ? "sm:border-r-0 lg:border-r"
                      : ""
                  }`}
                >
                  <Icon
                    className="h-6 w-6 text-[#4c795a]"
                    strokeWidth={1.4}
                  />

                  <h3 className="mt-10 text-[18px] font-medium leading-7 tracking-[-0.02em] text-[#26372d]">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-[13px] font-light leading-7 text-[#748078]">
                    {item.description}
                  </p>

                  <span className="mt-8 block h-px w-8 bg-[#4c795a]/45 transition-all duration-300 group-hover:w-14" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="relative mx-auto min-h-[500px] max-w-[1480px] overflow-hidden rounded-[26px] bg-[#183022]">
          <Image
            src="/images/hero-factory.jpg"
            alt=""
            fill
            sizes="100vw"
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
              </p>

              <Link
                href="/contact"
                className="group mt-9 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-[13px] font-medium text-[#294232] transition duration-300 hover:-translate-y-0.5 hover:bg-[#edf3ed]"
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
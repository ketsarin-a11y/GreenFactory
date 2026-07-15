import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const platformDetails = [
  "รองรับหลายองค์กร",
  "แยกข้อมูลตามสิทธิ์",
  "รวมข้อมูลไว้ในระบบเดียว",
];

export default function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#0b1711]">
      {/* Background image */}
      <div className="absolute inset-0 -z-30">
        <Image
          src="/images/hero-factory.jpg"
          alt="โรงงานอุตสาหกรรมสมัยใหม่"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
      </div>

      {/* Main contrast overlay */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(6,17,11,0.98)_0%,rgba(8,28,17,0.95)_34%,rgba(16,73,39,0.62)_57%,rgba(21,123,62,0.22)_76%,rgba(21,123,62,0.04)_100%)]" />

      {/* Top depth */}
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-[#07120c]/75 via-[#07120c]/20 to-transparent" />

      {/* Bottom depth */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-36 bg-gradient-to-t from-[#08130d]/75 to-transparent" />

      {/* Soft ambient light */}
      <div className="pointer-events-none absolute -left-56 top-24 -z-10 h-[500px] w-[500px] rounded-full bg-[#5fa270]/12 blur-[145px]" />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] items-center px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-12 lg:pb-24 xl:px-16">
        <div className="w-full max-w-[650px] lg:ml-6 xl:ml-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#8ecb9d]" />

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/75">
              GreenFactory Insight
            </p>
          </div>

          {/* Heading */}
          <h1 className="mt-7 max-w-[640px] text-[clamp(2.55rem,4.35vw,4.75rem)] font-medium leading-[1.07] tracking-[-0.045em] text-white">
            แพลตฟอร์มสำหรับ
            <span className="block text-white/95">
              การบริหารข้อมูลความยั่งยืน
            </span>
            <span className="block text-[#a7d7b2]">
              ขององค์กรอุตสาหกรรม
            </span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[520px] text-[14px] font-normal leading-8 text-white/72 sm:text-[15px]">
            เชื่อมโยงข้อมูลจากเครื่องจักร เซนเซอร์ และหน่วยงานต่าง ๆ
            เข้าสู่ระบบเดียว เพื่อให้การติดตาม วิเคราะห์
            และตัดสินใจเกิดขึ้นบนข้อมูลที่ชัดเจนและตรวจสอบได้
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/features"
              className="group inline-flex min-h-[50px] items-center justify-center gap-3 rounded-full bg-white px-7 py-3 text-[13px] font-medium text-[#17231b] shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4f8f3]"
            >
              สำรวจโซลูชัน

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/24 bg-white/[0.07] px-7 py-3 text-[13px] font-medium text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12]"
            >
              ติดต่อเรา
            </Link>
          </div>

          {/* Compact details */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/16 pt-6">
            {platformDetails.map((detail) => (
              <div
                key={detail}
                className="flex items-center gap-2 text-[10px] font-normal text-white/68 sm:text-[11px]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#a6d3b0]/55 text-[#b7e2c0]">
                  <Check className="h-2.5 w-2.5" strokeWidth={2} />
                </span>

                {detail}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image caption */}
      <div className="absolute bottom-8 right-8 z-20 hidden max-w-[270px] border-l border-white/28 pl-5 lg:block xl:right-14">
        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/58">
          Connected industrial data
        </p>

        <p className="mt-3 text-[12px] font-normal leading-6 text-white/72">
          เชื่อมโยงข้อมูลจากทุกส่วนขององค์กร
          โดยคงโครงสร้างและสิทธิ์การเข้าถึงไว้อย่างชัดเจน
        </p>
      </div>
    </section>
  );
}
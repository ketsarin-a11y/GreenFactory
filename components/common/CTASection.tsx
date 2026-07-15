import Link from "next/link";
import { ArrowRight, Leaf, Mail } from "lucide-react";

type CTASectionProps = {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
  email?: string;
};

export default function CTASection({
  eyebrow = "GreenFactory Insight",
  title = "พร้อมยกระดับ",
  highlight = "การบริหารข้อมูลโรงงาน",
  description = "รวมข้อมูลจากเครื่องจักร เซนเซอร์ และผู้ปฏิบัติงานไว้ในแพลตฟอร์มเดียว เพื่อช่วยให้องค์กรตัดสินใจได้ชัดเจนขึ้น ลดความซ้ำซ้อน และสนับสนุนเป้าหมายด้านความยั่งยืน",
  buttonLabel = "ติดต่อเรา",
  buttonHref = "/contact",
  email = "contact@greenfactory-insight.com",
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#f6f8f4] px-4 py-20 sm:px-6 sm:py-24 lg:px-12 lg:py-28 xl:px-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,118,89,0.12),transparent_42%)]" />

      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-[#dfe9df] blur-[110px]" />

      <div className="relative mx-auto max-w-[1380px] overflow-hidden rounded-[28px] border border-[#2b4232]/10 bg-[#1d3125] sm:rounded-[34px] lg:rounded-[42px]">
        {/* Ambient light */}
        <div className="pointer-events-none absolute -right-40 -top-44 h-[480px] w-[480px] rounded-full bg-[#5b8c67]/20 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[320px] w-[320px] rounded-full bg-[#6d9a75]/15 blur-[100px]" />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.035),transparent_46%)]" />

        <div className="relative grid gap-12 px-6 py-12 sm:px-9 sm:py-14 lg:grid-cols-[1fr_390px] lg:items-center lg:gap-16 lg:px-14 lg:py-16 xl:px-16 xl:py-20">
          {/* Left content */}
          <div className="max-w-[780px]">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur-xl">
              <Leaf
                className="h-4 w-4 text-[#98d1a4]"
                strokeWidth={1.5}
              />

              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#a2d2ab] sm:text-[11px]">
                {eyebrow}
              </span>
            </div>

            <h2 className="mt-7 text-[clamp(2.6rem,5vw,5.5rem)] font-medium leading-[1.04] tracking-[-0.055em] text-white">
              {title}

              {highlight && (
                <span className="block text-[#98cba1]">{highlight}</span>
              )}
            </h2>

            <p className="mt-7 max-w-[650px] text-[14px] font-light leading-8 text-white/62 sm:text-[15px] sm:leading-9">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6">
              {[
                "พลังงาน",
                "คาร์บอน",
                "ทรัพยากร",
                "ข้อมูลการผลิต",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 text-[11px] font-light text-white/48"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#83b58f]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl sm:p-7 lg:rounded-[30px] lg:p-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9fd3a7]">
              Contact
            </p>

            <h3 className="mt-4 text-[25px] font-medium leading-tight tracking-[-0.035em] text-white sm:text-[29px]">
              พูดคุยกับทีมของเรา
            </h3>

            <p className="mt-4 text-[13px] font-light leading-7 text-white/58">
              บอกเราเกี่ยวกับเป้าหมายและความต้องการขององค์กร
              เพื่อค้นหาแนวทางที่เหมาะกับกระบวนการทำงานของคุณ
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href={buttonHref}
                className="group flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-[#4f8a61] px-5 text-[13px] font-medium text-white shadow-[0_16px_34px_rgba(15,38,24,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#447755]"
              >
                {buttonLabel}

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href={`mailto:${email}`}
                className="flex min-h-[54px] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 text-[12px] font-medium text-white/82 transition duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:text-[13px]"
              >
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />

                <span className="min-w-0 truncate">{email}</span>
              </Link>
            </div>

            <p className="mt-5 text-center text-[9px] font-light leading-5 text-white/35">
              เราจะติดต่อกลับผ่านข้อมูลที่คุณระบุในหน้าติดต่อเรา
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
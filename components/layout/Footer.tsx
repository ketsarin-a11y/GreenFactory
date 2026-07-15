import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

const footerLinks = [
  {
    label: "หน้าแรก",
    href: "/",
  },
  {
    label: "เกี่ยวกับเรา",
    href: "/about",
  },
  {
    label: "โซลูชัน",
    href: "/features",
  },
  {
    label: "ข้อมูลเชิงลึก",
    href: "/news",
  },
  {
    label: "ติดต่อเรา",
    href: "/contact",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#1d4a31]/10 bg-[#eef7f0] px-5 pb-7 pt-16 text-[#173323] sm:px-8 sm:pt-20 lg:px-12 xl:px-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 -top-40 h-[360px] w-[360px] rounded-full bg-[#8fddb0]/22 blur-[110px]" />

      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[320px] w-[320px] rounded-full bg-[#cfe8d6]/55 blur-[110px]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#43a86b]/35 to-transparent" />

      {/* Large background word */}
      <div className="pointer-events-none absolute bottom-[-38px] left-1/2 hidden -translate-x-1/2 select-none text-[clamp(7rem,16vw,15rem)] font-semibold leading-none tracking-[-0.08em] text-[#174c30]/[0.025] lg:block">
        GREENFACTORY
      </div>

      <div className="relative mx-auto max-w-[1380px]">
        {/* Top statement */}
        <div className="flex flex-col gap-8 border-b border-[#1d4a31]/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#43805a]">
              GreenFactory Insight
            </p>

            <h2 className="mt-4 max-w-[720px] text-[clamp(2rem,3.8vw,4.1rem)] font-medium leading-[1.08] tracking-[-0.05em] text-[#173323]">
              เชื่อมโยงข้อมูลอุตสาหกรรม
              <span className="block text-[#4f8a63]">
                สู่การตัดสินใจที่ยั่งยืนกว่า
              </span>
            </h2>
          </div>

          <Link
            href="/features"
            className="group inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#1c8f50] px-6 text-[13px] font-medium text-white shadow-[0_12px_28px_rgba(28,143,80,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#167a44]"
          >
            สำรวจแพลตฟอร์ม

            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Main footer content */}
        <div className="grid gap-12 py-12 md:grid-cols-2 lg:grid-cols-[1.05fr_0.55fr_0.8fr] lg:gap-16">
          {/* Description */}
          <div className="max-w-[520px]">
            <p className="text-[15px] font-semibold tracking-[-0.025em] text-[#173323]">
              GreenFactory Insight
            </p>

            <p className="mt-4 text-[13px] leading-7 text-[#62756a] sm:text-[14px]">
              แพลตฟอร์มบริหารข้อมูลด้านพลังงาน คาร์บอน ทรัพยากร
              และการดำเนินงานสำหรับองค์กรอุตสาหกรรม
              รองรับหลายองค์กรโดยแยกข้อมูลและสิทธิ์การเข้าถึงอย่างชัดเจน
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#43805a]">
              เมนู
            </p>

            <nav className="mt-5 flex flex-col items-start gap-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center gap-2 text-[13px] text-[#53685c] transition duration-300 hover:text-[#167a44]"
                >
                  {item.label}

                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#43805a]">
              ติดต่อ
            </p>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2f7e50]/12 bg-white/65 text-[#2f7e50]">
                  <MapPin className="h-4 w-4" strokeWidth={1.6} />
                </span>

                <div>
                  <p className="text-[12px] font-medium text-[#203b2b]">
                    Research & Development
                  </p>

                  <p className="mt-1.5 text-[12px] leading-6 text-[#687b70]">
                    Suranaree University
                    <span className="block">Nakhon Ratchasima, Thailand</span>
                  </p>
                </div>
              </div>

              <a
                href="mailto:kesrin9170@gmail.com"
                className="group flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2f7e50]/12 bg-white/65 text-[#2f7e50] transition duration-300 group-hover:border-[#2f7e50]/25 group-hover:bg-white">
                  <Mail className="h-4 w-4" strokeWidth={1.6} />
                </span>

                <div>
                  <p className="text-[12px] font-medium text-[#203b2b]">
                    Email
                  </p>

                  <p className="mt-1.5 text-[12px] text-[#687b70] transition duration-300 group-hover:text-[#167a44]">
                    kesrin9170@gmail.com
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-[#1d4a31]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[#7a8980]">
            © 2026 GreenFactory Insight. All rights reserved.
          </p>

          <p className="text-[9px] uppercase tracking-[0.14em] text-[#8b978f]">
            Multi-tenant sustainability management platform
          </p>
        </div>
      </div>
    </footer>
  );
}
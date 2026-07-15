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
    <footer className="border-t border-[#dce8df] bg-[#f7faf8] px-5 pb-7 pt-14 text-[#173323] sm:px-8 sm:pt-16 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        {/* Footer heading */}
        <div className="flex flex-col gap-7 border-b border-[#dce8df] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[680px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3f7653]">
              GreenFactory Insight
            </p>

            <h2 className="mt-4 text-[clamp(1.8rem,3vw,3.15rem)] font-semibold leading-[1.16] tracking-[-0.04em] text-[#173323]">
              เปลี่ยนข้อมูลภายในโรงงาน
              <span className="block text-[#4b7f5d]">
                ให้เป็นการตัดสินใจที่มีประสิทธิภาพ
              </span>
            </h2>

            <p className="mt-5 max-w-[620px] text-[13px] leading-7 text-[#68796f] sm:text-[14px]">
              รวมข้อมูลด้านพลังงาน คาร์บอน ทรัพยากร และการดำเนินงาน
              เพื่อช่วยให้องค์กรมองเห็นภาพรวม ติดตามผล
              และวางแผนการพัฒนาได้อย่างเป็นระบบ
            </p>
          </div>

          <Link
            href="/features"
            className="group inline-flex min-h-[46px] w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-[#237c49] px-5 text-[13px] font-medium text-white transition duration-300 hover:bg-[#1c693d]"
          >
            สำรวจแพลตฟอร์ม

            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Main footer */}
        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.55fr_0.85fr] lg:gap-14">
          {/* Brand */}
          <div className="max-w-[470px]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#237c49] text-[12px] font-bold text-white">
                GF
              </div>

              <div>
                <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#173323]">
                  GreenFactory Insight
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.13em] text-[#829087]">
                  Industrial Intelligence Platform
                </p>
              </div>
            </div>

            <p className="mt-5 text-[13px] leading-7 text-[#68796f]">
              แพลตฟอร์มสำหรับบริหารข้อมูลความยั่งยืนขององค์กรอุตสาหกรรม
              รองรับการติดตามตัวชี้วัด การใช้ทรัพยากร
              และข้อมูลจากหลายโรงงานภายใต้ระบบเดียว
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-semibold text-[#294f38]">
              เมนูเว็บไซต์
            </p>

            <nav className="mt-5 flex flex-col items-start gap-3.5">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-[13px] text-[#65776c] transition duration-200 hover:text-[#237c49]"
                >
                  {item.label}

                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-semibold text-[#294f38]">
              ข้อมูลติดต่อ
            </p>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d6e4da] bg-white text-[#357551]">
                  <MapPin className="h-4 w-4" strokeWidth={1.7} />
                </div>

                <div>
                  <p className="text-[12px] font-medium text-[#294132]">
                    สถานที่พัฒนาโครงการ
                  </p>

                  <p className="mt-1 text-[12px] leading-6 text-[#718078]">
                    Suranaree University of Technology
                    <span className="block">
                      Nakhon Ratchasima, Thailand
                    </span>
                  </p>
                </div>
              </div>

              <a
                href="mailto:kesrin9170@gmail.com"
                className="group flex items-start gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d6e4da] bg-white text-[#357551] transition duration-200 group-hover:border-[#9dc7aa]">
                  <Mail className="h-4 w-4" strokeWidth={1.7} />
                </div>

                <div>
                  <p className="text-[12px] font-medium text-[#294132]">
                    อีเมล
                  </p>

                  <p className="mt-1 text-[12px] text-[#718078] transition duration-200 group-hover:text-[#237c49]">
                    kesrin9170@gmail.com
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 border-t border-[#dce8df] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[#809087]">
            © 2026 GreenFactory Insight. All rights reserved.
          </p>

          <p className="text-[9px] uppercase tracking-[0.12em] text-[#94a098]">
            Sustainability data management platform
          </p>
        </div>
      </div>
    </footer>
  );
}
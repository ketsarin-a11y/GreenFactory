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

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Suranaree+University+of+Technology";

export default function Footer() {
  return (
    <footer className="border-t border-[#dfe8e2] bg-[#f6f9f7] px-5 text-[#173323] sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        {/* Main footer */}
        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr] lg:gap-16 lg:py-12">
          {/* Brand */}
          <div className="max-w-[460px]">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#cfe0d5] bg-white text-[10px] font-bold text-[#237c49] shadow-sm transition duration-300 group-hover:border-[#9ec5aa] group-hover:bg-[#edf6f0]">
                GF
              </span>

              <div>
                <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#183326]">
                  GreenFactory Insight
                </p>

                <p className="mt-0.5 text-[8px] uppercase tracking-[0.16em] text-[#8a978f]">
                  Industrial Data Platform
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-[410px] text-[12px] leading-6 text-[#6f7e74]">
              ระบบสารสนเทศสำหรับบริหารจัดการข้อมูลพลังงาน ทรัพยากร
              คาร์บอน และผลการดำเนินงานภายในโรงงานอุตสาหกรรม
            </p>

            <Link
              href="/features"
              className="group mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#237c49] transition hover:text-[#185f37]"
            >
              ดูภาพรวมระบบ

              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#496054]">
              Navigation
            </p>

            <nav className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 md:grid-cols-1">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex w-fit items-center gap-1.5 text-[12px] text-[#6d7b72] transition duration-200 hover:text-[#237c49]"
                >
                  <span>{item.label}</span>

                  <ArrowUpRight className="h-3 w-3 translate-y-0.5 opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#496054]">
              Contact
            </p>

            <div className="mt-5 space-y-5">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
                aria-label="เปิดตำแหน่งมหาวิทยาลัยเทคโนโลยีสุรนารีใน Google Maps"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eaf3ed] text-[#2e7450] transition duration-200 group-hover:bg-[#dcece1]">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>

                <div>
                  <p className="text-[11px] font-medium text-[#294233]">
                    มหาวิทยาลัยเทคโนโลยีสุรนารี
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#7a877f]">
                    นครราชสีมา ประเทศไทย
                  </p>
                </div>
              </a>

              <a
                href="mailto:kesrin9170@gmail.com"
                className="group flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eaf3ed] text-[#2e7450] transition duration-200 group-hover:bg-[#dcece1]">
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#294233]">
                    ติดต่อโครงการ
                  </p>

                  <p className="mt-1 break-all text-[11px] text-[#7a877f] transition duration-200 group-hover:text-[#237c49]">
                    kesrin9170@gmail.com
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t border-[#dfe8e2] py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[#859188]">
            © 2026 GreenFactory Insight
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="text-[10px] text-[#859188] transition hover:text-[#237c49]"
            >
              นโยบายความเป็นส่วนตัว
            </Link>

            <Link
              href="/terms"
              className="text-[10px] text-[#859188] transition hover:text-[#237c49]"
            >
              ข้อกำหนดการใช้งาน
            </Link>

            <span className="hidden h-3 w-px bg-[#cfdad3] sm:block" />

            <p className="text-[9px] uppercase tracking-[0.12em] text-[#96a198]">
              Sustainability Data Platform
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
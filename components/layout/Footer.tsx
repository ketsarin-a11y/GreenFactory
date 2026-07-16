import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Mail,
  MapPin,
} from "lucide-react";

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
    <footer className="border-t border-[#dce8df] bg-[#f7faf8] px-5 pb-6 pt-12 text-[#173323] sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 pb-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.55fr_0.85fr] lg:gap-16">
          {/* Brand */}
          <div className="max-w-[480px]">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#237c49] text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(35,124,73,0.16)] transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-[#1d6e40]">
                GF
              </div>

              <div>
                <p className="text-[15px] font-semibold tracking-[-0.025em] text-[#173323]">
                  GreenFactory Insight
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#829087]">
                  Industrial Intelligence Platform
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-[440px] text-[13px] leading-7 text-[#68796f]">
              แพลตฟอร์มสำหรับรวบรวมและบริหารข้อมูลด้านพลังงาน คาร์บอน
              ทรัพยากร และการดำเนินงานของโรงงาน
              ช่วยให้องค์กรติดตามผลและวางแผนพัฒนาได้อย่างเป็นระบบ
            </p>

            <Link
              href="/features"
              className="group mt-6 inline-flex items-center gap-2 text-[12px] font-semibold text-[#237c49] transition hover:text-[#185f37]"
            >
              สำรวจความสามารถของระบบ

              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#294f38]">
              เมนูเว็บไซต์
            </p>

            <nav className="mt-5 flex flex-col items-start gap-3.5">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-[13px] text-[#65776c] transition duration-200 hover:translate-x-0.5 hover:text-[#237c49]"
                >
                  {item.label}

                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition duration-200 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#294f38]">
              ข้อมูลติดต่อ
            </p>

            <div className="mt-5 space-y-4">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="เปิดตำแหน่งมหาวิทยาลัยเทคโนโลยีสุรนารีใน Google Maps"
                className="group flex items-start gap-3 rounded-xl border border-transparent p-2 transition duration-200 hover:border-[#d6e4da] hover:bg-white"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d6e4da] bg-white text-[#357551] transition duration-200 group-hover:border-[#9dc7aa] group-hover:bg-[#edf7f0]">
                  <MapPin className="h-4 w-4" strokeWidth={1.7} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-medium text-[#294132]">
                      สถานที่พัฒนาโครงการ
                    </p>

                    <ExternalLink className="h-3 w-3 text-[#819087] transition group-hover:text-[#237c49]" />
                  </div>

                  <p className="mt-1 text-[12px] leading-6 text-[#718078] transition duration-200 group-hover:text-[#4f6859]">
                    มหาวิทยาลัยเทคโนโลยีสุรนารี
                    <span className="block">
                      จังหวัดนครราชสีมา ประเทศไทย
                    </span>
                  </p>
                </div>
              </a>

              <a
                href="mailto:kesrin9170@gmail.com"
                className="group flex items-start gap-3 rounded-xl border border-transparent p-2 transition duration-200 hover:border-[#d6e4da] hover:bg-white"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d6e4da] bg-white text-[#357551] transition duration-200 group-hover:border-[#9dc7aa] group-hover:bg-[#edf7f0]">
                  <Mail className="h-4 w-4" strokeWidth={1.7} />
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[#294132]">
                    อีเมล
                  </p>

                  <p className="mt-1 break-all text-[12px] text-[#718078] transition duration-200 group-hover:text-[#237c49]">
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
            Sustainability Data Management Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { CONTACT, NAV } from "./site";

const SOLUTIONS = [
  { href: "/features#energy", label: "พลังงานและน้ำ" },
  { href: "/features#carbon", label: "คาร์บอน" },
  { href: "/features#kpi", label: "KPI" },
  { href: "/features#qr", label: "บันทึกด้วย QR Code" },
  { href: "/features#sensors", label: "เซนเซอร์ IoT" },
  { href: "/features#reports", label: "รายงาน" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#062e22] text-white/75">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <p className="font-display text-lg font-semibold text-white">
            GreenFactory Insight<span className="text-brand-lime">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            ระบบสารสนเทศสำหรับบริหารจัดการข้อมูลพลังงาน ทรัพยากร คาร์บอน และผลการดำเนินงานภายในโรงงานอุตสาหกรรม
          </p>
        </div>
        <FooterCol title="เมนู" links={NAV} />
        <FooterCol title="โซลูชัน" links={SOLUTIONS} />
        <div>
          <h2 className="text-sm font-semibold text-white">ติดต่อโครงการ</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex items-start gap-2 hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:text-white">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {CONTACT.place}
                  <br />
                  {CONTACT.city}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} GreenFactory Insight</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/terms" className="hover:text-white">ข้อกำหนดการใช้งาน</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-white">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

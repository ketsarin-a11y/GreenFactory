"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  Database,
  Factory,
  Gauge,
  Menu,
  X,
} from "lucide-react";

const solutions = [
  {
    title: "การจัดการพลังงาน",
    description: "ติดตามการใช้พลังงาน ต้นทุน และประสิทธิภาพของโรงงาน",
    href: "/features#energy",
    icon: Gauge,
  },
  {
    title: "ข้อมูลการผลิต",
    description: "เชื่อมโยงข้อมูลสายการผลิต เครื่องจักร และจุดปฏิบัติงาน",
    href: "/features#production",
    icon: Factory,
  },
  {
    title: "ทรัพยากรและการปล่อย",
    description: "บันทึกทรัพยากร ของเสีย และข้อมูลการปล่อยอย่างเป็นระบบ",
    href: "/features#resources",
    icon: Database,
  },
  {
    title: "การวิเคราะห์อัจฉริยะ",
    description: "วิเคราะห์แนวโน้ม ความผิดปกติ และโอกาสในการปรับปรุง",
    href: "/features#analytics",
    icon: BarChart3,
  },
];

const navigation = [
  { label: "หน้าแรก", href: "/" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ข้อมูลเชิงลึก", href: "/news" },
  { label: "ติดต่อเรา", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSolutionsOpen(false);
    setIsMobileSolutionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSolutionsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "border-emerald-950/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.94),rgba(248,252,250,0.92),rgba(255,255,255,0.94))] shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
            : "border-white/15 bg-[linear-gradient(90deg,rgba(4,18,13,0.60),rgba(5,25,18,0.34),rgba(4,18,13,0.60))] backdrop-blur-xl"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-all duration-300 sm:px-8 lg:px-12 xl:px-16 ${
            isScrolled ? "h-16" : "h-[72px]"
          }`}
        >
          <Link
            href="/"
            aria-label="GreenFactory Insight หน้าแรก"
            className="shrink-0"
          >
            <div className="leading-none">
              <div
                className={`text-[16px] font-semibold tracking-[-0.045em] transition-colors sm:text-[18px] ${
                  isScrolled ? "text-[#10201a]" : "text-white"
                }`}
              >
                GreenFactory{" "}
                <span
                  className={`font-semibold ${isScrolled ? "text-[#1E7A49]" : "text-emerald-300"}`}
                >
                  Insight
                </span>
              </div>
              <div
                className={`mt-1.5 hidden text-[9px] font-medium tracking-[0.08em] transition-colors min-[420px]:block ${
                  isScrolled ? "text-emerald-950/42" : "text-white/46"
                }`}
              >
                Industrial Intelligence Platform
              </div>
              <div
                className={`mt-2 h-[2px] w-10 rounded-full transition-colors ${isScrolled ? "bg-gradient-to-r from-emerald-600 to-teal-400" : "bg-gradient-to-r from-emerald-300 to-cyan-300"}`}
              />
            </div>
          </Link>

          <nav
            aria-label="เมนูหลัก"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 xl:flex"
          >
            {navigation.slice(0, 2).map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
                light={!isScrolled}
              >
                {item.label}
              </DesktopNavLink>
            ))}

            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onMouseLeave={() => setIsSolutionsOpen(false)}
            >
              <button
                type="button"
                aria-expanded={isSolutionsOpen}
                aria-haspopup="true"
                onClick={() => setIsSolutionsOpen((value) => !value)}
                className={`group relative flex h-12 items-center gap-1.5 text-[13px] font-medium transition-colors ${
                  isScrolled
                    ? "text-slate-700 hover:text-emerald-800"
                    : "text-white/72 hover:text-white"
                }`}
              >
                โซลูชัน
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                    isSolutionsOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.7}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-[2px] origin-center rounded-full transition-transform duration-300 ${
                    pathname.startsWith("/features") || isSolutionsOpen
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  } ${isScrolled ? "bg-emerald-700" : "bg-white"}`}
                />
              </button>

              <div className="absolute left-1/2 top-full h-5 w-[760px] -translate-x-1/2" />

              <div
                className={`absolute left-1/2 top-[calc(100%+14px)] w-[760px] -translate-x-1/2 transition-all duration-250 ${
                  isSolutionsOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-[0_32px_90px_rgba(6,45,31,0.20)]">
                  <div className="grid grid-cols-[240px_1fr]">
                    <div className="flex min-h-[324px] flex-col bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.24),transparent_42%),linear-gradient(145deg,#0c2a20,#102f25_55%,#174336)] p-7 text-white">
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-100/65">
                        GreenFactory Insight
                      </p>
                      <h3 className="mt-6 text-[29px] font-medium leading-[1.14] tracking-[-0.05em]">
                        เชื่อมโยงข้อมูล
                        <span className="block text-emerald-200/72">
                          สู่การตัดสินใจ
                        </span>
                      </h3>
                      <p className="mt-5 text-[12px] leading-6 text-emerald-50/62">
                        รวมข้อมูลโรงงาน เครื่องจักร ทรัพยากร
                        และผลการดำเนินงานไว้ในแพลตฟอร์มเดียว
                      </p>
                      <Link
                        href="/features"
                        className="group mt-auto inline-flex items-center gap-2 text-[12px] font-medium text-white"
                      >
                        ดูภาพรวมระบบ
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-emerald-700/10">
                      {solutions.map((solution) => {
                        const Icon = solution.icon;
                        return (
                          <Link
                            key={solution.title}
                            href={solution.href}
                            className="group min-h-[162px] bg-[linear-gradient(180deg,#ffffff,#f8fcfa)] p-6 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_30px_rgba(16,80,58,0.08)]"
                          >
                            <div className="flex items-start justify-between">
                              <Icon
                                className="h-[19px] w-[19px] text-emerald-700"
                                strokeWidth={1.55}
                              />
                              <ArrowUpRight className="h-4 w-4 text-emerald-950/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-800" />
                            </div>
                            <h4 className="mt-7 text-[14px] font-medium tracking-[-0.02em] text-[#10201a]">
                              {solution.title}
                            </h4>
                            <p className="mt-2 text-[11px] leading-5 text-slate-500">
                              {solution.description}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {navigation.slice(2).map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
                light={!isScrolled}
              >
                {item.label}
              </DesktopNavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link
              href="/login"
              className={`relative text-[13px] font-medium transition-all duration-200 hover:-translate-y-px ${
                isScrolled
                  ? "text-black/56 hover:text-black"
                  : "text-white/66 hover:text-white"
              }`}
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/contact"
              className={`group inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-px ${
                isScrolled
                  ? "bg-[#1E7A49] text-white shadow-[0_8px_22px_rgba(30,122,73,0.22)] hover:bg-[#16663D] hover:shadow-[0_12px_28px_rgba(30,122,73,0.28)]"
                  : "bg-white text-[#123326] shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:bg-emerald-50"
              }`}
            >
              ติดต่อเรา
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="เปิดเมนู"
            aria-expanded={isMobileMenuOpen}
            className={`flex h-10 w-10 items-center justify-center transition-colors lg:hidden ${
              isScrolled ? "text-black" : "text-white"
            }`}
          >
            <Menu className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-emerald-700/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="เมนูมือถือ"
        className={`fixed right-0 top-0 z-[70] flex h-[100svh] w-[min(92%,420px)] flex-col bg-[#f5f5f3] transition-transform duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-black/10 px-6">
          <Link
            href="/"
            className="leading-none text-[17px] font-semibold tracking-[-0.045em] text-black"
          >
            GreenFactory{" "}
            <span className="font-semibold text-[#1E7A49]">Insight</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="ปิดเมนู"
            className="flex h-10 w-10 items-center justify-center text-black"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-7">
          <nav className="space-y-0 border-t border-black/10">
            <MobileNavLink href="/" active={pathname === "/"}>
              หน้าแรก
            </MobileNavLink>
            <MobileNavLink href="/about" active={pathname.startsWith("/about")}>
              เกี่ยวกับเรา
            </MobileNavLink>

            <div className="border-b border-black/10">
              <button
                type="button"
                onClick={() => setIsMobileSolutionsOpen((value) => !value)}
                className="flex w-full items-center justify-between py-5 text-left text-[16px] font-medium text-black"
              >
                โซลูชัน
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isMobileSolutionsOpen ? "rotate-180" : ""}`}
                  strokeWidth={1.6}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ${isMobileSolutionsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pb-5">
                    <Link
                      href="/features"
                      className="mb-2 block text-[12px] font-medium text-slate-500"
                    >
                      ดูภาพรวมระบบ
                    </Link>
                    {solutions.map((solution) => (
                      <Link
                        key={solution.title}
                        href={solution.href}
                        className="block py-2.5"
                      >
                        <p className="text-[14px] font-medium text-black">
                          {solution.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-black/42">
                          {solution.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <MobileNavLink href="/news" active={pathname.startsWith("/news")}>
              ข้อมูลเชิงลึก
            </MobileNavLink>
            <MobileNavLink
              href="/contact"
              active={pathname.startsWith("/contact")}
            >
              ติดต่อเรา
            </MobileNavLink>
          </nav>
        </div>

        <div className="border-t border-black/10 p-6">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center border border-black/15 text-[13px] font-medium text-black"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/contact"
            className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full bg-[#1E7A49] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(30,122,73,0.2)]"
          >
            ติดต่อเรา
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </>
  );
}

type DesktopNavLinkProps = {
  href: string;
  active: boolean;
  light: boolean;
  children: React.ReactNode;
};

function DesktopNavLink({
  href,
  active,
  light,
  children,
}: DesktopNavLinkProps) {
  return (
    <Link
      href={href}
      className={`group relative flex h-12 items-center text-[13px] font-medium transition-all duration-200 hover:-translate-y-px ${
        light
          ? "text-white/72 hover:text-white"
          : "text-slate-700 hover:text-emerald-800"
      }`}
    >
      {children}
      <span
        className={`absolute inset-x-0 bottom-0 h-[2px] origin-center rounded-full transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        } ${light ? "bg-white" : "bg-emerald-700"}`}
      />
    </Link>
  );
}

type MobileNavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

function MobileNavLink({ href, active, children }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between border-b border-black/10 py-5 text-[16px] font-medium ${
        active ? "text-black" : "text-black/68"
      }`}
    >
      {children}
      {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />}
    </Link>
  );
}
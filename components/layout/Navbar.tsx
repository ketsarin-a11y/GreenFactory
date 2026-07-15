"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronDown,
  Cpu,
  Database,
  Factory,
  Gauge,
  Menu,
  Network,
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
    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSolutionsOpen(false);
    setIsMobileSolutionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSolutionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            : "border-slate-200/70 bg-white/90 backdrop-blur-lg"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1480px] items-center justify-between px-5 transition-all duration-300 sm:px-8 lg:px-12 xl:px-16 ${
            isScrolled ? "h-[68px]" : "h-[76px]"
          }`}
        >
          <Link
            href="/"
            aria-label="GreenFactory Insight หน้าแรก"
            className="group flex shrink-0 items-center gap-3"
          >
            <BrandMark />

            <div className="hidden min-[390px]:block">
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="text-[15px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[17px]">
                  GreenFactory
                </span>
                <span className="text-[15px] font-semibold tracking-[-0.04em] text-emerald-700 sm:text-[17px]">
                  Insight
                </span>
              </div>

              <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-[8px]">
                Industrial Intelligence Platform
              </p>
            </div>
          </Link>

          <nav
            aria-label="เมนูหลัก"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 xl:flex"
          >
            {navigation.slice(0, 2).map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
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
                onClick={() => setIsSolutionsOpen((current) => !current)}
                className={`flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium transition-colors duration-200 ${
                  pathname.startsWith("/features") || isSolutionsOpen
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                โซลูชัน
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isSolutionsOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.8}
                />
              </button>

              <div className="absolute left-1/2 top-full h-5 w-[760px] -translate-x-1/2" />

              <div
                className={`absolute left-1/2 top-[calc(100%+12px)] w-[760px] -translate-x-1/2 transition-all duration-200 ${
                  isSolutionsOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                  <div className="grid grid-cols-[250px_1fr]">
                    <div className="flex min-h-[326px] flex-col border-r border-slate-200 bg-slate-950 p-7 text-white">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                        <Network className="h-5 w-5" strokeWidth={1.7} />
                      </span>

                      <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                        Connected operations
                      </p>

                      <h3 className="mt-3 text-[24px] font-semibold leading-[1.3] tracking-[-0.04em]">
                        เชื่อมโยงข้อมูล
                        <span className="block text-slate-300">
                          จากโรงงานสู่การตัดสินใจ
                        </span>
                      </h3>

                      <p className="mt-4 text-[12px] leading-6 text-slate-400">
                        รวมข้อมูลโรงงาน เครื่องจักร ทรัพยากร และผลการดำเนินงาน
                        ไว้ในแพลตฟอร์มเดียว
                      </p>

                      <Link
                        href="/features"
                        className="group mt-auto inline-flex items-center gap-2 text-[12px] font-medium text-white"
                      >
                        ดูภาพรวมระบบ
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-slate-200">
                      {solutions.map((solution) => {
                        const Icon = solution.icon;

                        return (
                          <Link
                            key={solution.title}
                            href={solution.href}
                            className="group min-h-[163px] bg-white p-5 transition-colors duration-200 hover:bg-slate-50"
                          >
                            <div className="flex items-start justify-between">
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                                <Icon
                                  className="h-[18px] w-[18px]"
                                  strokeWidth={1.7}
                                />
                              </span>

                              <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700" />
                            </div>

                            <h4 className="mt-5 text-[14px] font-semibold text-slate-900">
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

                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      รองรับข้อมูลหลายบริษัท หลายโรงงาน และหลายสิทธิ์ผู้ใช้งาน
                    </div>

                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Multi-tenant ready
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {navigation.slice(2).map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
              >
                {item.label}
              </DesktopNavLink>
            ))}
          </nav>

          <nav
            aria-label="เมนูหลักสำหรับแท็บเล็ต"
            className="hidden items-center gap-1 lg:flex xl:hidden"
          >
            <TabletNavLink href="/" active={pathname === "/"}>
              หน้าแรก
            </TabletNavLink>
            <TabletNavLink
              href="/features"
              active={pathname.startsWith("/features")}
            >
              โซลูชัน
            </TabletNavLink>
            <TabletNavLink
              href="/about"
              active={pathname.startsWith("/about")}
            >
              เกี่ยวกับเรา
            </TabletNavLink>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              href="/contact"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="เมนูมือถือ"
        className={`fixed right-0 top-0 z-[70] flex h-[100svh] w-[min(92%,420px)] flex-col overflow-hidden bg-white shadow-[-24px_0_70px_rgba(15,23,42,0.22)] transition-transform duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex min-h-[82px] items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <BrandMark />

            <div>
              <p className="text-[14px] font-semibold tracking-[-0.03em] text-slate-950">
                GreenFactory
                <span className="ml-1 text-emerald-700">Insight</span>
              </p>
              <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Industrial Intelligence Platform
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="ปิดเมนู"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            เมนูหลัก
          </p>

          <nav className="space-y-1">
            <MobileNavLink href="/" active={pathname === "/"}>
              หน้าแรก
            </MobileNavLink>

            <button
              type="button"
              onClick={() =>
                setIsMobileSolutionsOpen((current) => !current)
              }
              aria-expanded={isMobileSolutionsOpen}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-[14px] font-medium transition ${
                pathname.startsWith("/features")
                  ? "bg-slate-950 text-white"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              โซลูชัน

              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isMobileSolutionsOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.8}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isMobileSolutionsOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="ml-4 mt-2 space-y-1 border-l border-slate-200 pl-4">
                  <Link
                    href="/features"
                    className="group flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-[12px] font-medium text-slate-800"
                  >
                    ดูภาพรวมระบบ
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {solutions.map((solution) => {
                    const Icon = solution.icon;

                    return (
                      <Link
                        key={solution.title}
                        href={solution.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                          <Icon className="h-4 w-4" strokeWidth={1.7} />
                        </span>

                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-slate-800">
                            {solution.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">
                            {solution.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {navigation.slice(1).map((item) => (
              <MobileNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Building2 className="h-5 w-5" strokeWidth={1.7} />
              </span>

              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  Multi-tenant platform
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  รองรับหลายบริษัทและหลายโรงงาน
                </p>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-6 text-slate-500">
              แยกข้อมูล ผู้ใช้งาน โรงงาน และสิทธิ์การเข้าถึงของแต่ละองค์กรอย่างชัดเจน
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-5">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="flex h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700"
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              href="/contact"
              className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[13px] font-medium text-white transition hover:bg-emerald-700"
            >
              ติดต่อเรา
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function BrandMark() {
  return (
    <span className="group/logo relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-sm">
      <span className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500" />

      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="relative h-6 w-6 text-white transition-transform duration-200 group-hover/logo:scale-105"
        fill="none"
      >
        <path
          d="M6.5 23.5V13.5L12 10V13.5L17.5 10V13.5L23 10V23.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 23.5H25.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10 17.5H12.5M15 17.5H17.5M20 17.5H22.5"
          stroke="#34D399"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M23 10V6.5H26V23.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

type DesktopNavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

function DesktopNavLink({
  href,
  active,
  children,
}: DesktopNavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex h-10 items-center rounded-lg px-4 text-[13px] font-medium transition-colors duration-200 ${
        active
          ? "bg-slate-100 text-slate-950"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {children}
    </Link>
  );
}

type TabletNavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

function TabletNavLink({
  href,
  active,
  children,
}: TabletNavLinkProps) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3.5 py-2.5 text-[12px] font-medium transition-colors duration-200 ${
        active
          ? "bg-slate-100 text-slate-950"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {children}
    </Link>
  );
}

type MobileNavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

function MobileNavLink({
  href,
  active,
  children,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-4 py-3.5 text-[14px] font-medium transition ${
        active
          ? "bg-slate-950 text-white"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {children}
    </Link>
  );
}
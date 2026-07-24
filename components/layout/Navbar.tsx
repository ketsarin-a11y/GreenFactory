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
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const solutions = [
  {
    title: "การจัดการพลังงาน",
    description: "ติดตามพลังงาน ต้นทุน และประสิทธิภาพแบบเรียลไทม์",
    href: "/features#energy",
    icon: Gauge,
    index: "01",
    accent: "from-amber-400/25 via-orange-300/10 to-transparent",
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    title: "ข้อมูลการผลิต",
    description: "เชื่อมโยงเครื่องจักร สายการผลิต และสถานะการดำเนินงาน",
    href: "/features#production",
    icon: Factory,
    index: "02",
    accent: "from-sky-400/25 via-cyan-300/10 to-transparent",
    iconClass: "bg-sky-100 text-sky-700",
  },
  {
    title: "ทรัพยากรและการปล่อย",
    description: "จัดการทรัพยากร ของเสีย และข้อมูลการปล่อยอย่างเป็นระบบ",
    href: "/features#resources",
    icon: Database,
    index: "03",
    accent: "from-violet-400/25 via-fuchsia-300/10 to-transparent",
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    title: "การวิเคราะห์อัจฉริยะ",
    description: "ค้นหาแนวโน้ม ความผิดปกติ และโอกาสในการปรับปรุง",
    href: "/features#analytics",
    icon: BarChart3,
    index: "04",
    accent: "from-emerald-400/25 via-teal-300/10 to-transparent",
    iconClass: "bg-emerald-100 text-emerald-700",
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
  const [pointerX, setPointerX] = useState(50);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
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
        className={`fixed inset-x-0 top-0 z-50 px-3 transition-all duration-500 sm:px-5 lg:px-8 ${
          isScrolled ? "pt-3" : "pt-4 sm:pt-5"
        }`}
      >
        <div
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const nextX = ((event.clientX - bounds.left) / bounds.width) * 100;
            setPointerX(Math.max(0, Math.min(100, nextX)));
          }}
          className={`relative mx-auto flex max-w-[1420px] items-center justify-between overflow-visible rounded-[24px] border px-4 transition-all duration-500 sm:px-5 lg:px-6 ${
            isScrolled
              ? "h-[64px] border-slate-900/8 bg-white/88 shadow-[0_18px_55px_rgba(15,23,42,0.13)] backdrop-blur-2xl"
              : "h-[72px] border-white/15 bg-[#071711]/66 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-48 -translate-x-1/2 opacity-70 blur-2xl transition-[left] duration-150"
            style={{
              left: `${pointerX}%`,
              background:
                "radial-gradient(circle, rgba(110,231,183,0.22), transparent 68%)",
            }}
          />

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-12 top-0 h-px ${
              isScrolled
                ? "bg-gradient-to-r from-transparent via-white to-transparent"
                : "bg-gradient-to-r from-transparent via-white/45 to-transparent"
            }`}
          />

          <Link
            href="/"
            aria-label="GreenFactory Insight หน้าแรก"
            className="group relative z-10 flex shrink-0 items-center gap-3"
          >
            <div
              className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border transition-all duration-300 group-hover:-rotate-3 group-hover:scale-[1.04] ${
                isScrolled
                  ? "border-emerald-900/10 bg-[#0f3327] text-white shadow-[0_8px_22px_rgba(15,51,39,0.22)]"
                  : "border-white/14 bg-white/10 text-emerald-200 shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(110,231,183,0.44),transparent_50%)]" />
              <Factory className="relative h-[19px] w-[19px]" strokeWidth={1.8} />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0f3327] bg-emerald-400" />
            </div>

            <div className="hidden leading-none min-[390px]:block">
              <div
                className={`text-[17px] font-semibold tracking-[-0.04em] transition-colors sm:text-[19px] ${
                  isScrolled ? "text-[#0d1f18]" : "text-white"
                }`}
              >
                GreenFactory
                <span
                  className={`ml-1.5 ${
                    isScrolled ? "text-[#2d8a5a]" : "text-emerald-300"
                  }`}
                >
                  Insight
                </span>
              </div>
              <div
                className={`mt-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.17em] ${
                  isScrolled ? "text-slate-500" : "text-white/45"
                }`}
              >
                Industrial Intelligence
              </div>
            </div>
          </Link>

          <nav
            aria-label="เมนูหลัก"
            className={`absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-full border p-1.5 xl:flex ${
              isScrolled
                ? "border-slate-900/7 bg-slate-900/[0.035]"
                : "border-white/10 bg-white/[0.055]"
            }`}
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
                className={`group flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-all duration-300 ${
                  pathname.startsWith("/features") || isSolutionsOpen
                    ? isScrolled
                      ? "bg-white text-[#123326] shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                      : "bg-white text-[#123326] shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
                    : isScrolled
                      ? "text-slate-600 hover:bg-white/80 hover:text-[#123326]"
                      : "text-white/68 hover:bg-white/10 hover:text-white"
                }`}
              >
                โซลูชัน
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                    isSolutionsOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.8}
                />
              </button>

              <div className="absolute left-1/2 top-full h-6 w-[1040px] -translate-x-1/2" />

              <div
                className={`absolute left-1/2 top-[calc(100%+17px)] w-[1040px] -translate-x-1/2 transition-all duration-300 ${
                  isSolutionsOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-[0.985] opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/95 p-2 shadow-[0_36px_100px_rgba(7,30,21,0.24)] backdrop-blur-2xl">
                  <div className="grid min-h-[425px] grid-cols-[350px_1fr] overflow-hidden rounded-[26px] bg-[#eff7f2]">
                    <div className="relative flex flex-col overflow-hidden bg-[#0b2c21] p-9 text-white">
                      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-[65px]" />
                      <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-cyan-400/12 blur-[75px]" />
                      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:38px_38px]" />

                      <div className="relative flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                          <Sparkles className="h-3 w-3" />
                          Platform
                        </div>
                        <span className="flex items-center gap-2 text-[10px] font-medium text-white/45">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                          </span>
                          ONLINE
                        </span>
                      </div>

                      <div className="relative mt-10">
                        <p className="text-[12px] font-medium text-emerald-200/60">
                          Intelligence for modern factories
                        </p>
                        <h3 className="mt-4 text-[38px] font-medium leading-[1.08] tracking-[-0.055em]">
                          เปลี่ยนข้อมูล
                          <span className="block bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                            ให้กลายเป็นผลลัพธ์
                          </span>
                        </h3>
                        <p className="mt-5 max-w-[270px] text-[13px] leading-7 text-white/55">
                          รวมข้อมูลโรงงาน เครื่องจักร พลังงาน และสิ่งแวดล้อม
                          เพื่อให้ทุกการตัดสินใจรวดเร็วและแม่นยำยิ่งขึ้น
                        </p>
                      </div>

                      <div className="relative mt-auto">
                        <div className="mb-5 grid grid-cols-3 gap-2">
                          {[
                            ["24/7", "Monitoring"],
                            ["Real-time", "Insights"],
                            ["AI", "Analysis"],
                          ].map(([value, label]) => (
                            <div
                              key={label}
                              className="rounded-2xl border border-white/8 bg-white/[0.055] px-3 py-3"
                            >
                              <p className="text-[13px] font-semibold text-white">
                                {value}
                              </p>
                              <p className="mt-1 text-[9px] text-white/35">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>

                        <Link
                          href="/features"
                          className="group inline-flex items-center gap-3 text-[13px] font-semibold text-white"
                        >
                          สำรวจแพลตฟอร์ม
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#123326] transition-transform duration-300 group-hover:translate-x-1">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2">
                      {solutions.map((solution) => {
                        const Icon = solution.icon;

                        return (
                          <Link
                            key={solution.title}
                            href={solution.href}
                            className="group relative min-h-[200px] overflow-hidden rounded-[22px] border border-emerald-950/6 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-900/10 hover:shadow-[0_20px_40px_rgba(20,82,59,0.12)]"
                          >
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${solution.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                            />
                            <div className="relative flex items-start justify-between">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${solution.iconClass}`}
                              >
                                <Icon className="h-5 w-5" strokeWidth={1.7} />
                              </div>
                              <span className="text-[10px] font-semibold tracking-[0.18em] text-slate-300">
                                {solution.index}
                              </span>
                            </div>

                            <div className="relative mt-8">
                              <div className="flex items-center justify-between gap-3">
                                <h4 className="text-[17px] font-semibold tracking-[-0.025em] text-[#10201a]">
                                  {solution.title}
                                </h4>
                                <ArrowUpRight className="h-[18px] w-[18px] shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-emerald-700" />
                              </div>
                              <p className="mt-3 text-[12px] leading-6 text-slate-500">
                                {solution.description}
                              </p>
                            </div>

                            <div className="absolute bottom-0 left-6 right-6 h-px origin-left scale-x-0 bg-gradient-to-r from-emerald-500 to-cyan-400 transition-transform duration-500 group-hover:scale-x-100" />
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

          <div className="relative z-10 hidden items-center gap-3 lg:flex">
            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-2 2xl:flex ${
                isScrolled
                  ? "border-slate-900/8 bg-slate-900/[0.035]"
                  : "border-white/10 bg-white/[0.055]"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.13em] ${
                  isScrolled ? "text-slate-500" : "text-white/50"
                }`}
              >
                System online
              </span>
            </div>

            <Link
              href="/login"
              className={`rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:text-[#123326]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              href="/contact"
              className={`group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-5 text-[13px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                isScrolled
                  ? "bg-[#123326] text-white shadow-[0_10px_28px_rgba(18,51,38,0.22)]"
                  : "bg-white text-[#123326] shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              }`}
            >
              <span className="absolute inset-y-0 -left-12 w-10 skew-x-[-20deg] bg-white/30 blur-sm transition-all duration-700 group-hover:left-[115%]" />
              <span className="relative flex items-center gap-2">
                เริ่มต้นใช้งาน
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="เปิดเมนู"
            aria-expanded={isMobileMenuOpen}
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-colors lg:hidden ${
              isScrolled
                ? "border-slate-900/8 bg-slate-900/[0.035] text-[#10201a]"
                : "border-white/10 bg-white/[0.06] text-white"
            }`}
          >
            <Menu className="h-5 w-5" strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-[#06130e]/70 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="เมนูมือถือ"
        className={`fixed right-0 top-0 z-[70] flex h-[100svh] w-[min(92%,430px)] flex-col overflow-hidden bg-[#f7faf8] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-emerald-300/25 blur-[70px]" />

        <div className="relative flex h-[82px] items-center justify-between border-b border-black/7 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#123326] text-white">
              <Factory className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </div>
            <div className="leading-none">
              <p className="text-[17px] font-semibold tracking-[-0.04em] text-[#10201a]">
                GreenFactory{" "}
                <span className="text-[#2d8a5a]">Insight</span>
              </p>
              <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-400">
                Industrial Intelligence
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="ปิดเมนู"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white text-black shadow-sm"
          >
            <X className="h-5 w-5" strokeWidth={1.7} />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-6">
          <div className="mb-6 flex items-center justify-between rounded-[20px] bg-[#123326] px-4 py-4 text-white">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/65">
                Platform status
              </p>
              <p className="mt-1.5 text-[14px] font-medium">ระบบพร้อมใช้งาน</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Zap className="h-4 w-4 text-emerald-300" />
            </div>
          </div>

          <nav>
            <MobileNavLink href="/" active={pathname === "/"}>
              หน้าแรก
            </MobileNavLink>

            <MobileNavLink href="/about" active={pathname.startsWith("/about")}>
              เกี่ยวกับเรา
            </MobileNavLink>

            <div className="border-b border-black/8">
              <button
                type="button"
                onClick={() => setIsMobileSolutionsOpen((value) => !value)}
                className="flex w-full items-center justify-between py-5 text-left text-[16px] font-semibold text-[#10201a]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-slate-300">
                    03
                  </span>
                  โซลูชัน
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/[0.045]">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isMobileSolutionsOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.7}
                  />
                </span>
              </button>

              <div
                className={`grid transition-all duration-500 ${
                  isMobileSolutionsOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="grid gap-2 pb-5">
                    {solutions.map((solution) => {
                      const Icon = solution.icon;

                      return (
                        <Link
                          key={solution.title}
                          href={solution.href}
                          className="flex items-center gap-3 rounded-[18px] border border-black/6 bg-white p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${solution.iconClass}`}
                          >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#10201a]">
                              {solution.title}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              {solution.description}
                            </p>
                          </div>
                          <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
                        </Link>
                      );
                    })}

                    <Link
                      href="/features"
                      className="mt-1 flex items-center justify-between rounded-[18px] bg-[#eaf4ee] px-4 py-4 text-[12px] font-semibold text-[#245f43]"
                    >
                      ดูภาพรวมทั้งหมด
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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

        <div className="relative border-t border-black/7 bg-white/70 p-5 backdrop-blur-xl">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full border border-black/10 bg-white text-[13px] font-semibold text-[#10201a]"
          >
            เข้าสู่ระบบ
          </Link>

          <Link
            href="/contact"
            className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full bg-[#123326] text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(18,51,38,0.22)]"
          >
            เริ่มต้นใช้งาน
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
      className={`relative flex h-10 items-center rounded-full px-4 text-[14px] font-medium transition-all duration-300 ${
        active
          ? light
            ? "bg-white text-[#123326] shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
            : "bg-white text-[#123326] shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
          : light
            ? "text-white/68 hover:bg-white/10 hover:text-white"
            : "text-slate-600 hover:bg-white/80 hover:text-[#123326]"
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

function MobileNavLink({ href, active, children }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between border-b border-black/8 py-5 text-[16px] font-semibold ${
        active ? "text-[#10201a]" : "text-[#10201a]/62"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`text-[10px] font-semibold ${
            active ? "text-emerald-600" : "text-slate-300"
          }`}
        >
          {href === "/"
            ? "01"
            : href === "/about"
              ? "02"
              : href === "/news"
                ? "04"
                : "05"}
        </span>
        {children}
      </span>

      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          active
            ? "bg-[#123326] text-white"
            : "bg-slate-900/[0.045] text-slate-400 group-hover:bg-[#123326] group-hover:text-white"
        }`}
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
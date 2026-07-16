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
<<<<<<< HEAD
    const onPointerDown = (event: MouseEvent) => {
=======
    const handleOutsideClick = (event: MouseEvent) => {
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSolutionsOpen(false);
      }
    };

<<<<<<< HEAD
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
=======
    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
<<<<<<< HEAD
=======

>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

<<<<<<< HEAD
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
=======
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
<<<<<<< HEAD
            ? "border-emerald-950/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.94),rgba(248,252,250,0.92),rgba(255,255,255,0.94))] shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
            : "border-white/15 bg-[linear-gradient(90deg,rgba(4,18,13,0.60),rgba(5,25,18,0.34),rgba(4,18,13,0.60))] backdrop-blur-xl"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-all duration-300 sm:px-8 lg:px-12 xl:px-16 ${
            isScrolled ? "h-[58px]" : "h-[66px]"
=======
            ? "border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            : "border-slate-200/70 bg-white/90 backdrop-blur-lg"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1480px] items-center justify-between px-5 transition-all duration-300 sm:px-8 lg:px-12 xl:px-16 ${
            isScrolled ? "h-[68px]" : "h-[76px]"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          }`}
        >
          <Link
            href="/"
            aria-label="GreenFactory Insight หน้าแรก"
<<<<<<< HEAD
            className="shrink-0"
          >
            <div className="leading-none">
              <div
                className={`text-[18px] font-semibold tracking-[-0.045em] transition-colors sm:text-[21px] ${
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
                className={`mt-1 hidden text-[10px] font-medium tracking-[0.08em] transition-colors min-[420px]:block ${
                  isScrolled ? "text-emerald-950/42" : "text-white/46"
                }`}
              >
                Industrial Intelligence Platform
              </div>
              <div
                className={`mt-1.5 h-[2px] w-14 rounded-full transition-colors ${isScrolled ? "bg-gradient-to-r from-emerald-600 to-teal-400" : "bg-gradient-to-r from-emerald-300 to-cyan-300"}`}
              />
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
            </div>
          </Link>

          <nav
            aria-label="เมนูหลัก"
<<<<<<< HEAD
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 xl:flex"
=======
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 xl:flex"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          >
            {navigation.slice(0, 2).map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
<<<<<<< HEAD
                light={!isScrolled}
=======
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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
<<<<<<< HEAD
                onClick={() => setIsSolutionsOpen((value) => !value)}
                className={`group relative flex h-12 items-center gap-2 text-[15px] font-medium transition-colors ${
                  isScrolled
                    ? "text-slate-700 hover:text-emerald-800"
                    : "text-white/72 hover:text-white"
=======
                onClick={() => setIsSolutionsOpen((current) => !current)}
                className={`flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium transition-colors duration-200 ${
                  pathname.startsWith("/features") || isSolutionsOpen
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                }`}
              >
                โซลูชัน
                <ChevronDown
<<<<<<< HEAD
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

              <div className="absolute left-1/2 top-full h-5 w-[1000px] -translate-x-1/2" />

              <div
                className={`absolute left-1/2 top-[calc(100%+12px)] w-[1000px] -translate-x-1/2 transition-all duration-250 ${
                  isSolutionsOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-[30px] border border-emerald-950/10 bg-white shadow-[0_32px_90px_rgba(6,45,31,0.20)]">
                  <div className="grid grid-cols-[320px_1fr]">
                    <div className="flex min-h-[400px] flex-col bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.24),transparent_42%),linear-gradient(145deg,#0c2a20,#102f25_55%,#174336)] p-9 text-white">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-100/65">
                        GreenFactory Insight
                      </p>
                      <h3 className="mt-8 text-[34px] font-medium leading-[1.14] tracking-[-0.05em]">
                        เชื่อมโยงข้อมูล
                        <span className="block text-emerald-200/72">
                          สู่การตัดสินใจ
                        </span>
                      </h3>
                      <p className="mt-6 text-[13px] leading-7 text-emerald-50/62">
                        รวมข้อมูลโรงงาน เครื่องจักร ทรัพยากร
                        และผลการดำเนินงานไว้ในแพลตฟอร์มเดียว
                      </p>
                      <Link
                        href="/features"
                        className="group mt-auto inline-flex items-center gap-2.5 text-[13px] font-medium text-white"
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                      >
                        ดูภาพรวมระบบ
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>

<<<<<<< HEAD
                    <div className="grid grid-cols-2 gap-px bg-emerald-700/10">
                      {solutions.map((solution) => {
                        const Icon = solution.icon;
=======
                    <div className="grid grid-cols-2 gap-px bg-slate-200">
                      {solutions.map((solution) => {
                        const Icon = solution.icon;

>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                        return (
                          <Link
                            key={solution.title}
                            href={solution.href}
<<<<<<< HEAD
                            className="group min-h-[200px] bg-[linear-gradient(180deg,#ffffff,#f8fcfa)] p-8 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_30px_rgba(16,80,58,0.08)]"
                          >
                            <div className="flex items-start justify-between">
                              <Icon
                                className="h-7 w-7 text-emerald-700"
                                strokeWidth={1.55}
                              />
                              <ArrowUpRight className="h-[18px] w-[18px] text-emerald-950/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-800" />
                            </div>
                            <h4 className="mt-10 text-[17px] font-medium tracking-[-0.02em] text-[#10201a]">
                              {solution.title}
                            </h4>
                            <p className="mt-3 text-[13px] leading-6 text-slate-500">
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                              {solution.description}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
<<<<<<< HEAD
=======

                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      รองรับข้อมูลหลายบริษัท หลายโรงงาน และหลายสิทธิ์ผู้ใช้งาน
                    </div>

                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Multi-tenant ready
                    </span>
                  </div>
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                </div>
              </div>
            </div>

            {navigation.slice(2).map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
<<<<<<< HEAD
                light={!isScrolled}
=======
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
              >
                {item.label}
              </DesktopNavLink>
            ))}
          </nav>

<<<<<<< HEAD
          <div className="hidden items-center gap-5 lg:flex">
            <Link
              href="/login"
              className={`relative text-[14px] font-medium transition-all duration-200 hover:-translate-y-px ${
                isScrolled
                  ? "text-black/56 hover:text-black"
                  : "text-white/66 hover:text-white"
              }`}
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/contact"
              className={`group inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-semibold transition-all duration-200 hover:-translate-y-px ${
                isScrolled
                  ? "bg-[#1E7A49] text-white shadow-[0_8px_22px_rgba(30,122,73,0.22)] hover:bg-[#16663D] hover:shadow-[0_12px_28px_rgba(30,122,73,0.28)]"
                  : "bg-white text-[#123326] shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:bg-emerald-50"
              }`}
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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
<<<<<<< HEAD
            className={`flex h-10 w-10 items-center justify-center transition-colors lg:hidden ${
              isScrolled ? "text-black" : "text-white"
            }`}
          >
            <Menu className="h-5 w-5" strokeWidth={1.6} />
=======
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} />
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
<<<<<<< HEAD
        className={`fixed inset-0 z-[60] bg-emerald-700/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
=======
        className={`fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          isMobileMenuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="เมนูมือถือ"
<<<<<<< HEAD
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
=======
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

>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="ปิดเมนู"
<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                </div>
              </div>
            </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
        </div>
      </aside>
    </>
  );
}

<<<<<<< HEAD
type DesktopNavLinkProps = {
  href: string;
  active: boolean;
  light: boolean;
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
  children: React.ReactNode;
};

function DesktopNavLink({
  href,
  active,
<<<<<<< HEAD
  light,
=======
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
  children,
}: DesktopNavLinkProps) {
  return (
    <Link
      href={href}
<<<<<<< HEAD
      className={`group relative flex h-12 items-center text-[15px] font-medium transition-all duration-200 hover:-translate-y-px ${
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
    </Link>
  );
}

type MobileNavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
    </Link>
  );
}
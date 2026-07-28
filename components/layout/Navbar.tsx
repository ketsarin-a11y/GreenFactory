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

const navigation = [
  { label: "หน้าแรก", href: "/" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ข้อมูลเชิงลึก", href: "/news" },
  { label: "ติดต่อเรา", href: "/contact" },
];

const solutions = [
  {
    title: "การจัดการพลังงาน",
    description: "ติดตามการใช้พลังงาน ต้นทุน และประสิทธิภาพของโรงงาน",
    href: "/features#energy",
    icon: Gauge,
    iconClass: "bg-amber-50 text-amber-700",
  },
  {
    title: "ข้อมูลการผลิต",
    description: "เชื่อมโยงเครื่องจักร สายการผลิต และสถานะการดำเนินงาน",
    href: "/features#production",
    icon: Factory,
    iconClass: "bg-sky-50 text-sky-700",
  },
  {
    title: "ทรัพยากรและการปล่อย",
    description: "จัดการทรัพยากร ของเสีย และข้อมูลการปล่อยอย่างเป็นระบบ",
    href: "/features#resources",
    icon: Database,
    iconClass: "bg-violet-50 text-violet-700",
  },
  {
    title: "การวิเคราะห์ข้อมูล",
    description: "ดูแนวโน้ม เปรียบเทียบผลลัพธ์ และหาโอกาสในการปรับปรุง",
    href: "/features#analytics",
    icon: BarChart3,
    iconClass: "bg-emerald-50 text-emerald-700",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsSolutionsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileSolutionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSolutionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const darkHeader = pathname === "/" && !isScrolled;

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isScrolled ? "py-3" : "py-4",
        )}
      >
        <div
          className={cx(
            "mx-auto flex h-16 max-w-[1380px] items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-7",
            isScrolled
              ? "rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              : pathname === "/"
                ? "border-transparent bg-transparent"
                : "rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl",
          )}
        >
          <Link
            href="/"
            aria-label="GreenFactory Insight หน้าแรก"
            className="group flex shrink-0 items-center gap-3"
          >
            <span
              className={cx(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300",
                darkHeader
                  ? "bg-white text-[#173d2d]"
                  : "bg-[#173d2d] text-white",
              )}
            >
              <Factory className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </span>

            <span className="hidden min-[390px]:block">
              <span
                className={cx(
                  "block text-[18px] font-semibold leading-none tracking-[-0.04em] transition-colors duration-300",
                  darkHeader ? "text-white" : "text-[#14241d]",
                )}
              >
                GreenFactory
                <span
                  className={cx(
                    "ml-1.5",
                    darkHeader ? "text-emerald-300" : "text-[#317552]",
                  )}
                >
                  Insight
                </span>
              </span>

              <span
                className={cx(
                  "mt-1.5 block text-[9px] font-medium uppercase tracking-[0.16em] transition-colors duration-300",
                  darkHeader ? "text-white/45" : "text-slate-400",
                )}
              >
                Industrial Intelligence
              </span>
            </span>
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
                darkHeader={darkHeader}
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
                onClick={() => setIsSolutionsOpen((value) => !value)}
                aria-expanded={isSolutionsOpen}
                aria-haspopup="true"
                className={cx(
                  "flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-[14px] font-medium transition-colors",
                  pathname.startsWith("/features") || isSolutionsOpen
                    ? darkHeader
                      ? "bg-white/12 text-white"
                      : "bg-slate-100 text-[#173d2d]"
                    : darkHeader
                      ? "text-white/72 hover:bg-white/8 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#173d2d]",
                )}
              >
                โซลูชัน
                <ChevronDown
                  className={cx(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isSolutionsOpen && "rotate-180",
                  )}
                  strokeWidth={1.8}
                />
              </button>

              <div className="absolute left-1/2 top-full h-4 w-[760px] -translate-x-1/2" />

              <div
                className={cx(
                  "absolute left-1/2 top-[calc(100%+12px)] w-[760px] -translate-x-1/2 transition-all duration-200",
                  isSolutionsOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0",
                )}
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.15)]">
                  <div className="grid grid-cols-[230px_1fr]">
                    <div className="flex flex-col bg-[#173d2d] p-6 text-white">
                      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-emerald-200/70">
                        GreenFactory Platform
                      </p>

                      <h3 className="mt-5 text-[24px] font-semibold leading-[1.25] tracking-[-0.035em]">
                        ข้อมูลโรงงาน
                        <br />
                        ที่ดูง่ายและใช้ได้จริง
                      </h3>

                      <p className="mt-4 text-[12px] leading-6 text-white/55">
                        รวมข้อมูลสำคัญไว้ในระบบเดียว เพื่อช่วยให้ทีมทำงานและตัดสินใจได้เร็วขึ้น
                      </p>

                      <Link
                        href="/features"
                        className="mt-auto flex items-center gap-2 pt-8 text-[12px] font-semibold text-white"
                      >
                        ดูภาพรวมแพลตฟอร์ม
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-slate-200">
                      {solutions.map((solution) => {
                        const Icon = solution.icon;

                        return (
                          <Link
                            key={solution.title}
                            href={solution.href}
                            className="group bg-white p-5 transition-colors hover:bg-slate-50"
                          >
                            <div className="flex items-start gap-4">
                              <span
                                className={cx(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                  solution.iconClass,
                                )}
                              >
                                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                              </span>

                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="text-[14px] font-semibold text-slate-900">
                                    {solution.title}
                                  </h4>

                                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#317552]" />
                                </div>

                                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                                  {solution.description}
                                </p>
                              </div>
                            </div>
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
                darkHeader={darkHeader}
              >
                {item.label}
              </DesktopNavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className={cx(
                "rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                darkHeader
                  ? "text-white/70 hover:text-white"
                  : "text-slate-600 hover:text-[#173d2d]",
              )}
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              href="/contact"
              className={cx(
                "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all hover:-translate-y-0.5",
                darkHeader
                  ? "bg-white text-[#173d2d] hover:bg-emerald-50"
                  : "bg-[#173d2d] text-white hover:bg-[#102f22]",
              )}
            >
              เริ่มต้นใช้งาน
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.9} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="เปิดเมนู"
            aria-expanded={isMobileMenuOpen}
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors lg:hidden",
              darkHeader
                ? "border-white/15 bg-white/8 text-white"
                : "border-slate-200 bg-white text-slate-800",
            )}
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
        className={cx(
          "fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          isMobileMenuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label="เมนูมือถือ"
        className={cx(
          "fixed right-0 top-0 z-[70] flex h-[100svh] w-[min(90%,400px)] flex-col bg-white transition-transform duration-300 lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-200 px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173d2d] text-white">
              <Factory className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </span>

            <span>
              <span className="block text-[17px] font-semibold leading-none tracking-[-0.04em] text-[#14241d]">
                GreenFactory <span className="text-[#317552]">Insight</span>
              </span>

              <span className="mt-1.5 block text-[8px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Industrial Intelligence
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="ปิดเมนู"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <nav>
            <MobileNavLink href="/" active={pathname === "/"}>
              หน้าแรก
            </MobileNavLink>

            <MobileNavLink
              href="/about"
              active={pathname.startsWith("/about")}
            >
              เกี่ยวกับเรา
            </MobileNavLink>

            <div className="border-b border-slate-200">
              <button
                type="button"
                onClick={() =>
                  setIsMobileSolutionsOpen((value) => !value)
                }
                className="flex w-full items-center justify-between py-4 text-left text-[15px] font-medium text-slate-800"
              >
                โซลูชัน

                <ChevronDown
                  className={cx(
                    "h-4 w-4 text-slate-400 transition-transform",
                    isMobileSolutionsOpen && "rotate-180",
                  )}
                  strokeWidth={1.8}
                />
              </button>

              <div
                className={cx(
                  "grid transition-all duration-300",
                  isMobileSolutionsOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="space-y-2 pb-4">
                    {solutions.map((solution) => {
                      const Icon = solution.icon;

                      return (
                        <Link
                          key={solution.title}
                          href={solution.href}
                          className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                        >
                          <span
                            className={cx(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              solution.iconClass,
                            )}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.8} />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-semibold text-slate-800">
                              {solution.title}
                            </span>

                            <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                              {solution.description}
                            </span>
                          </span>

                          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" />
                        </Link>
                      );
                    })}

                    <Link
                      href="/features"
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-[12px] font-semibold text-[#317552]"
                    >
                      ดูโซลูชันทั้งหมด
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <MobileNavLink
              href="/news"
              active={pathname.startsWith("/news")}
            >
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

        <div className="border-t border-slate-200 p-5">
          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700"
          >
            เข้าสู่ระบบ
          </Link>

          <Link
            href="/contact"
            className="mt-2.5 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#173d2d] text-[13px] font-semibold text-white"
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
  darkHeader: boolean;
  children: React.ReactNode;
};

function DesktopNavLink({
  href,
  active,
  darkHeader,
  children,
}: DesktopNavLinkProps) {
  return (
    <Link
      href={href}
      className={cx(
        "flex h-10 items-center rounded-lg px-3.5 text-[14px] font-medium transition-colors",
        active
          ? darkHeader
            ? "bg-white/12 text-white"
            : "bg-slate-100 text-[#173d2d]"
          : darkHeader
            ? "text-white/72 hover:bg-white/8 hover:text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#173d2d]",
      )}
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
      className={cx(
        "group flex items-center justify-between border-b border-slate-200 py-4 text-[15px] font-medium transition-colors",
        active ? "text-[#173d2d]" : "text-slate-600",
      )}
    >
      <span>{children}</span>

      <ArrowUpRight
        className={cx(
          "h-4 w-4 transition-colors",
          active
            ? "text-[#317552]"
            : "text-slate-300 group-hover:text-[#317552]",
        )}
      />
    </Link>
  );
}
"use client";

import {
  Bell,
  Boxes,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  DatabaseBackup,
  Factory,
  Gauge,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  Ruler,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Waves,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";

type PlatformShellProps = {
  children: ReactNode;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Gauge;
  color: string;
  activeColor: string;
};

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

const navigationSections: NavigationSection[] = [
  {
    label: "ภาพรวม",
    items: [
      {
        label: "แดชบอร์ด",
        href: "/platform/dashboard",
        icon: Gauge,
        color: "text-[#22a06b]",
        activeColor: "bg-[#e8fbf1]",
      },
    ],
  },
  {
    label: "การจัดการบริษัท",
    items: [
      {
        label: "จัดการข้อมูลบริษัท",
        href: "/platform/companies",
        icon: Building2,
        color: "text-[#4f7df3]",
        activeColor: "bg-[#edf2ff]",
      },
    ],
  },
  {
    label: "ผู้ใช้งานและสิทธิ์",
    items: [
      {
        label: "จัดการผู้ใช้งาน",
        href: "/platform/users",
        icon: Users,
        color: "text-[#8b5cf6]",
        activeColor: "bg-[#f3edff]",
      },
      {
        label: "กำหนดสิทธิ์การใช้งาน",
        href: "/platform/roles",
        icon: ShieldCheck,
        color: "text-[#ef7c45]",
        activeColor: "bg-[#fff2e8]",
      },
    ],
  },
  {
    label: "ข้อมูลมาตรฐานกลาง",
    items: [
      {
        label: "ประเภทเครื่องจักร",
        href: "/platform/master-data/machine-types",
        icon: Factory,
        color: "text-[#ef6c57]",
        activeColor: "bg-[#fff0ec]",
      },
      {
        label: "ประเภทเซนเซอร์",
        href: "/platform/master-data/sensor-types",
        icon: Waves,
        color: "text-[#06a5a5]",
        activeColor: "bg-[#e7fbfb]",
      },
      {
        label: "ประเภททรัพยากร",
        href: "/platform/master-data/resource-types",
        icon: Zap,
        color: "text-[#f59e0b]",
        activeColor: "bg-[#fff6df]",
      },
      {
        label: "หมวดหมู่ทรัพยากร",
        href: "/platform/master-data/resource-categories",
        icon: Boxes,
        color: "text-[#3b82f6]",
        activeColor: "bg-[#eaf3ff]",
      },
      {
        label: "หน่วยวัด",
        href: "/platform/master-data/units",
        icon: Ruler,
        color: "text-[#64748b]",
        activeColor: "bg-[#eef2f6]",
      },
      {
        label: "ค่า Emission Factor",
        href: "/platform/master-data/emission-factors",
        icon: Leaf,
        color: "text-[#16a34a]",
        activeColor: "bg-[#eaf8ee]",
      },
    ],
  },
  {
    label: "การติดตามระบบ",
    items: [
      {
        label: "Audit Log",
        href: "/platform/audit-logs",
        icon: ClipboardList,
        color: "text-[#ec4899]",
        activeColor: "bg-[#fdeef6]",
      },
      {
        label: "Login Log",
        href: "/platform/login-logs",
        icon: CircleUserRound,
        color: "text-[#5b7cfa]",
        activeColor: "bg-[#edf1ff]",
      },
      {
        label: "สำรองและกู้คืนข้อมูล",
        href: "/platform/backups",
        icon: DatabaseBackup,
        color: "text-[#14b8a6]",
        activeColor: "bg-[#e8fbf8]",
      },
    ],
  },
  {
    label: "การตั้งค่า",
    items: [
      {
        label: "ตั้งค่าระบบ",
        href: "/platform/settings",
        icon: Settings,
        color: "text-[#64748b]",
        activeColor: "bg-[#eef2f6]",
      },
    ],
  },
];

const pageTitles: Array<[string, string]> = [
  ["/platform/dashboard", "แดชบอร์ด"],
  ["/platform/companies", "จัดการข้อมูลบริษัท"],
  ["/platform/users", "จัดการผู้ใช้งาน"],
  ["/platform/roles", "กำหนดสิทธิ์การใช้งาน"],
  ["/platform/master-data/machine-types", "ประเภทเครื่องจักร"],
  ["/platform/master-data/sensor-types", "ประเภทเซนเซอร์"],
  ["/platform/master-data/resource-types", "ประเภททรัพยากร"],
  ["/platform/master-data/resource-categories", "หมวดหมู่ทรัพยากร"],
  ["/platform/master-data/units", "หน่วยวัด"],
  ["/platform/master-data/emission-factors", "ค่า Emission Factor"],
  ["/platform/audit-logs", "Audit Log"],
  ["/platform/login-logs", "Login Log"],
  ["/platform/backups", "สำรองและกู้คืนข้อมูล"],
  ["/platform/settings", "ตั้งค่าระบบ"],
];

function getPageTitle(pathname: string) {
  const matched = pageTitles.find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return matched?.[1] ?? "Platform Administrator";
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PlatformShell({
  children,
  user,
}: PlatformShellProps) {
  const pathname = usePathname();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || "Platform Admin";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "PA";

  const pageTitle = getPageTitle(pathname);

  const sidebarWidthClass = collapsed ? "lg:w-[92px]" : "lg:w-[304px]";
  const contentPaddingClass = collapsed ? "lg:pl-[92px]" : "lg:pl-[304px]";

  const currentBreadcrumb = useMemo(
    () => ["Platform Administrator", pageTitle],
    [pageTitle],
  );

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/reset-session", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ecfff3_0,_#f8fbf9_34%,_#f4f7f6_100%)] text-[#1f2d25]">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#102218]/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[304px] flex-col border-r border-[#e7eee9] bg-white/95 shadow-[18px_0_50px_rgba(31,71,48,0.07)] backdrop-blur-2xl transition-[width,transform] duration-300 ${sidebarWidthClass} ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`flex h-[84px] items-center border-b border-[#edf2ee] ${
            collapsed ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          <Link
            href="/platform/dashboard"
            className={`flex min-w-0 items-center ${
              collapsed ? "justify-center" : "gap-3.5"
            }`}
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#34d399] via-[#20b26b] to-[#138754] text-white shadow-[0_16px_30px_rgba(30,177,101,0.25)]">
              <span className="absolute inset-0 bg-white/10" />
              <Leaf className="relative h-[22px] w-[22px]" strokeWidth={2.1} />
            </span>

            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-[18px] font-extrabold tracking-[-0.03em] text-[#1c2c22]">
                  GreenFactory
                </span>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#1ea563]">
                  Insight
                </span>
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="ปิดเมนู"
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#718078] transition hover:bg-[#f0f7f2] hover:text-[#1f8e59] lg:hidden"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className={collapsed ? "px-3 py-4" : "px-4 py-4"}>
          <div
            className={`relative overflow-hidden border border-[#e4ece7] bg-[linear-gradient(135deg,#ffffff_0%,#f1fff6_55%,#eff7ff_100%)] shadow-[0_12px_34px_rgba(42,94,62,0.06)] ${
              collapsed
                ? "flex h-14 items-center justify-center rounded-[20px] px-2"
                : "rounded-[20px] px-4 py-4"
            }`}
          >
            <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#bfead0]/35 blur-2xl" />
            <span className="absolute -bottom-10 left-10 h-20 w-20 rounded-full bg-[#c9dcff]/35 blur-2xl" />

            {collapsed ? (
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dff8e9] to-[#dcecff] text-[#1e9f62] shadow-sm">
                <ShieldCheck className="h-[20px] w-[20px]" strokeWidth={1.9} />
              </span>
            ) : (
              <div className="relative flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dff8e9] to-[#dcecff] text-[#1e9f62] shadow-sm">
                  <ShieldCheck className="h-[20px] w-[20px]" strokeWidth={1.9} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f8f86]">
                    Platform Administrator
                  </span>
                  <span className="mt-1 block truncate text-[13px] font-bold text-[#26372d]">
                    ศูนย์ควบคุมระบบส่วนกลาง
                  </span>
                  <span className="mt-1 block text-[10px] font-medium text-[#93a098]">
                    จัดการบริษัท ผู้ใช้ และข้อมูลมาตรฐาน
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:thin]">
          <div className="space-y-5">
            {navigationSections.map((section) => (
              <section key={section.label}>
                {!collapsed && (
                  <p className="mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#a2ada6]">
                    {section.label}
                  </p>
                )}

                <div className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isPathActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex min-h-[52px] items-center overflow-hidden rounded-[18px] transition-all ${
                          collapsed ? "justify-center px-2" : "gap-3.5 px-3.5"
                        } ${
                          active
                            ? `${item.activeColor} font-bold text-[#174c34] shadow-[inset_0_0_0_1px_rgba(35,120,76,0.06)]`
                            : "text-[#5f6f65] hover:bg-[#f4f8f6] hover:text-[#267b54]"
                        }`}
                      >
                        {active && !collapsed && (
                          <span className="absolute left-0 top-1/2 h-7 w-[4px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#34d399] to-[#16a34a]" />
                        )}

                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] transition ${
                            active
                              ? `bg-white ${item.color} shadow-[0_7px_18px_rgba(29,150,87,0.12)]`
                              : `${item.color} bg-white/70 group-hover:bg-white group-hover:shadow-sm`
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                        </span>

                        {!collapsed && (
                          <span className="truncate text-[13px] font-semibold">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-[#edf2ee] p-3">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className={`hidden min-h-[42px] w-full items-center rounded-[14px] text-[#89968e] transition hover:bg-[#f3f8f5] hover:text-[#258c5b] lg:flex ${
              collapsed ? "justify-center" : "gap-3 px-2.5"
            }`}
          >
            {collapsed ? (
              <ChevronRight className="h-[18px] w-[18px]" />
            ) : (
              <>
                <ChevronLeft className="h-[18px] w-[18px]" />
                <span className="text-[11px] font-semibold">ซ่อนเมนู</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-300 ${contentPaddingClass}`}
      >
        <header className="sticky top-0 z-30 flex h-[82px] items-center border-b border-[#e5ece7] bg-white/80 px-5 shadow-[0_2px_16px_rgba(35,75,49,0.04)] backdrop-blur-2xl sm:px-7 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="เปิดเมนู"
            className="mr-3 flex h-11 w-11 items-center justify-center rounded-[16px] text-[#5f7066] transition hover:bg-[#eef7f1] hover:text-[#1f965d] lg:hidden"
          >
            <Menu className="h-[20px] w-[20px]" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-extrabold tracking-[-0.03em] text-[#24342b]">
              {pageTitle}
            </h1>

            <div className="mt-1.5 hidden items-center gap-1.5 text-[11px] font-medium text-[#8e9b93] sm:flex">
              {currentBreadcrumb.map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-[#c1cac4]">/</span>}
                  <span className="truncate">{item}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <button
              type="button"
              className="hidden min-w-[270px] items-center gap-3 rounded-[18px] border border-[#e1e9e4] bg-[#f8fbf9] px-4 py-3 text-left transition hover:border-[#cfe0d5] hover:bg-white xl:flex"
            >
              <Search className="h-[18px] w-[18px] text-[#8b9890]" strokeWidth={1.8} />
              <span className="text-[12px] text-[#94a098]">
                ค้นหาเมนูหรือข้อมูล...
              </span>
              <span className="ml-auto rounded-[10px] border border-[#dfe7e2] bg-white px-2.5 py-1 text-[9px] font-bold text-[#8f9a93] shadow-sm">
                Ctrl K
              </span>
            </button>

            <Link
              href="/platform/notifications"
              aria-label="การแจ้งเตือน"
              className="relative flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#dfe8e2] bg-white text-[#607168] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9ddd0] hover:bg-[#f2faf5] hover:text-[#1f925a]"
            >
              <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
              <span className="absolute right-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#ff7a7a] to-[#f04444] ring-2 ring-white" />
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((current) => !current)}
                aria-expanded={profileMenuOpen}
                aria-label="เปิดเมนูผู้ใช้"
                className="flex items-center gap-3 rounded-[18px] px-2 py-1.5 transition hover:bg-[#f1f6f3] sm:px-2.5 sm:py-2"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f4eb] text-[11px] font-extrabold text-[#176c48]">
                  {initials}
                </span>

                <span className="hidden text-left md:block">
                  <span className="block max-w-[150px] truncate text-[12px] font-bold text-[#314139]">
                    {fullName}
                  </span>
                  <span className="mt-1 block text-[10px] font-medium text-[#8b9890]">
                    Platform Admin
                  </span>
                </span>

                <ChevronDown
                  className={`hidden h-4 w-4 text-[#87938c] transition-transform sm:block ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="ปิดเมนูผู้ใช้"
                    onClick={() => setProfileMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[248px] rounded-[16px] border border-[#dfe8e2] bg-white p-2 shadow-[0_18px_48px_rgba(29,62,41,0.16)]">
                    <div className="border-b border-[#edf2ee] px-3 py-3">
                      <p className="truncate text-[13px] font-bold text-[#2b3b31]">
                        {fullName}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[#8a9790]">
                        {user.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="mt-1 flex min-h-[44px] w-full items-center gap-3 rounded-[12px] px-3 text-left text-[12px] font-semibold text-[#405047] transition hover:bg-[#f2f7f4]"
                    >
                      <CircleUserRound className="h-[18px] w-[18px]" strokeWidth={1.8} />
                      บัญชีผู้ใช้งาน
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex min-h-[44px] w-full items-center gap-3 rounded-[12px] px-3 text-left text-[12px] font-semibold text-[#b84f4f] transition hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <LoaderCircle className="h-[18px] w-[18px] animate-spin" />
                      ) : (
                        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
                      )}
                      {isLoggingOut ? "กำลังออกจากระบบ" : "ออกจากระบบ"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-82px)] p-5 sm:p-7 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
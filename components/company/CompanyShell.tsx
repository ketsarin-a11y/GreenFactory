"use client";

import {
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Factory,
  Gauge,
  LoaderCircle,
  LogOut,
  Menu,
  Settings2,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Waves,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";

type CompanyShellProps = {
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
        href: "/company/dashboard",
        icon: Gauge,
        color: "text-[#10b981]",
        activeColor: "bg-gradient-to-r from-[#e8fbf1] to-[#f0fff4] text-[#065f46] shadow-sm",
      },
    ],
  },
  {
    label: "จัดการองค์กร",
    items: [
      {
        label: "ข้อมูลบริษัท",
        href: "/company/profile",
        icon: Building2,
        color: "text-[#3b82f6]",
        activeColor: "bg-gradient-to-r from-[#eff6ff] to-[#f8fafc] text-[#1e40af] shadow-sm",
      },
      {
        label: "โรงงาน",
        href: "/company/factories",
        icon: Factory,
        color: "text-[#f97316]",
        activeColor: "bg-gradient-to-r from-[#fff7ed] to-[#fffbeb] text-[#9a3412] shadow-sm",
      },
      {
        label: "ผู้ใช้งาน",
        href: "/company/users",
        icon: Users,
        color: "text-[#8b5cf6]",
        activeColor: "bg-gradient-to-r from-[#f5f3ff] to-[#faf5ff] text-[#5b21b6] shadow-sm",
      },
    ],
  },
  {
    label: "ข้อมูลโรงงาน",
    items: [
      {
        label: "เครื่องจักร",
        href: "/company/machines",
        icon: Settings2,
        color: "text-[#10b981]",
        activeColor: "bg-gradient-to-r from-[#e8fbf1] to-[#f0fff4] text-[#065f46] shadow-sm",
      },
      {
        label: "เซนเซอร์",
        href: "/company/sensors",
        icon: Waves,
        color: "text-[#14b8a6]",
        activeColor: "bg-gradient-to-r from-[#f0fdfa] to-[#f8fafc] text-[#115e59] shadow-sm",
      },
      {
        label: "QR Code",
        href: "/company/qr-codes",
        icon: QrCode,
        color: "text-[#f59e0b]",
        activeColor: "bg-gradient-to-r from-[#fffbeb] to-[#fefce8] text-[#92400e] shadow-sm",
      },
    ],
  },
  {
    label: "การตั้งค่า",
    items: [
      {
        label: "ตั้งค่าบริษัท",
        href: "/company/settings",
        icon: Settings,
        color: "text-[#64748b]",
        activeColor: "bg-gradient-to-r from-[#f1f5f9] to-[#f8fafc] text-[#334155] shadow-sm",
      },
    ],
  },
];

const pageTitles: Array<[string, string]> = [
  ["/company/dashboard", "แดชบอร์ด"],
  ["/company/profile", "ข้อมูลบริษัท"],
  ["/company/factories", "โรงงาน"],
  ["/company/users", "จัดการผู้ใช้งาน"],
  ["/company/machines", "เครื่องจักร"],
  ["/company/sensors", "เซนเซอร์"],
  ["/company/qr-codes", "QR Code"],
  ["/company/settings", "ตั้งค่าบริษัท"],
];

function getPageTitle(pathname: string) {
  const matched = pageTitles.find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return matched?.[1] ?? "Company Administrator";
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function CompanyShell({
  children,
  user,
}: CompanyShellProps) {
  const pathname = usePathname();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || "Company Admin";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "CA";

  const pageTitle = getPageTitle(pathname);

  const sidebarWidthClass = collapsed ? "lg:w-[86px]" : "lg:w-[288px]";
  const contentPaddingClass = collapsed ? "lg:pl-[86px]" : "lg:pl-[288px]";

  const currentBreadcrumb = useMemo(
    () => ["Company Administrator", pageTitle],
    [pageTitle],
  );

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1e293b] selection:bg-[#10b981] selection:text-white">
      {mobileSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-[12px_0_40px_rgba(15,23,42,0.03)] transition-all duration-300 ${sidebarWidthClass} ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className={`flex flex-col border-b border-slate-100/80 ${collapsed ? "p-3 items-center" : "p-5 pb-4"}`}>
          <div className="flex items-center justify-between w-full">
            <Link
              href="/company/dashboard"
              className={`flex items-center gap-3 group min-w-0 ${collapsed ? "justify-center" : ""}`}
            >
              <div
                className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 group-hover:shadow-md ${
                  collapsed ? "h-11 w-11 p-1.5" : "h-12 w-12 p-1.5"
                }`}
              >
                <img
                  src="/images/LOGO.png"
                  alt="GreenFactory Insight"
                  className="h-full w-full object-contain"
                />
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="truncate text-[17px] font-extrabold tracking-[-0.03em] text-slate-900">
                      GreenFactory
                    </span>
                    <span className="text-[17px] font-extrabold tracking-[-0.03em] text-emerald-600">
                      Insight
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    Smart Factory Platform
                  </p>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="ปิดเมนู"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!collapsed && (
            <div className="mt-4 relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/25 p-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#059669] shadow-xs border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[11px] font-bold text-slate-800">
                      ศูนย์จัดการข้อมูลบริษัท
                    </span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#10b981] animate-pulse" />
                  </div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    Company Administrator
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [scrollbar-width:thin]">
          {navigationSections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  {section.label}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isPathActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                        collapsed ? "justify-center px-2" : ""
                      } ${
                        active
                          ? `${item.activeColor} font-bold`
                          : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                      }`}
                    >
                      {active && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#059669]" />
                      )}

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${
                          active
                            ? `bg-white ${item.color} shadow-xs border border-black/5`
                            : `bg-white ${item.color} shadow-xs border border-slate-200/60`
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>

                      {!collapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100/80 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className={`hidden lg:flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 transition ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && <span>ย่อเมนู</span>}
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-300 ${contentPaddingClass}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/85 px-5 backdrop-blur-xl sm:px-7 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="เปิดเมนู"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight text-slate-900">
                {pageTitle}
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                {currentBreadcrumb.map((item, index) => (
                  <span key={`${item}-${index}`} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-slate-300">/</span>}
                    <span className="truncate">{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <button
              type="button"
              className="hidden xl:flex items-center gap-3 w-64 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2 text-left text-xs text-slate-400 hover:bg-white hover:border-slate-300 transition shadow-2xs"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="flex-1 truncate">ค้นหาเมนูหรือข้อมูล...</span>
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-500 shadow-2xs">
                Ctrl K
              </kbd>
            </button>

            {/* Notification Bell */}
            <Link
              href="/company/notifications"
              aria-label="การแจ้งเตือน"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition hover:border-emerald-500/30 hover:bg-emerald-50/30 hover:text-[#059669]"
            >
              <Bell className="h-4 w-4" strokeWidth={1.8} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((current) => !current)}
                aria-expanded={profileMenuOpen}
                aria-label="เปิดเมนูผู้ใช้"
                className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100/80 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold shadow-inner">
                  {initials}
                </div>
                <div className="hidden text-left md:block">
                  <span className="block max-w-[130px] truncate text-xs font-bold text-slate-800">
                    {fullName}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">
                    Company Admin
                  </span>
                </div>
                <ChevronDown className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    aria-hidden="true"
                    onClick={() => setProfileMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-60 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-slate-900/10">
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {fullName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition"
                      >
                        <CircleUserRound className="h-4 w-4 text-slate-400" />
                        บัญชีผู้ใช้งาน
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-5 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
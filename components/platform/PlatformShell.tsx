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
import { ReactNode, useEffect, useMemo, useState } from "react";

type PlatformShellProps = {
  children: ReactNode;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type IconComponent = typeof Gauge;

type NavItem = {
  label: string;
  href: string;
  icon: IconComponent;
  tone: {
    icon: string;
    iconBg: string;
    activeBg: string;
    activeText: string;
    marker: string;
  };
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const primaryItems: NavItem[] = [
  {
    label: "ภาพรวมระบบ",
    href: "/platform/dashboard",
    icon: Gauge,
    tone: {
      icon: "text-[#3157a4]",
      iconBg: "bg-[#edf3ff]",
      activeBg: "bg-[#eef3ff]",
      activeText: "text-[#25488f]",
      marker: "bg-[#4b73c7]",
    },
  },
  {
    label: "บริษัท",
    href: "/platform/companies",
    icon: Building2,
    tone: {
      icon: "text-[#0d7a68]",
      iconBg: "bg-[#e9f8f4]",
      activeBg: "bg-[#eaf8f4]",
      activeText: "text-[#086655]",
      marker: "bg-[#21a58d]",
    },
  },

  
  {
    label: "ผู้ใช้งาน",
    href: "/platform/users",
    icon: Users,
    tone: {
      icon: "text-[#8b4d9f]",
      iconBg: "bg-[#f7eef9]",
      activeBg: "bg-[#f8effa]",
      activeText: "text-[#713982]",
      marker: "bg-[#a765b8]",
    },
  },
  {
    label: "บทบาทและสิทธิ์",
    href: "/platform/roles",
    icon: ShieldCheck,
    tone: {
      icon: "text-[#b56a16]",
      iconBg: "bg-[#fff4e6]",
      activeBg: "bg-[#fff5e9]",
      activeText: "text-[#94520a]",
      marker: "bg-[#e09a3e]",
    },
  },
];

const navGroups: NavGroup[] = [
  {
    id: "master-data",
    label: "ข้อมูลมาตรฐาน",
    items: [
      {
        label: "ประเภทเครื่องจักร",
        href: "/platform/master-data/machine-types",
        icon: Factory,
        tone: {
          icon: "text-[#c55d43]",
          iconBg: "bg-[#fff0eb]",
          activeBg: "bg-[#fff1ec]",
          activeText: "text-[#a44530]",
          marker: "bg-[#e2775c]",
        },
      },
      {
        label: "ประเภทเซนเซอร์",
        href: "/platform/master-data/sensor-types",
        icon: Waves,
        tone: {
          icon: "text-[#2876a8]",
          iconBg: "bg-[#eaf6fc]",
          activeBg: "bg-[#ebf7fc]",
          activeText: "text-[#1d618b]",
          marker: "bg-[#43a2d0]",
        },
      },
      {
        label: "ประเภททรัพยากร",
        href: "/platform/master-data/resource-types",
        icon: Zap,
        tone: {
          icon: "text-[#b07b13]",
          iconBg: "bg-[#fff7df]",
          activeBg: "bg-[#fff8e5]",
          activeText: "text-[#8b5f08]",
          marker: "bg-[#e3b43e]",
        },
      },
      {
        label: "หมวดหมู่ทรัพยากร",
        href: "/platform/master-data/resource-categories",
        icon: Boxes,
        tone: {
          icon: "text-[#7755a6]",
          iconBg: "bg-[#f3eefb]",
          activeBg: "bg-[#f4effb]",
          activeText: "text-[#60428d]",
          marker: "bg-[#9171bd]",
        },
      },
      {
        label: "หน่วยวัด",
        href: "/platform/master-data/units",
        icon: Ruler,
        tone: {
          icon: "text-[#28777a]",
          iconBg: "bg-[#eaf7f7]",
          activeBg: "bg-[#ecf8f8]",
          activeText: "text-[#1e6164]",
          marker: "bg-[#49a2a5]",
        },
      },
      {
        label: "Emission Factor",
        href: "/platform/master-data/emission-factors",
        icon: Leaf,
        tone: {
          icon: "text-[#3f7b45]",
          iconBg: "bg-[#eef8ed]",
          activeBg: "bg-[#eef8ed]",
          activeText: "text-[#2f6435]",
          marker: "bg-[#62a86a]",
        },
      },
    ],
  },
  {
    id: "operations",
    label: "การดำเนินงานระบบ",
    items: [
      {
        label: "Audit Log",
        href: "/platform/audit-logs",
        icon: ClipboardList,
        tone: {
          icon: "text-[#4b65a2]",
          iconBg: "bg-[#eef2fb]",
          activeBg: "bg-[#eff3fb]",
          activeText: "text-[#394f84]",
          marker: "bg-[#6b82bd]",
        },
      },
      {
        label: "Login Log",
        href: "/platform/login-logs",
        icon: CircleUserRound,
        tone: {
          icon: "text-[#9b557f]",
          iconBg: "bg-[#faeef5]",
          activeBg: "bg-[#faeff5]",
          activeText: "text-[#7f3f67]",
          marker: "bg-[#bc6d99]",
        },
      },
      {
        label: "สำรองและกู้คืนข้อมูล",
        href: "/platform/backups",
        icon: DatabaseBackup,
        tone: {
          icon: "text-[#4d6f83]",
          iconBg: "bg-[#edf5f8]",
          activeBg: "bg-[#eef6f8]",
          activeText: "text-[#385968]",
          marker: "bg-[#7195a7]",
        },
      },
      {
        label: "ตั้งค่าระบบ",
        href: "/platform/settings",
        icon: Settings,
        tone: {
          icon: "text-[#6d665e]",
          iconBg: "bg-[#f4f1ed]",
          activeBg: "bg-[#f5f2ee]",
          activeText: "text-[#554f48]",
          marker: "bg-[#90877d]",
        },
      },
    ],
  },
];

const pageTitles: Array<[string, string, string]> = [
  ["/platform/dashboard", "ภาพรวมระบบ", "สถานะและข้อมูลสำคัญของแพลตฟอร์ม"],
  ["/platform/companies", "จัดการบริษัท", "ดูแลบริษัทที่ใช้งานแพลตฟอร์ม"],
  ["/platform/users", "จัดการผู้ใช้งาน", "จัดการบัญชีผู้ใช้งานส่วนกลาง"],
  ["/platform/roles", "บทบาทและสิทธิ์", "กำหนดขอบเขตการเข้าถึงระบบ"],
  [
    "/platform/master-data/machine-types",
    "ประเภทเครื่องจักร",
    "จัดการข้อมูลมาตรฐานของเครื่องจักร",
  ],
  [
    "/platform/master-data/sensor-types",
    "ประเภทเซนเซอร์",
    "จัดการข้อมูลมาตรฐานของเซนเซอร์",
  ],
  [
    "/platform/master-data/resource-types",
    "ประเภททรัพยากร",
    "จัดการข้อมูลมาตรฐานของทรัพยากร",
  ],
  [
    "/platform/master-data/resource-categories",
    "หมวดหมู่ทรัพยากร",
    "จัดกลุ่มและควบคุมโครงสร้างข้อมูลทรัพยากร",
  ],
  ["/platform/master-data/units", "หน่วยวัด", "กำหนดหน่วยวัดส่วนกลาง"],
  [
    "/platform/master-data/emission-factors",
    "Emission Factor",
    "จัดการค่าปัจจัยการปล่อยสำหรับการคำนวณ",
  ],
  ["/platform/audit-logs", "Audit Log", "ตรวจสอบกิจกรรมที่เกิดขึ้นในระบบ"],
  ["/platform/login-logs", "Login Log", "ตรวจสอบประวัติการเข้าสู่ระบบ"],
  [
    "/platform/backups",
    "สำรองและกู้คืนข้อมูล",
    "ควบคุมความพร้อมใช้งานและความปลอดภัยของข้อมูล",
  ],
  ["/platform/settings", "ตั้งค่าระบบ", "กำหนดค่าการทำงานของแพลตฟอร์ม"],
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageMeta(pathname: string) {
  const matched = pageTitles.find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return {
    title: matched?.[1] ?? "Platform Administration",
    description: matched?.[2] ?? "ศูนย์ควบคุมระบบส่วนกลาง",
  };
}

function NavLink({
  item,
  pathname,
  compact,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  compact: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      title={compact ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={`group relative flex min-h-[48px] items-center rounded-[12px] text-sm transition-all duration-150 ${
        compact ? "justify-center px-0" : "gap-3 px-2.5"
      } ${
        active
          ? `${item.tone.activeBg} ${item.tone.activeText} font-semibold shadow-[inset_0_0_0_1px_rgba(34,38,36,0.04)]`
          : "font-medium text-[#5f625f] hover:bg-white hover:text-[#242a27] hover:shadow-[0_5px_18px_rgba(45,42,36,0.06)]"
      }`}
    >
      {active && (
        <span
          className={`absolute left-0 top-3 h-6 w-[3px] rounded-r-full ${item.tone.marker}`}
        />
      )}

      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-transform duration-150 ${
          active ? "bg-white shadow-sm" : item.tone.iconBg
        } group-hover:scale-[1.03]`}
      >
        <Icon
          className={`h-[18px] w-[18px] ${item.tone.icon}`}
          strokeWidth={1.9}
        />
      </span>

      {!compact && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function PlatformShell({ children, user }: PlatformShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "master-data": true,
    operations: true,
  });

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || "Platform Admin";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "PA";

  const pageMeta = getPageMeta(pathname);

  const activeGroupId = useMemo(
    () =>
      navGroups.find((group) =>
        group.items.some((item) => isActive(pathname, item.href)),
      )?.id,
    [pathname],
  );

  useEffect(() => {
    if (!activeGroupId) return;

    setOpenGroups((current) => ({
      ...current,
      [activeGroupId]: true,
    }));
  }, [activeGroupId]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  function toggleGroup(groupId: string) {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/reset-session", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Logout failed");
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  const sidebarWidth = collapsed ? "lg:w-[76px]" : "lg:w-[260px]";
  const contentOffset = collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]";

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-[#202522]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#e6e0d8] bg-[#fffdfa] shadow-[8px_0_30px_rgba(56,47,35,0.04)] transition-[width,transform] duration-200 ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`flex h-[72px] shrink-0 items-center border-b border-[#eee7dd] ${
            collapsed ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          <Link
            href="/platform/dashboard"
            className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[linear-gradient(135deg,#253b6e_0%,#315e73_48%,#26806d_100%)] text-sm font-bold tracking-tight text-white shadow-[0_8px_20px_rgba(42,86,104,0.22)]">
              GF
            </span>

            {!collapsed && (
              <span className="min-w-0 leading-none">
                <span className="block truncate text-[15px] font-semibold tracking-[-0.02em] text-[#252925]">
                  GreenFactory Insight
                </span>
                <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8f82]">
                  Platform Console
                </span>
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="ปิดเมนู"
            className="grid h-9 w-9 place-items-center rounded-md text-[#637069] hover:bg-[#eef2ef] lg:hidden"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:thin]">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0978c]">
              Administration
            </p>
          )}

          <div className="space-y-1">
            {primaryItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                compact={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>

          <div className="my-5 border-t border-[#eee8df]" />

          <div className="space-y-5">
            {navGroups.map((group) => {
              const isOpen = Boolean(openGroups[group.id]);
              const groupActive = group.items.some((item) =>
                isActive(pathname, item.href),
              );

              if (collapsed) {
                return (
                  <div key={group.id} className="space-y-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        compact
                        onNavigate={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                );
              }

              return (
                <section key={group.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left"
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        groupActive ? "text-[#247a57]" : "text-[#a0978c]"
                      }`}
                    >
                      {group.label}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#8c9691] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          compact={false}
                          onNavigate={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#eee7dd] p-3">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className={`hidden h-10 w-full items-center rounded-lg text-xs font-medium text-[#66726c] hover:bg-[#eef2ef] hover:text-[#263830] lg:flex ${
              collapsed ? "justify-center" : "gap-3 px-3"
            }`}
            aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
          >
            {collapsed ? (
              <ChevronRight className="h-[17px] w-[17px]" />
            ) : (
              <>
                <ChevronLeft className="h-[17px] w-[17px]" />
                <span>ย่อแถบเมนู</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-200 ${contentOffset}`}
      >
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[#e7e1d9] bg-[#fffdfa]/92 shadow-[0_4px_18px_rgba(58,48,35,0.035)] px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
            className="mr-3 grid h-10 w-10 place-items-center rounded-lg text-[#56635d] hover:bg-[#eef2ef] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-semibold tracking-[-0.02em] text-[#252925] sm:text-[21px]">
              {pageMeta.title}
            </h1>
            <p className="mt-0.5 hidden truncate text-[12px] text-[#7a8680] sm:block">
              {pageMeta.description}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="hidden h-10 w-[280px] items-center gap-2.5 rounded-lg border border-[#dfe5e1] bg-white px-3.5 text-left text-xs text-[#7d8882] transition-colors hover:border-[#cbd5d0] xl:flex"
            >
              <Search className="h-[16px] w-[16px]" />
              <span>ค้นหาเมนูหรือข้อมูล</span>
              <span className="ml-auto rounded border border-[#dce3df] bg-[#f6f8f7] px-1.5 py-0.5 text-[9px] font-medium text-[#7d8882]">
                Ctrl K
              </span>
            </button>

            <Link
              href="/platform/notifications"
              aria-label="การแจ้งเตือน"
              className="relative grid h-10 w-10 place-items-center rounded-lg border border-transparent text-[#59655f] hover:border-[#dfe5e1] hover:bg-white hover:text-[#22342c]"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#c54848] ring-2 ring-[#fbfcfb]" />
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex h-11 items-center gap-2 rounded-lg px-1.5 hover:bg-[#eef2ef] sm:gap-3 sm:px-2"
                aria-expanded={profileOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#e9efff,#e7f7f2)] text-[11px] font-semibold text-[#31506c] ring-1 ring-[#d9e4e0]">
                  {initials}
                </span>

                <span className="hidden min-w-0 text-left md:block">
                  <span className="block max-w-[145px] truncate text-[12px] font-semibold text-[#26322c]">
                    {fullName}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[#7c8781]">
                    Platform Admin
                  </span>
                </span>

                <ChevronDown
                  className={`hidden h-3.5 w-3.5 text-[#7a8680] transition-transform sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <>
                  <button
                    type="button"
                    aria-label="ปิดเมนูผู้ใช้งาน"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setProfileOpen(false)}
                  />

                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[260px] overflow-hidden rounded-xl border border-[#dfe5e1] bg-white shadow-[0_16px_40px_rgba(28,43,36,0.12)]">
                    <div className="border-b border-[#e6ebe8] px-4 py-3.5">
                      <p className="truncate text-[13px] font-semibold text-[#1f2b25]">
                        {fullName}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-[#7c8781]">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] font-medium text-[#46534d] hover:bg-[#f2f5f3]"
                      >
                        <CircleUserRound className="h-[17px] w-[17px]" />
                        บัญชีผู้ใช้งาน
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] font-medium text-[#a33d3d] hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <LoaderCircle className="h-[17px] w-[17px] animate-spin" />
                        ) : (
                          <LogOut className="h-[17px] w-[17px]" />
                        )}
                        {isLoggingOut ? "กำลังออกจากระบบ" : "ออกจากระบบ"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
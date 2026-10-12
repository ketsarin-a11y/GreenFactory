"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {

  FormEvent,

  KeyboardEvent,

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

import {

  AlertTriangle,

  ArrowUpRight,

  BarChart3,

  Bell,

  Bot,

  Check,

  ChevronDown,

  CircleAlert,

  FileText,

  Gauge,

  GitCompareArrows,

  ImagePlus,

  Leaf,

  LoaderCircle,

  LogOut,

  Menu,

  MessageCircleMore,

  Paperclip,

  Send,

  UserRound,

  Wrench,

  X,

} from "lucide-react";

type AlertSeverity =

  | "CRITICAL"

  | "HIGH"

  | "MEDIUM"

  | "LOW"

  | string;

type ManagerAlert = {

  id: string;

  alertCode: string;

  alertType: string;

  severity: AlertSeverity;

  title: string;

  message: string;

  status: string;

  triggeredAt: string;

  machineName: string | null;

  departmentName: string | null;

  buildingName: string | null;

};

type AlertResponse = {

  alerts: ManagerAlert[];

  openCount: number;

};

type ChatRole = "user" | "assistant";

type ChatMessage = {

  role: ChatRole;

  content: string;

  imagePreview?: string;

  imageName?: string;

};

type AssistantResponse = {

  answer?: string;

  message?: string;

  mode?: "AI" | "LOCAL_FALLBACK";

  provider?: "GEMINI" | "LOCAL";

  model?: string;

};

type ExternalAssistantRequest = {

  id: number;

  prompt: string;

  evidence?: unknown;

};

type ManagerProfile = {

  firstName: string;

  lastName: string;

  email: string;

  avatarUrl?: string | null;

};

type MenuKey = "analytics" | "operations";

const ANALYTICS_ITEMS = [

  {

    href: "/manager/overview",

    label: "Resource Analytics",

    description: "แนวโน้มและการใช้ทรัพยากร",

    icon: BarChart3,

  },

  {

    href: "/manager/overview/carbon",

    label: "Carbon Intelligence",

    description: "คาร์บอนและการกระจายตาม Scope",

    icon: Leaf,

  },

  {

    href: "/manager/overview/oee",

    label: "Performance & KPI",

    description: "เป้าหมายและประสิทธิภาพ",

    icon: Gauge,

  },

  {

    href: "/manager/overview/compare",

    label: "Compare",

    description: "เปรียบเทียบช่วงเวลาและหน่วยงาน",

    icon: GitCompareArrows,

  },

];

const OPERATIONS_ITEMS = [

  {

    href: "/manager/overview/equipment",

    label: "Machines",

    description: "ข้อมูลและกิจกรรมของเครื่องจักร",

    icon: Wrench,

  },

];

const SUGGESTED_PROMPTS = [

  "สรุปสถานการณ์โรงงาน 7 วันล่าสุด",

  "มีอะไรผิดปกติในการใช้ไฟฟ้า?",

  "เครื่องไหนมีสัดส่วนการใช้ไฟสูงสุด?",

  "สรุป Carbon Footprint ล่าสุด",

];

export default function ManagerTopbar() {

  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroups, setMobileGroups] = useState<Record<MenuKey, boolean>>({
    analytics: false,
    operations: false,
  });

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [assistantOpen, setAssistantOpen] = useState(false);

  const [externalAssistantRequest, setExternalAssistantRequest] = useState<ExternalAssistantRequest | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);

  const [profile, setProfile] = useState<ManagerProfile | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [alerts, setAlerts] = useState<ManagerAlert[]>([]);

  const [openCount, setOpenCount] = useState(0);

  const [alertsLoading, setAlertsLoading] = useState(true);

  const [acknowledgingAll, setAcknowledgingAll] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    let cancelled = false;

    async function loadProfile() {

      try {

        setProfileLoading(true);

        const response = await fetch("/api/Profile", {

          method: "GET",

          credentials: "include",

          cache: "no-store",

        });

        if (!response.ok) return;

        const data = (await response.json()) as {

          success?: boolean;

          profile?: ManagerProfile;

        };

        if (!cancelled && data.success && data.profile) {

          setProfile(data.profile);

        }

      } catch (error) {

        console.error("Manager profile load error:", error);

      } finally {

        if (!cancelled) setProfileLoading(false);

      }

    }

    void loadProfile();

    return () => {

      cancelled = true;

    };

  }, []);

  useEffect(() => {

    let cancelled = false;

    let notificationsAvailable = true;

    async function loadAlerts(showLoading = false) {

      if (showLoading) setAlertsLoading(true);

      try {

        const response = await fetch("/api/manager/notifications", {

          method: "GET",

          cache: "no-store",

          credentials: "include",

        });

        if (response.status === 401 || response.status === 403) {

          notificationsAvailable = false;

          if (!cancelled) {

            setAlerts([]);

            setOpenCount(0);

          }

          return;

        }

        if (!response.ok) {

          throw new Error(`Notification request failed: ${response.status}`);

        }

        const data = (await response.json()) as AlertResponse;

        if (!cancelled) {

          setAlerts(data.alerts ?? []);

          setOpenCount(data.openCount ?? 0);

        }

      } catch (error) {

        console.error("Manager notification error:", error);

      } finally {

        if (!cancelled && showLoading) setAlertsLoading(false);

      }

    }

    void loadAlerts(true);

    const timer = window.setInterval(() => {

      if (notificationsAvailable) {

        void loadAlerts(false);

      }

    }, 60_000);

    return () => {

      cancelled = true;

      window.clearInterval(timer);

    };

  }, []);

  async function acknowledgeAlert(alertId: string) {

    try {

      const response = await fetch("/api/manager/notifications", {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ alertId }),

      });

      if (!response.ok) {

        throw new Error(`Acknowledge failed: ${response.status}`);

      }

      setAlerts((current) =>

        current.map((alert) =>

          alert.id === alertId

            ? { ...alert, status: "ACKNOWLEDGED" }

            : alert,

        ),

      );

      setOpenCount((count) => Math.max(0, count - 1));

    } catch (error) {

      console.error("Acknowledge alert error:", error);

    }

  }

  async function acknowledgeAll() {

    if (openCount === 0 || acknowledgingAll) return;

    try {

      setAcknowledgingAll(true);

      const response = await fetch("/api/manager/notifications", {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ acknowledgeAll: true }),

      });

      if (!response.ok) {

        throw new Error(`Acknowledge all failed: ${response.status}`);

      }

      setAlerts((current) =>

        current.map((alert) =>

          alert.status === "OPEN"

            ? { ...alert, status: "ACKNOWLEDGED" }

            : alert,

        ),

      );

      setOpenCount(0);

    } catch (error) {

      console.error("Acknowledge all alerts error:", error);

    } finally {

      setAcknowledgingAll(false);

    }

  }

  useEffect(() => {

    const closeOutside = (event: MouseEvent) => {

      const target = event.target as Node;

      if (

        headerRef.current &&

        !headerRef.current.contains(target)

      ) {

        setOpenMenu(null);

        setNotificationsOpen(false);

      }

      if (

        profileRef.current &&

        !profileRef.current.contains(target)

      ) {

        setProfileOpen(false);

      }

    };

    document.addEventListener("mousedown", closeOutside);

    return () => document.removeEventListener("mousedown", closeOutside);

  }, []);

  useEffect(() => {

    setOpenMenu(null);

    setNotificationsOpen(false);

    setProfileOpen(false);

    setMobileOpen(false);

  }, [pathname]);

  useEffect(() => {
    setMobileGroups({
      analytics:
        pathname.startsWith("/manager/overview") &&
        !pathname.startsWith("/manager/overview/equipment"),
      operations: pathname.startsWith("/manager/overview/equipment"),
    });
  }, [pathname]);

  useEffect(() => {

    function handleAskAI(event: Event) {

      const customEvent = event as CustomEvent<{

        prompt?: string;

        evidence?: unknown;

      }>;

      const prompt = customEvent.detail?.prompt?.trim();

      if (!prompt) return;

      setOpenMenu(null);

      setNotificationsOpen(false);

      setProfileOpen(false);

      setMobileOpen(false);

      setAssistantOpen(true);

      setExternalAssistantRequest({

        id: Date.now(),

        prompt,

        evidence: customEvent.detail?.evidence,

      });

    }

    window.addEventListener("greenfactory:ask-ai", handleAskAI);

    return () => {

      window.removeEventListener("greenfactory:ask-ai", handleAskAI);

    };

  }, []);

  const fullName = useMemo(() => {

    if (!profile) return "Manager";

    return (

      `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||

      profile.email?.split("@")[0] ||

      "Manager"

    );

  }, [profile]);

  const shortName = profile?.firstName?.trim() || fullName;

  const initials =

    `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() ||

    "MG";

  async function handleLogout() {

    if (isLoggingOut) return;

    try {

      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {

        method: "POST",

        credentials: "include",

        cache: "no-store",

      });

      if (!response.ok) {

        throw new Error(`Logout failed: ${response.status}`);

      }

      window.location.href = "/login";

    } catch (error) {

      console.error("Logout error:", error);

      setIsLoggingOut(false);

    }

  }

  const isActive = (href: string) => {

    if (href === "/manager") return pathname === "/manager";

    return pathname === href || pathname.startsWith(`${href}/`);

  };

  const analyticsActive =

    pathname.startsWith("/manager/overview") &&

    !pathname.startsWith("/manager/overview/equipment");

  const operationsActive = pathname.startsWith(

    "/manager/overview/equipment",

  );

  return (

    <>

      <header

        ref={headerRef}

        className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-2xl"

      >

        <div className="mx-auto flex h-[76px] max-w-[1640px] items-center px-4 sm:px-6 lg:px-8">

          <Link

            href="/manager"

            className="flex min-w-0 shrink-0 items-center"

            aria-label="GreenFactory Insight"

          >

            <img

              src="/images/LOGO.png"

              alt="GreenFactory Insight"

              className="block h-auto w-[164px] object-contain sm:w-[180px]"

              draggable={false}

            />

          </Link>

          <div className="mx-6 hidden h-7 w-px bg-slate-200 xl:block" />

          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">

            <TopLink

              href="/manager"

              active={isActive("/manager")}

              label="Command Center"

            />

            <DropdownButton

              label="Analytics"

              open={openMenu === "analytics"}

              active={analyticsActive}

              onClick={() =>

                setOpenMenu((current) =>

                  current === "analytics" ? null : "analytics",

                )

              }

            />

            <TopLink

              href="/manager/ai"

              active={isActive("/manager/ai")}

              label="AI Intelligence"

            />

            <DropdownButton

              label="Operations"

              open={openMenu === "operations"}

              active={operationsActive}

              onClick={() =>

                setOpenMenu((current) =>

                  current === "operations" ? null : "operations",

                )

              }

            />

            <TopLink

              href="/manager/reports"

              active={isActive("/manager/reports")}

              label="Reports"

            />

          </nav>

          <div className="ml-auto flex items-center gap-2">

            <div className="relative hidden sm:block">

              <button

                type="button"

                onClick={() => {

                  setNotificationsOpen((value) => !value);

                  setOpenMenu(null);

                  setProfileOpen(false);

                }}

                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"

                aria-label="การแจ้งเตือน"

              >

                <Bell className="h-[18px] w-[18px]" />

                {openCount > 0 && (

                  <span className="absolute -right-0.5 -top-0.5 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold leading-none text-white ring-2 ring-white">

                    {openCount > 99 ? "99+" : openCount}

                  </span>

                )}

              </button>

              {notificationsOpen && (

                <NotificationPopover

                  alerts={alerts}

                  openCount={openCount}

                  loading={alertsLoading}

                  acknowledgingAll={acknowledgingAll}

                  onAcknowledge={(alertId) => void acknowledgeAlert(alertId)}

                  onAcknowledgeAll={() => void acknowledgeAll()}

                />

              )}

            </div>

            <div ref={profileRef} className="relative hidden sm:block">

              <button

                type="button"

                onClick={() => {

                  setProfileOpen((value) => !value);

                  setNotificationsOpen(false);

                  setOpenMenu(null);

                }}

                className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-1.5 pr-3 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-md"

              >

                <UserAvatar

                  avatarUrl={profile?.avatarUrl}

                  initials={initials}

                  size="sm"

                />

                <span className="hidden max-w-[130px] truncate text-xs font-semibold text-slate-700 xl:block">

                  {profileLoading ? "กำลังโหลด..." : shortName}

                </span>

                <ChevronDown

                  className={[

                    "hidden h-3.5 w-3.5 text-slate-400 transition xl:block",

                    profileOpen ? "rotate-180" : "",

                  ].join(" ")}

                />

              </button>

              {profileOpen && (

                <ProfilePopover

                  profile={profile}

                  fullName={fullName}

                  initials={initials}

                  isLoggingOut={isLoggingOut}

                  onLogout={() => void handleLogout()}

                />

              )}

            </div>

            <button

              type="button"

              onClick={() => setMobileOpen(true)}

              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 lg:hidden"

              aria-label="เปิดเมนู"

            >

              <Menu className="h-5 w-5" />

            </button>

          </div>

        </div>

        {openMenu && (

          <div className="absolute left-0 right-0 top-[76px] border-b border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl">

            <div className="mx-auto max-w-[1640px] px-8 py-6">

              {openMenu === "analytics" && (

                <MegaMenu

                  eyebrow="Analytics workspace"

                  title="วิเคราะห์ข้อมูลโรงงาน"

                  subtitle="เจาะแนวโน้ม ประสิทธิภาพ และ Carbon จากข้อมูลที่บันทึกจริง"

                  items={ANALYTICS_ITEMS}

                  onNavigate={() => setOpenMenu(null)}

                />

              )}

              {openMenu === "operations" && (

                <MegaMenu

                  eyebrow="Operations"

                  title="ติดตามเครื่องจักร"

                  subtitle="ตรวจสอบกิจกรรมและข้อมูลการใช้ทรัพยากรในระดับเครื่อง"

                  items={OPERATIONS_ITEMS}

                  onNavigate={() => setOpenMenu(null)}

                />

              )}

            </div>

          </div>

        )}

      </header>

      {mobileOpen && (

        <div className="fixed inset-0 z-[90] lg:hidden">

          <button

            type="button"

            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"

            aria-label="ปิดเมนู"

            onClick={() => setMobileOpen(false)}

          />

          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col bg-white shadow-2xl">

            <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-5">

              <img

                src="/images/LOGO.png"

                alt="GreenFactory Insight"

                className="w-[160px]"

              />

              <button

                type="button"

                onClick={() => setMobileOpen(false)}

                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"

              >

                <X className="h-5 w-5" />

              </button>

            </div>

            <div className="border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <UserAvatar

                  avatarUrl={profile?.avatarUrl}

                  initials={initials}

                  size="lg"

                />

                <div className="min-w-0">

                  <p className="truncate text-sm font-bold text-slate-900">

                    {fullName}

                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500">

                    {profile?.email || "Manager"}

                  </p>

                </div>

              </div>

            </div>

            <div className="flex-1 overflow-y-auto p-4">

              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">

                Workspace

              </p>

              <div className="space-y-1">
                <MobileLink
                  href="/manager"
                  label="Command Center"
                  active={isActive("/manager")}
                  onNavigate={() => setMobileOpen(false)}
                />

                <MobileMenuGroup
                  label="Analytics"
                  open={mobileGroups.analytics}
                  active={analyticsActive}
                  onToggle={() =>
                    setMobileGroups((current) => ({
                      ...current,
                      analytics: !current.analytics,
                    }))
                  }
                  items={ANALYTICS_ITEMS}
                  isActive={isActive}
                  onNavigate={() => setMobileOpen(false)}
                />

                <MobileLink
                  href="/manager/ai"
                  label="AI Intelligence"
                  active={isActive("/manager/ai")}
                  onNavigate={() => setMobileOpen(false)}
                />

                <MobileMenuGroup
                  label="Operations"
                  open={mobileGroups.operations}
                  active={operationsActive}
                  onToggle={() =>
                    setMobileGroups((current) => ({
                      ...current,
                      operations: !current.operations,
                    }))
                  }
                  items={OPERATIONS_ITEMS}
                  isActive={isActive}
                  onNavigate={() => setMobileOpen(false)}
                />

                <MobileLink
                  href="/manager/reports"
                  label="Reports"
                  active={isActive("/manager/reports")}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <button

                type="button"

                onClick={() => {

                  setMobileOpen(false);

                  setAssistantOpen(true);

                }}

                className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left"

              >

                <img

                  src="/images/g-fay.gif"

                  alt="G-Fay"

                  className="h-11 w-11 rounded-2xl object-cover object-top"

                />

                <span className="min-w-0">

                  <span className="block text-sm font-bold text-slate-900">

                    คุยกับ G-Fay

                  </span>

                  <span className="mt-0.5 block text-xs text-slate-500">

                    GreenFactory AI · Gemini

                  </span>

                </span>

              </button>

              <div className="my-5 h-px bg-slate-100" />

              <MobileLink
                href="/manager/profile"
                label="โปรไฟล์ของฉัน"
                active={isActive("/manager/profile")}
                onNavigate={() => setMobileOpen(false)}
              />

              <button

                type="button"

                onClick={() => void handleLogout()}

                disabled={isLoggingOut}

                className="mt-1 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"

              >

                {isLoggingOut ? (

                  <LoaderCircle className="h-4 w-4 animate-spin" />

                ) : (

                  <LogOut className="h-4 w-4" />

                )}

                {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}

              </button>

            </div>

          </aside>

        </div>

      )}

     {!assistantOpen && (

  <button

    type="button"

    onClick={() => setAssistantOpen(true)}

    aria-label="คุยกับ G-Fay"

    title="คุยกับ G-Fay"

    className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_12px_32px_rgba(5,150,105,0.30)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(5,150,105,0.38)] focus:outline-none focus:ring-4 focus:ring-emerald-100"

  >

    <Bot className="h-6 w-6" />

    <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-300" />

    <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">

      คุยกับ G-Fay

    </span>

  </button>

)}

{assistantOpen && (

        <AIAssistantPanel

          onClose={() => setAssistantOpen(false)}

          managerName={shortName}

          externalRequest={externalAssistantRequest}

        />

      )}

    </>

  );

}

function UserAvatar({

  avatarUrl,

  initials,

  size,

}: {

  avatarUrl?: string | null;

  initials: string;

  size: "sm" | "lg";

}) {

  const classes =

    size === "lg"

      ? "h-11 w-11 rounded-2xl text-sm"

      : "h-8 w-8 rounded-full text-[10px]";

  return (

    <span

      className={`flex ${classes} shrink-0 items-center justify-center overflow-hidden bg-slate-900 font-bold text-white`}

    >

      {avatarUrl ? (

        <img

          src={avatarUrl}

          alt=""

          className="h-full w-full object-cover"

        />

      ) : (

        initials

      )}

    </span>

  );

}

function ProfilePopover({

  profile,

  fullName,

  initials,

  isLoggingOut,

  onLogout,

}: {

  profile: ManagerProfile | null;

  fullName: string;

  initials: string;

  isLoggingOut: boolean;

  onLogout: () => void;

}) {

  return (

    <div className="absolute right-0 top-12 w-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.16)]">

      <div className="p-4">

        <div className="flex items-center gap-3">

          <UserAvatar

            avatarUrl={profile?.avatarUrl}

            initials={initials}

            size="lg"

          />

          <div className="min-w-0">

            <p className="truncate text-sm font-bold text-slate-950">

              {fullName}

            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">

              {profile?.email || "Manager"}

            </p>

          </div>

        </div>

        <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">

          MANAGER

        </div>

      </div>

      <div className="border-t border-slate-100 p-2">

        <Link

          href="/manager/profile"

          className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"

        >

          <UserRound className="h-4 w-4 text-slate-400" />

          โปรไฟล์ของฉัน

        </Link>

        <button

          type="button"

          onClick={onLogout}

          disabled={isLoggingOut}

          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"

        >

          {isLoggingOut ? (

            <LoaderCircle className="h-4 w-4 animate-spin" />

          ) : (

            <LogOut className="h-4 w-4" />

          )}

          {isLoggingOut

            ? "กำลังออกจากระบบ..."

            : `ออกจากระบบ — ${fullName}`}

        </button>

      </div>

    </div>

  );

}

function TopLink({

  href,

  label,

  active,

}: {

  href: string;

  label: string;

  active: boolean;

}) {

  return (

    <Link

      href={href}

      className={[

        "relative rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",

        active

          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"

          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950",

      ].join(" ")}

    >

      {label}

    </Link>

  );

}

function DropdownButton({

  label,

  open,

  active,

  onClick,

}: {

  label: string;

  open: boolean;

  active: boolean;

  onClick: () => void;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={[

        "flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",

        open || active

          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"

          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950",

      ].join(" ")}

    >

      {label}

      <ChevronDown

        className={[

          "h-3.5 w-3.5 transition-transform duration-200",

          open ? "rotate-180" : "",

        ].join(" ")}

      />

    </button>

  );

}

function MegaMenu({

  eyebrow,

  title,

  subtitle,

  items,

  onNavigate,

}: {

  eyebrow: string;

  title: string;

  subtitle: string;

  items: typeof ANALYTICS_ITEMS | typeof OPERATIONS_ITEMS;

  onNavigate: () => void;

}) {

  return (

    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

      <div>

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">

          {eyebrow}

        </p>

        <p className="mt-2 text-lg font-bold text-slate-950">{title}</p>

        <p className="mt-2 max-w-[250px] text-xs leading-5 text-slate-500">

          {subtitle}

        </p>

      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {items.map((item) => {

          const Icon = item.icon;

          return (

            <Link

              key={item.href}

              href={item.href}

              onClick={onNavigate}

              className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)]"

            >

              <div className="flex items-start justify-between gap-3">

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                  <Icon className="h-[18px] w-[18px]" />

                </span>

                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-600" />

              </div>

              <p className="mt-4 text-sm font-bold text-slate-900">

                {item.label}

              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">

                {item.description}

              </p>

            </Link>

          );

        })}

      </div>

    </div>

  );

}

function NotificationPopover({

  alerts,

  openCount,

  loading,

  acknowledgingAll,

  onAcknowledge,

  onAcknowledgeAll,

}: {

  alerts: ManagerAlert[];

  openCount: number;

  loading: boolean;

  acknowledgingAll: boolean;

  onAcknowledge: (alertId: string) => void;

  onAcknowledgeAll: () => void;

}) {

  const visibleAlerts = alerts.slice(0, 8);

  const criticalCount = visibleAlerts.filter(

    (alert) =>

      alert.status === "OPEN" &&

      (alert.severity === "CRITICAL" || alert.severity === "HIGH"),

  ).length;

  return (

    <div className="absolute right-0 top-14 w-[min(450px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.18)] ring-1 ring-slate-950/[0.03] backdrop-blur-2xl">

      {/* header */}

      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-emerald-50/20 to-sky-50/30 px-5 py-5">

        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500" />

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">

                <Bell className="h-4 w-4" />

              </span>

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="text-[15px] font-extrabold tracking-tight text-slate-950">

                    การแจ้งเตือน

                  </h3>

                  {openCount > 0 && (

                    <span className="inline-flex min-h-5 items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 ring-1 ring-rose-100">

                      {openCount} ใหม่

                    </span>

                  )}

                </div>

                <p className="mt-0.5 text-[11px] text-slate-400">

                  ติดตามเหตุการณ์สำคัญจากข้อมูลโรงงาน

                </p>

              </div>

            </div>

            {criticalCount > 0 && (

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100">

                <AlertTriangle className="h-3.5 w-3.5" />

                {criticalCount} รายการต้องตรวจสอบก่อน

              </div>

            )}

          </div>

          {openCount > 0 && (

            <button

              type="button"

              onClick={onAcknowledgeAll}

              disabled={acknowledgingAll}

              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"

            >

              {acknowledgingAll ? (

                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />

              ) : (

                <Check className="h-3.5 w-3.5" />

              )}

              อ่านทั้งหมด

            </button>

          )}

        </div>

      </div>

      {/* body */}

      <div className="max-h-[540px] overflow-y-auto bg-slate-50/70">

        {loading ? (

          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center">

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">

              <LoaderCircle className="h-5 w-5 animate-spin" />

            </span>

            <div>

              <p className="text-xs font-bold text-slate-700">

                กำลังโหลดการแจ้งเตือน

              </p>

              <p className="mt-1 text-[10px] text-slate-400">

                กำลังตรวจสอบข้อมูลล่าสุดจากระบบ

              </p>

            </div>

          </div>

        ) : visibleAlerts.length === 0 ? (

          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">

            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">

              <Check className="h-5 w-5" />

            </span>

            <p className="mt-4 text-sm font-extrabold text-slate-800">

              ทุกอย่างเรียบร้อย

            </p>

            <p className="mt-1 max-w-[250px] text-[11px] leading-5 text-slate-400">

              ตอนนี้ยังไม่มี Alert ที่ต้องตรวจสอบ

            </p>

          </div>

        ) : (

          <div className="p-2.5">

            <div className="space-y-2">

              {visibleAlerts.map((alert) => (

                <NotificationAlertItem

                  key={alert.id}

                  alert={alert}

                  onAcknowledge={onAcknowledge}

                />

              ))}

            </div>

          </div>

        )}

      </div>

      {/* footer */}

      {visibleAlerts.length > 0 && (

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">

          <span className="text-[10px] text-slate-400">

            แสดงล่าสุด {visibleAlerts.length} รายการ

          </span>

          <span className="text-[10px] font-semibold text-slate-500">

            อัปเดตอัตโนมัติ

          </span>

        </div>

      )}

    </div>

  );

}

function NotificationAlertItem({

  alert,

  onAcknowledge,

}: {

  alert: ManagerAlert;

  onAcknowledge: (alertId: string) => void;

}) {

  const isOpen = alert.status === "OPEN";

  const severity = String(alert.severity || "").toUpperCase();

  const style =

    severity === "CRITICAL"

      ? {

          label: "CRITICAL",

          icon: "bg-rose-100 text-rose-700 ring-rose-200",

          badge: "bg-rose-50 text-rose-700 ring-rose-100",

          dot: "bg-rose-500",

          card: isOpen

            ? "border-rose-100 bg-gradient-to-br from-white to-rose-50/45"

            : "border-slate-100 bg-white",

        }

      : severity === "HIGH"

        ? {

            label: "HIGH",

            icon: "bg-orange-100 text-orange-700 ring-orange-200",

            badge: "bg-orange-50 text-orange-700 ring-orange-100",

            dot: "bg-orange-500",

            card: isOpen

              ? "border-orange-100 bg-gradient-to-br from-white to-orange-50/40"

              : "border-slate-100 bg-white",

          }

        : severity === "MEDIUM" || severity === "WARNING"

          ? {

              label: "WARNING",

              icon: "bg-amber-100 text-amber-700 ring-amber-200",

              badge: "bg-amber-50 text-amber-700 ring-amber-100",

              dot: "bg-amber-500",

              card: isOpen

                ? "border-amber-100 bg-gradient-to-br from-white to-amber-50/40"

                : "border-slate-100 bg-white",

            }

          : {

              label: "INFO",

              icon: "bg-sky-100 text-sky-700 ring-sky-200",

              badge: "bg-sky-50 text-sky-700 ring-sky-100",

              dot: "bg-sky-500",

              card: isOpen

                ? "border-sky-100 bg-gradient-to-br from-white to-sky-50/35"

                : "border-slate-100 bg-white",

            };

  const timeLabel = (() => {

    const date = new Date(alert.triggeredAt);

    if (Number.isNaN(date.getTime())) return "ล่าสุด";

    return new Intl.DateTimeFormat("th-TH", {

      hour: "2-digit",

      minute: "2-digit",

      day: "numeric",

      month: "short",

      year: "2-digit",

      timeZone: "Asia/Bangkok",

    }).format(date);

  })();

  const location = [

    alert.machineName,

    alert.departmentName,

    alert.buildingName,

  ].filter(Boolean);

  return (

    <article

      className={[

        "group relative overflow-hidden rounded-[22px] border p-4 transition-all duration-200",

        "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]",

        style.card,

        !isOpen ? "opacity-70" : "",

      ].join(" ")}

    >

      {isOpen && (

        <span

          className={[

            "absolute right-4 top-4 h-2.5 w-2.5 rounded-full ring-4 ring-white",

            style.dot,

          ].join(" ")}

        />

      )}

      <div className="flex gap-3">

        <span

          className={[

            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1",

            style.icon,

          ].join(" ")}

        >

          {severity === "CRITICAL" || severity === "HIGH" ? (

            <AlertTriangle className="h-[18px] w-[18px]" />

          ) : (

            <CircleAlert className="h-[18px] w-[18px]" />

          )}

        </span>

        <div className="min-w-0 flex-1 pr-3">

          <div className="flex flex-wrap items-center gap-2">

            <span

              className={[

                "inline-flex rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.08em] ring-1",

                style.badge,

              ].join(" ")}

            >

              {style.label}

            </span>

            {!isOpen && (

              <span className="text-[9px] font-semibold text-slate-400">

                อ่านแล้ว

              </span>

            )}

          </div>

          <h4 className="mt-2 text-[13px] font-extrabold leading-5 text-slate-900">

            {alert.title}

          </h4>

          <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.7] text-slate-500">

            {alert.message}

          </p>

          {location.length > 0 && (

            <div className="mt-3 flex flex-wrap gap-1.5">

              {location.map((item, index) => (

                <span

                  key={`${item}-${index}`}

                  className="max-w-full truncate rounded-lg bg-white/90 px-2 py-1 text-[9px] font-semibold text-slate-500 ring-1 ring-slate-200"

                >

                  {item}

                </span>

              ))}

            </div>

          )}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3">

            <span className="text-[9px] font-medium text-slate-400">

              {timeLabel}

            </span>

            {isOpen && (

              <button

                type="button"

                onClick={() => onAcknowledge(alert.id)}

                className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[9px] font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200"

              >

                <Check className="h-3 w-3" />

                รับทราบ

              </button>

            )}

          </div>

        </div>

      </div>

    </article>

  );

}

function AIAssistantPanel({

  onClose,

  managerName,

  externalRequest,

}: {

  onClose: () => void;

  managerName: string;

  externalRequest: ExternalAssistantRequest | null;

}) {

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [draft, setDraft] = useState("");

  const [sending, setSending] = useState(false);

  const [provider, setProvider] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [image, setImage] = useState<{

    name: string;

    mimeType: string;

    data: string;

    preview: string;

  } | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handledExternalRequestRef = useRef<number | null>(null);

  const hasMessages = messages.length > 0;

  const historyForApi = useMemo(

    () =>

      messages.slice(-8).map(({ role, content }) => ({

        role,

        content,

      })),

    [messages],

  );

  useEffect(() => {

    requestAnimationFrame(() => {

      if (scrollRef.current) {

        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

      }

    });

  }, [messages, sending]);

  useEffect(() => {

    const timer = window.setTimeout(() => {

      textareaRef.current?.focus();

    }, 120);

    return () => window.clearTimeout(timer);

  }, []);

  async function handleImage(file?: File) {

    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {

      setError("รองรับรูป JPG, PNG และ WEBP เท่านั้น");

      return;

    }

    if (file.size > 8 * 1024 * 1024) {

      setError("รูปภาพต้องมีขนาดไม่เกิน 8 MB");

      return;

    }

    try {

      const preview = await new Promise<string>((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result));

        reader.onerror = () => reject(new Error("อ่านรูปภาพไม่สำเร็จ"));

        reader.readAsDataURL(file);

      });

      const data = preview.split(",")[1];

      if (!data) throw new Error("อ่านข้อมูลรูปภาพไม่สำเร็จ");

      setError("");

      setImage({

        name: file.name,

        mimeType: file.type,

        data,

        preview,

      });

    } catch (imageError) {

      setError(

        imageError instanceof Error

          ? imageError.message

          : "อ่านรูปภาพไม่สำเร็จ",

      );

    }

  }

  async function sendMessage(rawMessage?: string, evidence?: unknown) {

    const typedMessage = (rawMessage ?? draft).trim();

    if ((!typedMessage && !image) || sending) return;

    const finalMessage =

      typedMessage ||

      "ช่วยวิเคราะห์รูปนี้จากสิ่งที่มองเห็น และบอกสิ่งที่ควรตรวจสอบ";

    const attachedImage = image;

    const previousHistory = historyForApi;

    setError("");

    setDraft("");

    setSending(true);

    setMessages((current) => [

      ...current,

      {

        role: "user",

        content: finalMessage,

        imagePreview: attachedImage?.preview,

        imageName: attachedImage?.name,

      },

    ]);

    setImage(null);

    try {

      const response = await fetch("/api/manager/assistant", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        credentials: "include",

        body: JSON.stringify({

          message: finalMessage,

          history: previousHistory,

          image: attachedImage

            ? {

                name: attachedImage.name,

                mimeType: attachedImage.mimeType,

                data: attachedImage.data,

              }

            : undefined,

          evidence,

        }),

      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {

        throw new Error(

          `Assistant API returned ${response.status} instead of JSON`,

        );

      }

      const data = (await response.json()) as AssistantResponse;

      if (!response.ok) {

        throw new Error(

          data.message || `Assistant request failed (${response.status})`,

        );

      }

      const answer = data.answer?.trim();

      if (!answer) {

        throw new Error("Assistant did not return an answer");

      }

      setProvider(

        data.provider === "GEMINI"

          ? data.model

            ? `Gemini · ${data.model}`

            : "Gemini"

          : "Local evidence",

      );

      setMessages((current) => [

        ...current,

        { role: "assistant", content: answer },

      ]);

    } catch (requestError) {

      console.error("Manager assistant request error:", requestError);

      setError(

        requestError instanceof Error

          ? requestError.message

          : "ไม่สามารถเชื่อมต่อG-Fayได้",

      );

    } finally {

      setSending(false);

    }

  }

  useEffect(() => {

    if (!externalRequest) return;

    if (handledExternalRequestRef.current === externalRequest.id) return;

    handledExternalRequestRef.current = externalRequest.id;

    void sendMessage(

      externalRequest.prompt,

      externalRequest.evidence,

    );

  }, [externalRequest]);

  function handleSubmit(event: FormEvent) {

    event.preventDefault();

    void sendMessage();

  }

  function handleKeyDown(

    event: KeyboardEvent<HTMLTextAreaElement>,

  ) {

    if (event.key === "Enter" && !event.shiftKey) {

      event.preventDefault();

      void sendMessage();

    }

  }

  return (

    <div className="fixed inset-0 z-[100]">

      <button

        type="button"

        aria-label="ปิดG-Fay"

        className="absolute inset-0 bg-slate-950/25 backdrop-blur-[2px]"

        onClick={onClose}

      />

      <section className="absolute bottom-0 right-0 flex h-[min(780px,calc(100vh-24px))] w-full flex-col overflow-hidden rounded-t-[28px] border border-slate-200/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] sm:bottom-5 sm:right-5 sm:w-[min(500px,calc(100vw-40px))] sm:rounded-[28px]">

        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-emerald-50/35 to-cyan-50/30 px-5 py-4">

          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400" />

          <div className="flex items-center gap-3">

            <span className="relative h-13 w-13 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">

              <img

                src="/images/g-fay.gif"

                alt="G-Fay"

                className="h-12 w-12 object-cover object-top"

              />

              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />

            </span>

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <p className="truncate text-[15px] font-extrabold text-slate-950">

                  G-Fay

                </p>

                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">

                  GreenFactory AI

                </span>

              </div>

              <p className="mt-0.5 text-[11px] text-slate-500">

                ผู้ช่วยวิเคราะห์โรงงาน · powered by Gemini

              </p>

            </div>

            <button

              type="button"

              onClick={onClose}

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"

              aria-label="ปิด"

            >

              <X className="h-4 w-4" />

            </button>

          </div>

        </div>

        <div

          ref={scrollRef}

          className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-white px-4 py-5 sm:px-5"

        >

          {!hasMessages && (

            <div>

              <div className="flex items-start gap-3">

                <AssistantAvatar />

                <div className="max-w-[86%] rounded-[22px] rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">

                  <p className="text-sm font-bold text-slate-900">

                    สวัสดีครับ คุณ{managerName}

                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">

                    ผมG-Fay ช่วยดูข้อมูลโรงงาน วิเคราะห์ความผิดปกติ

                    Carbon และรูปจากหน้างานได้ครับ

                  </p>

                </div>

              </div>

              <div className="mt-6">

                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">

                  ลองถามG-Fay

                </p>

                <div className="grid gap-2">

                  {SUGGESTED_PROMPTS.map((prompt) => (

                    <button

                      key={prompt}

                      type="button"

                      onClick={() => void sendMessage(prompt)}

                      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"

                    >

                      <span className="text-xs font-semibold leading-5 text-slate-700">

                        {prompt}

                      </span>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-emerald-700" />

                    </button>

                  ))}

                </div>

              </div>

              <button

                type="button"

                onClick={() => fileInputRef.current?.click()}

                className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/30"

              >

                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

                  <ImagePlus className="h-4 w-4" />

                </span>

                <span>

                  <span className="block text-xs font-bold text-slate-700">

                    ส่งรูปให้G-Fayดู

                  </span>

                  <span className="mt-0.5 block text-[10px] text-slate-400">

                    เครื่องจักร · มิเตอร์ · หน้างาน · JPG / PNG / WEBP

                  </span>

                </span>

              </button>

            </div>

          )}

          {hasMessages && (

            <div className="space-y-5">

              {messages.map((message, index) => (

                <ChatBubble

                  key={`${message.role}-${index}`}

                  message={message}

                />

              ))}

              {sending && (

                <div className="flex items-start gap-2.5">

                  <AssistantAvatar />

                  <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">

                    <div className="flex items-center gap-2 text-xs text-slate-500">

                      <LoaderCircle className="h-4 w-4 animate-spin text-emerald-700" />

                      G-Fayกำลังตรวจสอบ...

                    </div>

                  </div>

                </div>

              )}

            </div>

          )}

          {error && (

            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700">

              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>

            </div>

          )}

        </div>

        <form

          onSubmit={handleSubmit}

          className="border-t border-slate-100 bg-white p-4"

        >

          <input

            ref={fileInputRef}

            type="file"

            accept="image/jpeg,image/png,image/webp"

            className="hidden"

            onChange={(event) => {

              void handleImage(event.target.files?.[0]);

              event.currentTarget.value = "";

            }}

          />

          {image && (

            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

              <div className="relative">

                <img

                  src={image.preview}

                  alt={image.name}

                  className="max-h-44 w-full object-contain bg-slate-100"

                />

                <button

                  type="button"

                  onClick={() => setImage(null)}

                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur hover:bg-slate-950"

                  aria-label="ลบรูป"

                >

                  <X className="h-4 w-4" />

                </button>

              </div>

              <div className="flex items-center justify-between gap-3 px-3 py-2">

                <p className="min-w-0 truncate text-[10px] font-semibold text-slate-600">

                  {image.name}

                </p>

                <span className="shrink-0 text-[9px] font-bold text-emerald-700">

                  พร้อมส่ง

                </span>

              </div>

            </div>

          )}

          <div className="rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all focus-within:border-emerald-400 focus-within:shadow-[0_10px_32px_rgba(16,185,129,0.10)] focus-within:ring-4 focus-within:ring-emerald-50">

            <textarea

              ref={textareaRef}

              rows={1}

              value={draft}

              onChange={(event) => setDraft(event.target.value)}

              onKeyDown={handleKeyDown}

              placeholder="ถามG-Fayเกี่ยวกับโรงงาน..."

              className="max-h-28 min-h-[46px] w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"

            />

            <div className="flex items-center justify-between gap-3 px-1 pb-1">

              <div className="flex min-w-0 items-center gap-1">

                <button

                  type="button"

                  onClick={() => fileInputRef.current?.click()}

                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700"

                >

                  <Paperclip className="h-4 w-4" />

                  แนบรูป

                </button>

                <span className="hidden truncate text-[10px] text-slate-400 sm:block">

                  {provider ?? "Gemini multimodal"}

                </span>

              </div>

              <button

                type="submit"

                disabled={(!draft.trim() && !image) || sending}

                className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"

              >

                {sending ? (

                  <LoaderCircle className="h-4 w-4 animate-spin" />

                ) : (

                  <Send className="h-3.5 w-3.5" />

                )}

                ส่ง

              </button>

            </div>

          </div>

          <p className="mt-2 text-center text-[9px] leading-4 text-slate-400">

            G-Fayอธิบายจากข้อมูลระบบและสิ่งที่มองเห็นในรูป ควรตรวจสอบข้อมูลต้นทางก่อนตัดสินใจ

          </p>

        </form>

      </section>

    </div>

  );

}

function AssistantAvatar() {

  return (

    <span className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">

      <img

        src="/images/g-fay.gif"

        alt="G-Fay"

        className="h-full w-full object-cover object-top"

      />

    </span>

  );

}

function renderInlineMarkdown(text: string) {

  const parts = text.split(/(\\*\\*[^*]+\\*\\*)/g);

  return parts.map((part, index) => {

    if (part.startsWith("**") && part.endsWith("**")) {

      return (

        <strong key={index} className="font-bold text-slate-900">

          {part.slice(2, -2)}

        </strong>

      );

    }

    return <span key={index}>{part}</span>;

  });

}

function AssistantText({ text }: { text: string }) {

  const lines = text.split("\n");

  return (

    <div className="space-y-1.5">

      {lines.map((line, index) => {

        const trimmed = line.trim();

        if (!trimmed) {

          return <div key={index} className="h-1" />;

        }

        if (

          /^(Finding|Evidence|Next check|ข้อสรุป|หลักฐาน|สิ่งที่ควรตรวจสอบ)\s*:/i.test(

            trimmed,

          )

        ) {

          return (

            <p

              key={index}

              className="pt-1 text-[11px] font-extrabold uppercase tracking-[0.05em] text-emerald-700"

            >

              {renderInlineMarkdown(trimmed)}

            </p>

          );

        }

        if (/^[-•]\s+/.test(trimmed)) {

          return (

            <div key={index} className="flex gap-2">

              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-600" />

              <p className="min-w-0">

                {renderInlineMarkdown(

                  trimmed.replace(/^[-•]\s+/, ""),

                )}

              </p>

            </div>

          );

        }

        return (

          <p key={index}>{renderInlineMarkdown(line)}</p>

        );

      })}

    </div>

  );

}

function ChatBubble({

  message,

}: {

  message: ChatMessage;

}) {

  if (message.role === "user") {

    return (

      <div className="flex justify-end">

        <div className="max-w-[86%] overflow-hidden rounded-[22px] rounded-tr-md bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]">

          {message.imagePreview && (

            <div className="border-b border-white/10 bg-black/20">

              <img

                src={message.imagePreview}

                alt={message.imageName || "รูปที่แนบ"}

                className="max-h-[280px] w-full object-contain"

              />

            </div>

          )}

          <div className="px-4 py-3 text-sm leading-6">

            {message.content}

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="flex items-start gap-2.5">

      <AssistantAvatar />

      <div className="max-w-[88%] rounded-[22px] rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.04)]">

        <AssistantText text={message.content} />

      </div>

    </div>

  );

}

function MobileMenuGroup({
  label,
  open,
  active,
  onToggle,
  items,
  isActive,
  onNavigate,
}: {
  label: string;
  open: boolean;
  active: boolean;
  onToggle: () => void;
  items: typeof ANALYTICS_ITEMS | typeof OPERATIONS_ITEMS;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={[
          "flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-semibold transition",
          active
            ? "bg-emerald-50 text-emerald-800"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
      >
        <span>{label}</span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-1 border-l border-slate-200 pl-3">
          {items.map((item) => {
            const Icon = item.icon;
            const itemActive = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={[
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  itemActive
                    ? "bg-emerald-50 font-bold text-emerald-800"
                    : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    itemActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{item.label}</span>
                  <span className="mt-0.5 block text-[10px] font-normal leading-4 text-slate-400">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileLink({
  href,
  label,
  active = false,
  onNavigate,
}: {
  href: string;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold transition",
        active
          ? "bg-emerald-50 text-emerald-800"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

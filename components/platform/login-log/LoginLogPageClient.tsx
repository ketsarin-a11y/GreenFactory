"use client";

import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  Download,
  FileSpreadsheet,
  Filter,
  Globe2,
  Laptop2,
  LocateFixed,
  LockKeyhole,
  MapPin,
  MonitorSmartphone,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Smartphone,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type LoginStatus = "SUCCESS" | "FAILED";

type DeviceType = "Desktop" | "Mobile" | "Tablet";

type LoginLogItem = {
  id: number;
  date: string;
  time: string;
  userName: string;
  email: string;
  initials: string;
  avatarClassName: string;
  role: string;
  roleClassName: string;
  company: string;
  status: LoginStatus;
  ipAddress: string;
  operatingSystem: string;
  browser: string;
  deviceType: DeviceType;
  location: string;
  country: string;
  reason: string;
  sessionId: string;
};

const LOGIN_LOGS: LoginLogItem[] = [
  {
    id: 1,
    date: "10 พ.ค. 2567",
    time: "15:42:11",
    userName: "user.env01",
    email: "user.env01@factory-a.com",
    initials: "EO",
    avatarClassName: "bg-violet-500 text-white",
    role: "Environment Officer",
    roleClassName: "bg-violet-50 text-violet-700",
    company: "บริษัท โรงงาน A จำกัด",
    status: "SUCCESS",
    ipAddress: "192.168.1.55",
    operatingSystem: "Windows 10",
    browser: "Chrome 124",
    deviceType: "Desktop",
    location: "กรุงเทพมหานคร",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-154211",
  },
  {
    id: 2,
    date: "10 พ.ค. 2567",
    time: "15:35:09",
    userName: "user.fm01",
    email: "user.fm01@factory-a.com",
    initials: "FM",
    avatarClassName: "bg-orange-500 text-white",
    role: "Factory Manager",
    roleClassName: "bg-orange-50 text-orange-700",
    company: "บริษัท โรงงาน A จำกัด",
    status: "SUCCESS",
    ipAddress: "192.168.1.33",
    operatingSystem: "Windows 11",
    browser: "Edge 124",
    deviceType: "Desktop",
    location: "ชลบุรี",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-153509",
  },
  {
    id: 3,
    date: "10 พ.ค. 2567",
    time: "15:21:48",
    userName: "admin@company-a.com",
    email: "admin@company-a.com",
    initials: "CA",
    avatarClassName: "bg-blue-600 text-white",
    role: "Company Admin",
    roleClassName: "bg-blue-50 text-blue-700",
    company: "บริษัท โรงงาน A จำกัด",
    status: "SUCCESS",
    ipAddress: "192.168.1.21",
    operatingSystem: "macOS",
    browser: "Safari 17",
    deviceType: "Desktop",
    location: "นครราชสีมา",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-152148",
  },
  {
    id: 4,
    date: "10 พ.ค. 2567",
    time: "15:10:22",
    userName: "admin@greenfactory.com",
    email: "admin@greenfactory.com",
    initials: "PA",
    avatarClassName: "bg-emerald-700 text-white",
    role: "Platform Admin",
    roleClassName: "bg-emerald-50 text-emerald-700",
    company: "แพลตฟอร์มส่วนกลาง",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
    operatingSystem: "Windows 11",
    browser: "Chrome 124",
    deviceType: "Desktop",
    location: "กรุงเทพมหานคร",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-151022",
  },
  {
    id: 5,
    date: "10 พ.ค. 2567",
    time: "14:59:31",
    userName: "user.env02",
    email: "user.env02@factory-b.com",
    initials: "EO",
    avatarClassName: "bg-violet-500 text-white",
    role: "Environment Officer",
    roleClassName: "bg-violet-50 text-violet-700",
    company: "บริษัท โรงงาน B จำกัด",
    status: "FAILED",
    ipAddress: "192.168.1.77",
    operatingSystem: "Android 14",
    browser: "Chrome 124",
    deviceType: "Mobile",
    location: "ระยอง",
    country: "ไทย",
    reason: "รหัสผ่านไม่ถูกต้อง",
    sessionId: "SES-240510-145931",
  },
  {
    id: 6,
    date: "10 พ.ค. 2567",
    time: "14:45:03",
    userName: "user.fm02",
    email: "user.fm02@factory-b.com",
    initials: "FM",
    avatarClassName: "bg-orange-500 text-white",
    role: "Factory Manager",
    roleClassName: "bg-orange-50 text-orange-700",
    company: "บริษัท โรงงาน B จำกัด",
    status: "SUCCESS",
    ipAddress: "192.168.1.78",
    operatingSystem: "Windows 10",
    browser: "Chrome 123",
    deviceType: "Desktop",
    location: "ระยอง",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-144503",
  },
  {
    id: 7,
    date: "10 พ.ค. 2567",
    time: "14:30:19",
    userName: "admin@company-b.com",
    email: "admin@company-b.com",
    initials: "CA",
    avatarClassName: "bg-blue-600 text-white",
    role: "Company Admin",
    roleClassName: "bg-blue-50 text-blue-700",
    company: "บริษัท โรงงาน B จำกัด",
    status: "SUCCESS",
    ipAddress: "192.168.1.22",
    operatingSystem: "macOS",
    browser: "Chrome 124",
    deviceType: "Desktop",
    location: "สมุทรปราการ",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-143019",
  },
  {
    id: 8,
    date: "10 พ.ค. 2567",
    time: "14:12:06",
    userName: "user.env03",
    email: "user.env03@factory-c.com",
    initials: "EO",
    avatarClassName: "bg-violet-500 text-white",
    role: "Environment Officer",
    roleClassName: "bg-violet-50 text-violet-700",
    company: "บริษัท โรงงาน C จำกัด",
    status: "FAILED",
    ipAddress: "192.168.1.99",
    operatingSystem: "iOS 17",
    browser: "Safari 17",
    deviceType: "Mobile",
    location: "เชียงใหม่",
    country: "ไทย",
    reason: "บัญชีถูกระงับชั่วคราว",
    sessionId: "SES-240510-141206",
  },
  {
    id: 9,
    date: "10 พ.ค. 2567",
    time: "13:58:44",
    userName: "user.fm03",
    email: "user.fm03@factory-c.com",
    initials: "FM",
    avatarClassName: "bg-orange-500 text-white",
    role: "Factory Manager",
    roleClassName: "bg-orange-50 text-orange-700",
    company: "บริษัท โรงงาน C จำกัด",
    status: "SUCCESS",
    ipAddress: "192.168.1.23",
    operatingSystem: "Windows 11",
    browser: "Edge 124",
    deviceType: "Desktop",
    location: "เชียงใหม่",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-135844",
  },
  {
    id: 10,
    date: "10 พ.ค. 2567",
    time: "13:40:55",
    userName: "admin@company-c.com",
    email: "admin@company-c.com",
    initials: "CA",
    avatarClassName: "bg-blue-600 text-white",
    role: "Company Admin",
    roleClassName: "bg-blue-50 text-blue-700",
    company: "บริษัท โรงงาน C จำกัด",
    status: "SUCCESS",
    ipAddress: "192.168.1.24",
    operatingSystem: "Windows 10",
    browser: "Chrome 124",
    deviceType: "Desktop",
    location: "เชียงใหม่",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-134055",
  },
  {
    id: 11,
    date: "10 พ.ค. 2567",
    time: "13:28:30",
    userName: "user.operator01",
    email: "operator01@factory-a.com",
    initials: "OP",
    avatarClassName: "bg-cyan-600 text-white",
    role: "Operator",
    roleClassName: "bg-cyan-50 text-cyan-700",
    company: "บริษัท โรงงาน A จำกัด",
    status: "FAILED",
    ipAddress: "10.10.1.54",
    operatingSystem: "Android 13",
    browser: "Chrome 123",
    deviceType: "Mobile",
    location: "นครราชสีมา",
    country: "ไทย",
    reason: "ยืนยันตัวตนไม่สำเร็จ",
    sessionId: "SES-240510-132830",
  },
  {
    id: 12,
    date: "10 พ.ค. 2567",
    time: "13:12:16",
    userName: "user.operator02",
    email: "operator02@factory-b.com",
    initials: "OP",
    avatarClassName: "bg-cyan-600 text-white",
    role: "Operator",
    roleClassName: "bg-cyan-50 text-cyan-700",
    company: "บริษัท โรงงาน B จำกัด",
    status: "SUCCESS",
    ipAddress: "10.10.1.68",
    operatingSystem: "Android 14",
    browser: "Chrome 124",
    deviceType: "Mobile",
    location: "ระยอง",
    country: "ไทย",
    reason: "เข้าสู่ระบบสำเร็จ",
    sessionId: "SES-240510-131216",
  },
];

const PAGE_SIZE = 10;

export default function LoginLogPageClient() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ทั้งหมด");
  const [company, setCompany] = useState("ทั้งหมด");
  const [status, setStatus] = useState("ทั้งหมด");
  const [device, setDevice] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<LoginLogItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const roles = useMemo(
    () => ["ทั้งหมด", ...Array.from(new Set(LOGIN_LOGS.map((item) => item.role)))],
    [],
  );

  const companies = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(LOGIN_LOGS.map((item) => item.company))),
    ],
    [],
  );

  const devices = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(LOGIN_LOGS.map((item) => item.deviceType))),
    ],
    [],
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return LOGIN_LOGS.filter((item) => {
      const matchesSearch =
        !keyword ||
        [
          item.userName,
          item.email,
          item.company,
          item.ipAddress,
          item.location,
          item.operatingSystem,
          item.browser,
        ].some((value) => value.toLowerCase().includes(keyword));

      const matchesRole = role === "ทั้งหมด" || item.role === role;
      const matchesCompany = company === "ทั้งหมด" || item.company === company;
      const matchesStatus = status === "ทั้งหมด" || item.status === status;
      const matchesDevice =
        device === "ทั้งหมด" || item.deviceType === device;

      return (
        matchesSearch &&
        matchesRole &&
        matchesCompany &&
        matchesStatus &&
        matchesDevice
      );
    });
  }, [search, role, company, status, device]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PAGE_SIZE),
  );

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;

    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page, totalPages]);

  const successCount = LOGIN_LOGS.filter(
    (item) => item.status === "SUCCESS",
  ).length;

  const failedCount = LOGIN_LOGS.filter(
    (item) => item.status === "FAILED",
  ).length;

  const successRate = Math.round(
    (successCount / LOGIN_LOGS.length) * 100,
  );

  const resetFilters = () => {
    setSearch("");
    setRole("ทั้งหมด");
    setCompany("ทั้งหมด");
    setStatus("ทั้งหมด");
    setDevice("ทั้งหมด");
    setPage(1);
  };

  const refreshData = () => {
    setIsRefreshing(true);

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const exportCsv = () => {
    const headers = [
      "วันที่",
      "เวลา",
      "ผู้ใช้งาน",
      "อีเมล",
      "บทบาท",
      "บริษัท",
      "สถานะ",
      "IP Address",
      "ระบบปฏิบัติการ",
      "เบราว์เซอร์",
      "อุปกรณ์",
      "ตำแหน่ง",
      "เหตุผล",
    ];

    const rows = filteredItems.map((item) => [
      item.date,
      item.time,
      item.userName,
      item.email,
      item.role,
      item.company,
      item.status === "SUCCESS" ? "สำเร็จ" : "ไม่สำเร็จ",
      item.ipAddress,
      item.operatingSystem,
      item.browser,
      item.deviceType,
      `${item.location}, ${item.country}`,
      item.reason,
    ]);

    const escapeCsv = (value: string) =>
      `"${value.replaceAll('"', '""')}"`;

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "greenfactory-login-log.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span>ระบบและการตั้งค่า</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Login Log</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
              Login Log
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              ตรวจสอบประวัติการเข้าสู่ระบบ อุปกรณ์ ตำแหน่ง และเหตุการณ์ที่มีความเสี่ยง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportOpen((current) => !current)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                ส่งออกข้อมูล
                <ChevronDown className="h-4 w-4" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    ส่งออกเป็น CSV
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPage(1)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
            >
              <Filter className="h-4 w-4" />
              ตัวกรอง
            </button>

            <button
              type="button"
              onClick={refreshData}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              รีเฟรช
            </button>
          </div>
        </header>

        <section className="mb-5 grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
          <SecurityScoreCard
            successRate={successRate}
            successCount={1812}
            totalCount={1872}
          />

          <MetricCard
            label="เข้าสู่ระบบทั้งหมด"
            value="1,872"
            helper="ครั้ง"
            icon={<UsersRound className="h-5 w-5" />}
            iconClassName="bg-emerald-50 text-emerald-600"
            footer="เพิ่มขึ้น 8.2% จากเดือนก่อน"
          />

          <MetricCard
            label="เข้าสู่ระบบไม่สำเร็จ"
            value="60"
            helper="ครั้ง"
            icon={<ShieldX className="h-5 w-5" />}
            iconClassName="bg-rose-50 text-rose-600"
            footer="คิดเป็น 3.21% ของทั้งหมด"
            danger
          />

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  ความเคลื่อนไหวล่าสุด
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  10 พ.ค. 2567
                </p>

                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  15:42:11 น.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                user.env01
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Windows 10 · Chrome 124
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  ภาพรวมความปลอดภัย
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  สัดส่วนการเข้าสู่ระบบในช่วงเวลาที่เลือก
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                สถานะปกติ
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SecurityProgress
                label="เข้าสู่ระบบสำเร็จ"
                value={96.79}
                count="1,812 ครั้ง"
                barClassName="bg-emerald-500"
              />

              <SecurityProgress
                label="เข้าสู่ระบบไม่สำเร็จ"
                value={3.21}
                count="60 ครั้ง"
                barClassName="bg-rose-500"
              />

              <SecurityProgress
                label="อุปกรณ์ที่เชื่อถือได้"
                value={89.4}
                count="42 อุปกรณ์"
                barClassName="bg-blue-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  เหตุการณ์ที่ควรตรวจสอบ
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  พบการเข้าสู่ระบบล้มเหลวหลายครั้งจากบัญชีและอุปกรณ์เดิม
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStatus("FAILED");
                setPage(1);
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 transition hover:text-orange-900"
            >
              ดูรายการที่ไม่สำเร็จ
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-200 p-4">
            <div className="grid gap-3 2xl:grid-cols-[minmax(270px,1.5fr)_repeat(4,minmax(145px,0.6fr))_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหา ชื่อผู้ใช้ อีเมล บริษัท IP หรือตำแหน่ง"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <FilterSelect
                label="ผู้ใช้งาน"
                value={role}
                options={roles}
                onChange={(value) => {
                  setRole(value);
                  setPage(1);
                }}
              />

              <FilterSelect
                label="บริษัท"
                value={company}
                options={companies}
                onChange={(value) => {
                  setCompany(value);
                  setPage(1);
                }}
              />

              <FilterSelect
                label="สถานะ"
                value={status}
                options={["ทั้งหมด", "SUCCESS", "FAILED"]}
                getLabel={(value) => {
                  if (value === "SUCCESS") return "สำเร็จ";
                  if (value === "FAILED") return "ไม่สำเร็จ";
                  return value;
                }}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
              />

              <FilterSelect
                label="อุปกรณ์"
                value={device}
                options={devices}
                onChange={(value) => {
                  setDevice(value);
                  setPage(1);
                }}
              />

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                <RefreshCw className="h-4 w-4" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] border-collapse">
              <thead className="bg-slate-50/90">
                <tr className="border-b border-slate-200">
                  <TableHeader className="w-16">#</TableHeader>
                  <TableHeader>วันที่และเวลา</TableHeader>
                  <TableHeader>ผู้ใช้งาน</TableHeader>
                  <TableHeader>บทบาท</TableHeader>
                  <TableHeader>บริษัท</TableHeader>
                  <TableHeader>สถานะ</TableHeader>
                  <TableHeader>IP Address</TableHeader>
                  <TableHeader>อุปกรณ์ / เบราว์เซอร์</TableHeader>
                  <TableHeader>ตำแหน่งที่ตั้ง</TableHeader>
                  <TableHeader className="w-14" />
                </tr>
              </thead>

              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`cursor-pointer border-b border-slate-100 transition last:border-b-0 ${
                      item.status === "FAILED"
                        ? "bg-rose-50/20 hover:bg-rose-50/60"
                        : "hover:bg-emerald-50/35"
                    }`}
                  >
                    <TableCell className="font-semibold text-slate-500">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-700">
                        {item.date}
                      </div>

                      <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        {item.time}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.avatarClassName}`}
                        >
                          {item.initials}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800">
                            {item.userName}
                          </div>

                          <div className="mt-0.5 max-w-[190px] truncate text-xs text-slate-400">
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.roleClassName}`}
                      >
                        {item.role}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 font-medium text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {item.company}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>

                    <TableCell>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600">
                        {item.ipAddress}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <DeviceIcon type={item.deviceType} />
                        </div>

                        <div>
                          <div className="font-semibold text-slate-700">
                            {item.operatingSystem}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-400">
                            {item.browser}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-rose-400" />

                        <div>
                          <div className="font-semibold text-slate-700">
                            {item.location}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-400">
                            {item.country}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm"
                        aria-label="ดูรายละเอียด"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedItems.length === 0 && (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>

                <h3 className="font-semibold text-slate-800">
                  ไม่พบประวัติการเข้าสู่ระบบ
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              แสดง{" "}
              <span className="font-semibold text-slate-700">
                {filteredItems.length === 0
                  ? 0
                  : (page - 1) * PAGE_SIZE + 1}
                -
                {Math.min(page * PAGE_SIZE, filteredItems.length)}
              </span>{" "}
              จาก{" "}
              <span className="font-semibold text-slate-700">
                {filteredItems.length}
              </span>{" "}
              รายการ
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                    page === pageNumber
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedItem && (
        <>
          <button
            type="button"
            aria-label="ปิดรายละเอียด"
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[2px]"
          />

          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Login session
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  รายละเอียดการเข้าสู่ระบบ
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div
                className={`mb-6 rounded-2xl border p-5 ${
                  selectedItem.status === "SUCCESS"
                    ? "border-emerald-100 bg-emerald-50/70"
                    : "border-rose-100 bg-rose-50/70"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selectedItem.avatarClassName}`}
                  >
                    {selectedItem.initials}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">
                      {selectedItem.userName}
                    </h3>

                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {selectedItem.email}
                    </p>

                    <div className="mt-3">
                      <StatusBadge status={selectedItem.status} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <DetailItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="วันที่และเวลา"
                  value={`${selectedItem.date} เวลา ${selectedItem.time}`}
                />

                <DetailItem
                  icon={<Building2 className="h-4 w-4" />}
                  label="บริษัท"
                  value={selectedItem.company}
                />

                <DetailItem
                  icon={<UserRound className="h-4 w-4" />}
                  label="บทบาท"
                  value={selectedItem.role}
                />

                <DetailItem
                  icon={<Globe2 className="h-4 w-4" />}
                  label="IP Address"
                  value={selectedItem.ipAddress}
                  mono
                />

                <DetailItem
                  icon={<MonitorSmartphone className="h-4 w-4" />}
                  label="อุปกรณ์"
                  value={`${selectedItem.operatingSystem} / ${selectedItem.browser}`}
                />

                <DetailItem
                  icon={<LocateFixed className="h-4 w-4" />}
                  label="ตำแหน่ง"
                  value={`${selectedItem.location}, ${selectedItem.country}`}
                />

                <DetailItem
                  icon={<LockKeyhole className="h-4 w-4" />}
                  label="Session ID"
                  value={selectedItem.sessionId}
                  mono
                />
              </div>

              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  selectedItem.status === "SUCCESS"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    selectedItem.status === "SUCCESS"
                      ? "text-emerald-800"
                      : "text-rose-800"
                  }`}
                >
                  {selectedItem.status === "SUCCESS" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <CircleX className="h-4 w-4" />
                  )}

                  {selectedItem.status === "SUCCESS"
                    ? "เข้าสู่ระบบสำเร็จ"
                    : "เข้าสู่ระบบไม่สำเร็จ"}
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedItem.reason}
                </p>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function SecurityScoreCard({
  successRate,
  successCount,
  totalCount,
}: {
  successRate: number;
  successCount: number;
  totalCount: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-white shadow-[0_12px_28px_rgba(5,78,58,0.18)]">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-100">
            Security Health
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {successRate}%
            </span>

            <span className="pb-1 text-sm text-emerald-100">
              ปลอดภัย
            </span>
          </div>

          <p className="mt-3 text-xs leading-5 text-emerald-100/80">
            สำเร็จ {successCount.toLocaleString()} จาก{" "}
            {totalCount.toLocaleString()} ครั้ง
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${successRate}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  iconClassName,
  footer,
  danger = false,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  iconClassName: string;
  footer: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-950">
              {value}
            </span>

            <span className="pb-1 text-sm font-medium text-slate-400">
              {helper}
            </span>
          </div>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>

      <div
        className={`mt-4 flex items-center gap-1.5 text-xs font-medium ${
          danger ? "text-rose-600" : "text-slate-500"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            danger ? "bg-rose-500" : "bg-emerald-500"
          }`}
        />
        {footer}
      </div>
    </div>
  );
}

function SecurityProgress({
  label,
  value,
  count,
  barClassName,
}: {
  label: string;
  value: number;
  count: string;
  barClassName: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">{label}</p>

        <span className="text-sm font-bold text-slate-900">
          {value.toFixed(2)}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{ width: `${Math.max(value, 3)}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-400">{count}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: LoginStatus }) {
  const success = status === "SUCCESS";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        success
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
          : "bg-rose-50 text-rose-700 ring-rose-600/10"
      }`}
    >
      {success ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <CircleX className="h-3.5 w-3.5" />
      )}

      {success ? "สำเร็จ" : "ไม่สำเร็จ"}
    </span>
  );
}

function DeviceIcon({ type }: { type: DeviceType }) {
  if (type === "Mobile") {
    return <Smartphone className="h-4 w-4" />;
  }

  if (type === "Tablet") {
    return <MonitorSmartphone className="h-4 w-4" />;
  }

  return <Laptop2 className="h-4 w-4" />;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  getLabel,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  getLabel?: (value: string) => string;
}) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pb-1 pt-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel ? getLabel(option) : option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function TableHeader({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 text-sm align-middle ${className}`}
    >
      {children}
    </td>
  );
}

function DetailItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        {icon}
        {label}
      </div>

      <p
        className={`mt-2 text-sm font-semibold text-slate-800 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
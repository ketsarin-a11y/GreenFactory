"use client";

import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  Download,
  Edit3,
  Eye,
  FileClock,
  FileSpreadsheet,
  Filter,
  LogIn,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN";

type AuditLogItem = {
  id: number;
  date: string;
  time: string;
  userName: string;
  email: string;
  initials: string;
  avatarClassName: string;
  role: string;
  roleClassName: string;
  action: AuditAction;
  module: string;
  reference: string;
  description: string;
  ipAddress: string;
};

const AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 1,
    date: "10 พ.ค. 2567",
    time: "14:55:32",
    userName: "Platform Admin",
    email: "admin@greenfactory.com",
    initials: "PA",
    avatarClassName: "bg-emerald-700 text-white",
    role: "Platform Admin",
    roleClassName: "bg-emerald-50 text-emerald-700",
    action: "CREATE",
    module: "ประเภททรัพยากร",
    reference: "ไฟฟ้า (Electricity)",
    description: "เพิ่มประเภททรัพยากรใหม่",
    ipAddress: "192.168.1.10",
  },
  {
    id: 2,
    date: "10 พ.ค. 2567",
    time: "14:32:18",
    userName: "Company Admin",
    email: "ca@company-a.com",
    initials: "CA",
    avatarClassName: "bg-blue-600 text-white",
    role: "Company Admin",
    roleClassName: "bg-blue-50 text-blue-700",
    action: "UPDATE",
    module: "เครื่องจักรและจุดตรวจ",
    reference: "Boiler-01",
    description: "แก้ไขข้อมูลเครื่องจักร",
    ipAddress: "192.168.1.21",
  },
  {
    id: 3,
    date: "10 พ.ค. 2567",
    time: "13:21:07",
    userName: "Environment Officer",
    email: "eo1@company-a.com",
    initials: "EO",
    avatarClassName: "bg-violet-500 text-white",
    role: "Environment Officer",
    roleClassName: "bg-violet-50 text-violet-700",
    action: "CREATE",
    module: "บันทึกการใช้ทรัพยากร",
    reference: "REC-20240510-0012",
    description: "บันทึกการใช้ไฟฟ้า",
    ipAddress: "192.168.1.55",
  },
  {
    id: 4,
    date: "10 พ.ค. 2567",
    time: "12:15:44",
    userName: "Factory Manager",
    email: "fm@company-a.com",
    initials: "FM",
    avatarClassName: "bg-rose-400 text-white",
    role: "Factory Manager",
    roleClassName: "bg-orange-50 text-orange-700",
    action: "UPDATE",
    module: "KPI",
    reference: "KPI-2024-Q2",
    description: "อัปเดตค่าเป้าหมาย KPI",
    ipAddress: "192.168.1.33",
  },
  {
    id: 5,
    date: "10 พ.ค. 2567",
    time: "11:08:29",
    userName: "Company Admin",
    email: "ca@company-a.com",
    initials: "CA",
    avatarClassName: "bg-blue-600 text-white",
    role: "Company Admin",
    roleClassName: "bg-blue-50 text-blue-700",
    action: "DELETE",
    module: "ผู้ใช้งาน",
    reference: "user_temp01",
    description: "ลบผู้ใช้งานออกจากระบบ",
    ipAddress: "192.168.1.21",
  },
  {
    id: 6,
    date: "10 พ.ค. 2567",
    time: "10:45:19",
    userName: "Platform Admin",
    email: "admin@greenfactory.com",
    initials: "PA",
    avatarClassName: "bg-emerald-700 text-white",
    role: "Platform Admin",
    roleClassName: "bg-emerald-50 text-emerald-700",
    action: "UPDATE",
    module: "สิทธิ์การใช้งาน",
    reference: "Company Admin",
    description: "แก้ไขสิทธิ์การใช้งาน",
    ipAddress: "192.168.1.10",
  },
  {
    id: 7,
    date: "10 พ.ค. 2567",
    time: "09:30:02",
    userName: "Environment Officer",
    email: "eo1@company-a.com",
    initials: "EO",
    avatarClassName: "bg-violet-500 text-white",
    role: "Environment Officer",
    roleClassName: "bg-violet-50 text-violet-700",
    action: "CREATE",
    module: "ผลการคำนวณคาร์บอน",
    reference: "CARB-20240510-0008",
    description: "คำนวณคาร์บอนฟุตพริ้นท์",
    ipAddress: "192.168.1.55",
  },
  {
    id: 8,
    date: "10 พ.ค. 2567",
    time: "08:22:11",
    userName: "Factory Manager",
    email: "fm@company-a.com",
    initials: "FM",
    avatarClassName: "bg-rose-400 text-white",
    role: "Factory Manager",
    roleClassName: "bg-orange-50 text-orange-700",
    action: "UPDATE",
    module: "การแจ้งเตือน",
    reference: "ALERT-20240510-0003",
    description: "แก้ไขสถานะการแจ้งเตือน",
    ipAddress: "192.168.1.33",
  },
  {
    id: 9,
    date: "10 พ.ค. 2567",
    time: "08:05:57",
    userName: "Company Admin",
    email: "ca@company-a.com",
    initials: "CA",
    avatarClassName: "bg-blue-600 text-white",
    role: "Company Admin",
    roleClassName: "bg-blue-50 text-blue-700",
    action: "CREATE",
    module: "แผนก",
    reference: "Production",
    description: "เพิ่มแผนกใหม่",
    ipAddress: "192.168.1.21",
  },
  {
    id: 10,
    date: "10 พ.ค. 2567",
    time: "07:40:33",
    userName: "Platform Admin",
    email: "admin@greenfactory.com",
    initials: "PA",
    avatarClassName: "bg-emerald-700 text-white",
    role: "Platform Admin",
    roleClassName: "bg-emerald-50 text-emerald-700",
    action: "DELETE",
    module: "บริษัท",
    reference: "บริษัท ทดสอบ จำกัด",
    description: "ลบข้อมูลบริษัท",
    ipAddress: "192.168.1.10",
  },
  {
    id: 11,
    date: "9 พ.ค. 2567",
    time: "17:32:48",
    userName: "Platform Admin",
    email: "admin@greenfactory.com",
    initials: "PA",
    avatarClassName: "bg-emerald-700 text-white",
    role: "Platform Admin",
    roleClassName: "bg-emerald-50 text-emerald-700",
    action: "LOGIN",
    module: "ระบบ",
    reference: "LOGIN-001",
    description: "เข้าสู่ระบบสำเร็จ",
    ipAddress: "192.168.1.10",
  },
  {
    id: 12,
    date: "9 พ.ค. 2567",
    time: "16:18:09",
    userName: "Company Admin",
    email: "ca@company-a.com",
    initials: "CA",
    avatarClassName: "bg-blue-600 text-white",
    role: "Company Admin",
    roleClassName: "bg-blue-50 text-blue-700",
    action: "UPDATE",
    module: "ข้อมูลโรงงาน",
    reference: "FACTORY-A01",
    description: "แก้ไขข้อมูลโรงงาน",
    ipAddress: "192.168.1.21",
  },
];

const ACTION_LABEL: Record<AuditAction, string> = {
  CREATE: "เพิ่มข้อมูล",
  UPDATE: "แก้ไขข้อมูล",
  DELETE: "ลบข้อมูล",
  LOGIN: "เข้าสู่ระบบ",
};

const ACTION_STYLES: Record<
  AuditAction,
  {
    badge: string;
    icon: React.ReactNode;
  }
> = {
  CREATE: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    icon: <CirclePlus className="h-3.5 w-3.5" />,
  },
  UPDATE: {
    badge: "bg-blue-50 text-blue-700 ring-blue-600/10",
    icon: <Edit3 className="h-3.5 w-3.5" />,
  },
  DELETE: {
    badge: "bg-rose-50 text-rose-700 ring-rose-600/10",
    icon: <Trash2 className="h-3.5 w-3.5" />,
  },
  LOGIN: {
    badge: "bg-violet-50 text-violet-700 ring-violet-600/10",
    icon: <LogIn className="h-3.5 w-3.5" />,
  },
};

const PAGE_SIZE = 10;

export default function AuditLogPageClient() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ทั้งหมด");
  const [action, setAction] = useState("ทั้งหมด");
  const [moduleName, setModuleName] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const roles = useMemo(
    () => ["ทั้งหมด", ...Array.from(new Set(AUDIT_LOGS.map((item) => item.role)))],
    [],
  );

  const modules = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(AUDIT_LOGS.map((item) => item.module))),
    ],
    [],
  );

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return AUDIT_LOGS.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.userName,
          item.email,
          item.module,
          item.reference,
          item.description,
          item.ipAddress,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesRole = role === "ทั้งหมด" || item.role === role;
      const matchesAction =
        action === "ทั้งหมด" || item.action === action;
      const matchesModule =
        moduleName === "ทั้งหมด" || item.module === moduleName;

      return (
        matchesSearch &&
        matchesRole &&
        matchesAction &&
        matchesModule
      );
    });
  }, [search, role, action, moduleName]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const paginatedLogs = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    return filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLogs, page, totalPages]);

  const handleReset = () => {
    setSearch("");
    setRole("ทั้งหมด");
    setAction("ทั้งหมด");
    setModuleName("ทั้งหมด");
    setPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handleExportCsv = () => {
    const headers = [
      "วันที่",
      "เวลา",
      "ผู้ใช้งาน",
      "อีเมล",
      "บทบาท",
      "การกระทำ",
      "โมดูล",
      "รายการอ้างอิง",
      "รายละเอียด",
      "IP Address",
    ];

    const rows = filteredLogs.map((item) => [
      item.date,
      item.time,
      item.userName,
      item.email,
      item.role,
      ACTION_LABEL[item.action],
      item.module,
      item.reference,
      item.description,
      item.ipAddress,
    ]);

    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "greenfactory-audit-log.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span>ระบบและการตั้งค่า</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Audit Log</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
              Audit Log
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              ตรวจสอบประวัติการดำเนินการและความเคลื่อนไหวภายในระบบ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportOpen((value) => !value)}
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
                    onClick={handleExportCsv}
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
              onClick={() => {
                setPage(1);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
            >
              <Filter className="h-4 w-4" />
              ตัวกรอง
            </button>

            <button
              type="button"
              onClick={handleRefresh}
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
        </div>

        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="รายการทั้งหมด"
            value="1,248"
            helper="รายการ"
            trend="+12.4% เดือนนี้"
            icon={<FileClock className="h-5 w-5" />}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            label="ผู้ใช้งานไม่ซ้ำ"
            value="45"
            helper="คน"
            trend="ใช้งานวันนี้ 18 คน"
            icon={<UsersRound className="h-5 w-5" />}
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            label="เพิ่มข้อมูล"
            value="612"
            helper="รายการ"
            trend="49.0% ของทั้งหมด"
            icon={<CirclePlus className="h-5 w-5" />}
            iconClassName="bg-orange-50 text-orange-500"
          />

          <SummaryCard
            label="แก้ไขและลบ"
            value="636"
            helper="รายการ"
            trend="ตรวจสอบล่าสุดวันนี้"
            icon={<Activity className="h-5 w-5" />}
            iconClassName="bg-violet-50 text-violet-600"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-200 p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(150px,0.55fr))_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหา ผู้ใช้ รายการ โมดูล หรือ IP Address"
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
                label="การกระทำ"
                value={action}
                options={[
                  "ทั้งหมด",
                  "CREATE",
                  "UPDATE",
                  "DELETE",
                  "LOGIN",
                ]}
                getLabel={(value) =>
                  value === "ทั้งหมด"
                    ? value
                    : ACTION_LABEL[value as AuditAction]
                }
                onChange={(value) => {
                  setAction(value);
                  setPage(1);
                }}
              />

              <FilterSelect
                label="โมดูล"
                value={moduleName}
                options={modules}
                onChange={(value) => {
                  setModuleName(value);
                  setPage(1);
                }}
              />

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                <RefreshCw className="h-4 w-4" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1280px] w-full border-collapse">
              <thead className="bg-slate-50/90">
                <tr className="border-b border-slate-200">
                  <TableHeader className="w-16">#</TableHeader>
                  <TableHeader>วันที่และเวลา</TableHeader>
                  <TableHeader>ผู้ใช้งาน</TableHeader>
                  <TableHeader>บทบาท</TableHeader>
                  <TableHeader>การกระทำ</TableHeader>
                  <TableHeader>โมดูล</TableHeader>
                  <TableHeader>รายการที่เกี่ยวข้อง</TableHeader>
                  <TableHeader>รายละเอียด</TableHeader>
                  <TableHeader>IP Address</TableHeader>
                  <TableHeader className="w-14" />
                </tr>
              </thead>

              <tbody>
                {paginatedLogs.map((item, index) => {
                  const actionStyle = ACTION_STYLES[item.action];

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedLog(item)}
                      className="cursor-pointer border-b border-slate-100 transition last:border-b-0 hover:bg-emerald-50/35"
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
                            <div className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
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
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${actionStyle.badge}`}
                        >
                          {actionStyle.icon}
                          {ACTION_LABEL[item.action]}
                        </span>
                      </TableCell>

                      <TableCell className="font-medium text-slate-600">
                        {item.module}
                      </TableCell>

                      <TableCell className="font-medium text-slate-700">
                        {item.reference}
                      </TableCell>

                      <TableCell className="max-w-[230px]">
                        <p className="truncate text-slate-500">
                          {item.description}
                        </p>
                      </TableCell>

                      <TableCell>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600">
                          {item.ipAddress}
                        </span>
                      </TableCell>

                      <TableCell>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedLog(item);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm"
                          aria-label="ดูรายละเอียด"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {paginatedLogs.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">
                  ไม่พบข้อมูล Audit Log
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
                {filteredLogs.length === 0
                  ? 0
                  : (page - 1) * PAGE_SIZE + 1}
                -
                {Math.min(page * PAGE_SIZE, filteredLogs.length)}
              </span>{" "}
              จาก{" "}
              <span className="font-semibold text-slate-700">
                {filteredLogs.length}
              </span>{" "}
              รายการ
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
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
                ),
              )}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedLog && (
        <>
          <button
            type="button"
            aria-label="ปิดรายละเอียด"
            onClick={() => setSelectedLog(null)}
            className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[2px]"
          />

          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Audit detail
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  รายละเอียดกิจกรรม
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selectedLog.avatarClassName}`}
                  >
                    {selectedLog.initials}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {selectedLog.userName}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {selectedLog.email}
                    </p>

                    <span
                      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selectedLog.roleClassName}`}
                    >
                      {selectedLog.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <DetailItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="วันที่และเวลา"
                  value={`${selectedLog.date} เวลา ${selectedLog.time}`}
                />

                <DetailItem
                  icon={<Activity className="h-4 w-4" />}
                  label="การกระทำ"
                  value={ACTION_LABEL[selectedLog.action]}
                />

                <DetailItem
                  icon={<FileClock className="h-4 w-4" />}
                  label="โมดูล"
                  value={selectedLog.module}
                />

                <DetailItem
                  icon={<Eye className="h-4 w-4" />}
                  label="รายการอ้างอิง"
                  value={selectedLog.reference}
                />

                <DetailItem
                  icon={<UserRound className="h-4 w-4" />}
                  label="รายละเอียด"
                  value={selectedLog.description}
                />

                <DetailItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="IP Address"
                  value={selectedLog.ipAddress}
                  mono
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  สถานะการตรวจสอบ
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  กิจกรรมนี้ถูกบันทึกโดยระบบโดยอัตโนมัติ
                  และยังไม่มีการแก้ไขข้อมูล Audit Log
                </p>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  trend,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: React.ReactNode;
  iconClassName: string;
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

      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {trend}
      </div>
    </div>
  );
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
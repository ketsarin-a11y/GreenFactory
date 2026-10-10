import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Leaf,
  Sparkles,
  Wrench,
} from "lucide-react";

import ManagerReportCreator from "@/components/manager/ManagerReportCreator";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

function reportTone(type: string) {
  const value = type.toUpperCase();

  if (value.includes("CARBON")) return "bg-emerald-50 text-emerald-700";
  if (value.includes("MACHINE") || value.includes("EQUIPMENT"))
    return "bg-violet-50 text-violet-700";
  if (value.includes("ALERT")) return "bg-rose-50 text-rose-700";

  return "bg-sky-50 text-sky-700";
}

function reportStatus(status: string) {
  const value = status.toUpperCase();

  if (value === "COMPLETED" || value === "READY" || value === "SUCCESS") {
    return {
      label: "สำเร็จ",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (value === "FAILED") {
    return {
      label: "ไม่สำเร็จ",
      className: "bg-rose-50 text-rose-700",
    };
  }

  return {
    label: "กำลังดำเนินการ",
    className: "bg-amber-50 text-amber-700",
  };
}

export default async function ManagerReportsPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.roleName !== "MANAGER") redirect("/");
  if (!session.companyId) redirect("/");

  const [
    reports,
    resourceUsageCount,
    machineCount,
    openAlertCount,
    carbonResultCount,
  ] = await Promise.all([
    prisma.report.findMany({
      where: {
        companyId: session.companyId,
      },
      orderBy: {
        requestedAt: "desc",
      },
      take: 12,
      select: {
        reportId: true,
        reportName: true,
        reportType: true,
        reportFormat: true,
        filterScope: true,
        periodStart: true,
        periodEnd: true,
        reportStatus: true,
        filePath: true,
        downloadCount: true,
        requestedAt: true,
        generatedAt: true,
      },
    }),

    prisma.resourceUsage.count({
      where: {
        companyId: session.companyId,
        status: "ACTIVE",
      },
    }),

    prisma.machine.count({
      where: {
        status: "ACTIVE",
        productionLine: {
          department: {
            building: {
              factory: {
                companyId: session.companyId,
              },
            },
          },
        },
      },
    }),

    prisma.alert.count({
      where: {
        companyId: session.companyId,
        status: "OPEN",
      },
    }),

    prisma.carbonResult.count({
      where: {
        usage: {
          companyId: session.companyId,
          status: "ACTIVE",
        },
      },
    }),
  ]);

  const todayLabel = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(new Date());

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f8f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* =========================================================
            HERO
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:px-8">
          <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500" />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Reporting Workspace
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                รายงานและการส่งออกข้อมูล
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                สร้าง Resource Intelligence Report จากข้อมูลจริงของบริษัท
                พร้อมประวัติไฟล์ การติดตามสถานะ และการส่งออกสำหรับใช้งานต่อ
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  วันนี้
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {todayLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Data Source
                </div>
                <p className="mt-2 text-sm font-bold text-emerald-950">
                  Live Database
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            REPORT AREAS
        ========================================================== */}
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                DATA DOMAINS
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                ขอบเขตข้อมูลที่พร้อมใช้งาน
              </h2>
            </div>

            <span className="hidden text-xs text-slate-400 sm:block">
              อ้างอิงข้อมูลจริงจากระบบปัจจุบัน
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ReportTypeCard
              icon={BarChart3}
              title="Resource Usage"
              description="ไฟฟ้า น้ำ ก๊าซ และทรัพยากรการผลิต"
              value={`${resourceUsageCount.toLocaleString("th-TH")} records`}
              href="/manager/overview"
              tone="emerald"
              accent="Resource Analytics"
            />

            <ReportTypeCard
              icon={Leaf}
              title="Carbon"
              description="ผลการคำนวณ Carbon และ Scope"
              value={`${carbonResultCount.toLocaleString("th-TH")} results`}
              href="/manager/overview/carbon"
              tone="sky"
              accent="Carbon Intelligence"
            />

            <ReportTypeCard
              icon={Wrench}
              title="Machines"
              description="ข้อมูลเครื่องจักรและการใช้งานจริง"
              value={`${machineCount.toLocaleString("th-TH")} machines`}
              href="/manager/overview/equipment"
              tone="violet"
              accent="Operations"
            />

            <ReportTypeCard
              icon={AlertTriangle}
              title="Alerts"
              description="เหตุการณ์ที่ยังต้องตรวจสอบ"
              value={`${openAlertCount.toLocaleString("th-TH")} open`}
              href="/manager/alerts"
              tone="rose"
              accent="Risk Signal"
            />
          </div>
        </section>

        {/* =========================================================
            MAIN WORKSPACE
        ========================================================== */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

          {/* =======================================================
              REPORT HISTORY
          ======================================================== */}
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Clock3 className="h-4 w-4" />
                  </span>

                  <div>
                    <h2 className="text-base font-black text-slate-950">
                      รายงานล่าสุด
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      ประวัติการสร้างและดาวน์โหลดรายงาน
                    </p>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {reports.length} รายการล่าสุด
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-800">
                  ยังไม่มีรายงาน
                </p>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                  เลือกช่วงเวลาและรูปแบบไฟล์จาก Report Builder ด้านขวา
                  แล้วสร้างรายงานฉบับแรกได้ทันที
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report) => {
                  const status = reportStatus(report.reportStatus);

                  return (
                    <article
                      key={String(report.reportId)}
                      className="group px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                    >
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_170px_150px_120px] xl:items-center">

                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${reportTone(
                              report.reportType,
                            )}`}
                          >
                            {report.reportFormat === "XLSX" ? (
                              <FileSpreadsheet className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="max-w-[420px] truncate text-sm font-bold text-slate-900">
                                {report.reportName}
                              </p>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                              <span className="font-bold text-slate-500">
                                {report.reportFormat}
                              </span>

                              <span>
                                {report.reportType}
                              </span>

                              {report.downloadCount > 0 && (
                                <span>
                                  ดาวน์โหลดแล้ว {report.downloadCount} ครั้ง
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Reporting Period
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {report.periodStart || report.periodEnd
                              ? `${formatDate(report.periodStart)} - ${formatDate(
                                  report.periodEnd,
                                )}`
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Generated
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {formatDateTime(
                              report.generatedAt ?? report.requestedAt,
                            )}
                          </p>
                        </div>

                        <div className="xl:text-right">
                          {report.filePath ? (
                            <a
                              href={report.filePath}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-400">
                              ยังไม่มีไฟล์
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* =======================================================
              RIGHT RAIL
          ======================================================== */}
          <aside className="space-y-4">
            <section className="rounded-[28px] border border-slate-200 bg-white p-1 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <div className="rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-5 text-white">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/10">
                    <FileText className="h-4.5 w-4.5" />
                  </span>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">
                      REPORT BUILDER
                    </p>
                    <h2 className="mt-1 text-base font-black">
                      สร้างรายงานใหม่
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      เลือกช่วงเวลาและรูปแบบไฟล์ที่ต้องการ
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <ManagerReportCreator />
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    QUICK ACCESS
                  </p>
                  <h2 className="mt-1 text-sm font-black text-slate-950">
                    ตรวจข้อมูลก่อนสร้าง
                  </h2>
                </div>

                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>

              <div className="mt-4 space-y-2">
                <QuickLink
                  href="/manager/overview"
                  label="Resource Analytics"
                  description="ตรวจแนวโน้มและข้อมูลทรัพยากร"
                  tone="emerald"
                />

                <QuickLink
                  href="/manager/overview/carbon"
                  label="Carbon Intelligence"
                  description="ดู Carbon และ Scope ก่อนส่งออก"
                  tone="sky"
                />

                <QuickLink
                  href="/manager/overview/equipment"
                  label="Machine Operations"
                  description="เจาะข้อมูลระดับเครื่องจักร"
                  tone="violet"
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[26px] bg-slate-950 p-5 text-white shadow-sm">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <Database className="h-4 w-4" />
                  </span>

                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black tracking-[0.1em] text-emerald-300">
                    REAL DATA
                  </span>
                </div>

                <p className="mt-4 text-sm font-black">
                  ใช้ข้อมูลต้นทางจริง
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Resource Intelligence Report ดึงจาก ResourceUsage
                  ตามบริษัทและช่วงเวลาที่ Manager เลือก
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}


function ReportTypeCard({
  icon: Icon,
  title,
  description,
  value,
  href,
  tone,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  value: string;
  href: string;
  tone: "emerald" | "sky" | "violet" | "rose";
  accent: string;
}) {
  const tones = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      hover: "hover:border-emerald-200",
      label: "text-emerald-700",
    },
    sky: {
      icon: "bg-sky-50 text-sky-700 ring-sky-100",
      hover: "hover:border-sky-200",
      label: "text-sky-700",
    },
    violet: {
      icon: "bg-violet-50 text-violet-700 ring-violet-100",
      hover: "hover:border-violet-200",
      label: "text-violet-700",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700 ring-rose-100",
      hover: "hover:border-rose-200",
      label: "text-rose-700",
    },
  };

  const style = tones[tone];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)] ${style.hover}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${style.icon}`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </div>

      <p className={`mt-5 text-[10px] font-black uppercase tracking-[0.12em] ${style.label}`}>
        {accent}
      </p>

      <p className="mt-1 text-[15px] font-black text-slate-950">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[10px] font-semibold text-slate-400">
          Available data
        </span>

        <span className="text-xs font-black text-slate-700">
          {value}
        </span>
      </div>
    </Link>
  );
}

function QuickLink({
  href,
  label,
  description,
  tone,
}: {
  href: string;
  label: string;
  description: string;
  tone: "emerald" | "sky" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-900">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}

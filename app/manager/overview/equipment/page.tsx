import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  CircleGauge,
  Database,
  QrCode,
  RadioTower,
  Wrench,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

function formatNumber(value: unknown) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(number) ? number : 0);
}

function statusLabel(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "NORMAL" || normalized === "ACTIVE") {
    return {
      label: normalized === "NORMAL" ? "ปกติ" : "ใช้งาน",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }

  if (normalized === "WARNING") {
    return {
      label: "เฝ้าระวัง",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
    };
  }

  if (
    normalized === "OFFLINE" ||
    normalized === "INACTIVE" ||
    normalized === "STOPPED"
  ) {
    return {
      label: "ไม่พร้อมใช้งาน",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  }

  if (normalized === "ERROR" || normalized === "CRITICAL") {
    return {
      label: "ผิดปกติ",
      className: "bg-rose-50 text-rose-700 ring-rose-100",
    };
  }

  return {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  };
}

export default async function ManagerEquipmentPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.roleName !== "MANAGER") redirect("/");
  if (!session.companyId) redirect("/");

  const machines = await prisma.machine.findMany({
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

    select: {
      machineId: true,
      machineCode: true,
      machineName: true,
      operationalStatus: true,
      updatedAt: true,

      productionLine: {
        select: {
          lineName: true,

          department: {
            select: {
              departmentName: true,

              building: {
                select: {
                  buildingName: true,
                },
              },
            },
          },
        },
      },

      _count: {
        select: {
          sensors: true,
          qrCodes: true,
          resourceUsages: true,
          alerts: true,
        },
      },

      resourceUsages: {
        where: {
          status: "ACTIVE",
        },

        orderBy: {
          usageAt: "desc",
        },

        take: 1,

        select: {
          usageId: true,
          quantity: true,
          usageAt: true,
          sourceType: true,
          processingStatus: true,

          resourceType: {
            select: {
              resourceCode: true,
              resourceName: true,
            },
          },

          unit: {
            select: {
              symbol: true,
            },
          },
        },
      },

      // ยังดึง Alert จริงจากฐานข้อมูล
      // เพื่อใช้คำนวณ Summary Card ด้านบน
      // แต่จะไม่แสดงเป็นคอลัมน์ซ้ำ ๆ ในรายการเครื่องจักร
      alerts: {
        where: {
          status: "OPEN",
        },

        orderBy: {
          triggeredAt: "desc",
        },

        take: 1,

        select: {
          alertId: true,
          severity: true,
          title: true,
          triggeredAt: true,
        },
      },
    },

    orderBy: [
      {
        productionLine: {
          department: {
            building: {
              buildingName: "asc",
            },
          },
        },
      },
      {
        machineName: "asc",
      },
    ],
  });

  const totalMachines = machines.length;

  const machinesWithSensors = machines.filter(
    (machine) => machine._count.sensors > 0,
  ).length;

  const machinesWithQr = machines.filter(
    (machine) => machine._count.qrCodes > 0,
  ).length;

  const machinesWithOpenAlert = machines.filter(
    (machine) => machine.alerts.length > 0,
  ).length;

  const neverRecorded = machines.filter(
    (machine) => machine.resourceUsages.length === 0,
  ).length;

  const coverage =
    totalMachines > 0
      ? Math.round((machinesWithSensors / totalMachines) * 100)
      : 0;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f6f8f7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* =========================================================
            PAGE HEADER
        ========================================================== */}
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Wrench className="h-4 w-4" />
              Operations
            </div>

            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
              ติดตามเครื่องจักร
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
              ดูสถานะเครื่องจักร ความพร้อมของ Sensor และ QR
              พร้อมข้อมูลการใช้ทรัพยากรล่าสุดจาก ResourceUsage
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
            <span className="font-medium text-slate-900">
              {totalMachines.toLocaleString("th-TH")}
            </span>{" "}
            เครื่องในขอบเขตของ Manager
          </div>
        </section>

        {/* =========================================================
            SUMMARY
        ========================================================== */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            icon={Boxes}
            label="เครื่องจักร"
            value={totalMachines.toLocaleString("th-TH")}
            note="เครื่องที่เปิดใช้งาน"
            tone="slate"
          />

          <SummaryCard
            icon={RadioTower}
            label="มี Sensor"
            value={machinesWithSensors.toLocaleString("th-TH")}
            note={`${coverage}% ของเครื่องทั้งหมด`}
            tone="sky"
          />

          <SummaryCard
            icon={QrCode}
            label="มี QR"
            value={machinesWithQr.toLocaleString("th-TH")}
            note="พร้อมใช้กับการสแกน"
            tone="violet"
          />

          <SummaryCard
            icon={AlertTriangle}
            label="มี Alert เปิดอยู่"
            value={machinesWithOpenAlert.toLocaleString("th-TH")}
            note={
              machinesWithOpenAlert > 0
                ? "มีรายการที่ควรตรวจสอบ"
                : "ระบบทำงานปกติ"
            }
            tone="rose"
          />

          <SummaryCard
            icon={Database}
            label="ยังไม่มีข้อมูล"
            value={neverRecorded.toLocaleString("th-TH")}
            note="ไม่มี ResourceUsage"
            tone="amber"
          />
        </section>

        {/* =========================================================
            EQUIPMENT LIST
        ========================================================== */}
        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_34px_rgba(15,23,42,0.05)]">

          {/* LIST HEADER */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-950">
                เครื่องจักรทั้งหมด
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                กดที่เครื่องจักรเพื่อดู Sensor, ResourceUsage
                และรายละเอียดเชิงลึก
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CircleGauge className="h-4 w-4 text-emerald-600" />
              ใช้ข้อมูลล่าสุดจากฐานข้อมูล
            </div>
          </div>

          {/* EMPTY STATE */}
          {machines.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Wrench className="h-5 w-5 text-slate-400" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                ยังไม่มีเครื่องจักร
              </p>

              <p className="mt-1 text-xs text-slate-500">
                ไม่พบเครื่องจักรที่อยู่ในบริษัทของ Manager บัญชีนี้
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {/* COLUMN HEADER - DESKTOP */}
              <div className="hidden bg-slate-50/70 px-6 py-3 xl:grid xl:grid-cols-[minmax(300px,1.5fr)_minmax(220px,0.8fr)_minmax(300px,1fr)_40px] xl:items-center xl:gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  เครื่องจักร / ตำแหน่ง
                </p>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  ความพร้อม
                </p>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  ข้อมูลล่าสุด
                </p>

                <span />
              </div>

              {/* MACHINES */}
              {machines.map((machine) => {
                const latest = machine.resourceUsages[0];

                const machineStatus = statusLabel(
                  machine.operationalStatus,
                );

                const hasOpenAlert = machine.alerts.length > 0;

                return (
                  <Link
                    key={machine.machineId}
                    href={`/manager/overview/equipment/${machine.machineId}`}
                    className="
                      group grid gap-4 px-5 py-5
                      transition duration-200
                      hover:bg-emerald-50/35
                      sm:px-6
                      xl:grid-cols-[minmax(300px,1.5fr)_minmax(220px,0.8fr)_minmax(300px,1fr)_40px]
                      xl:items-center
                    "
                    aria-label={`ดูรายละเอียด ${machine.machineName}`}
                  >

                    {/* =================================================
                        MACHINE
                    ================================================== */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <p className="truncate font-semibold text-slate-950">
                          {machine.machineName}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${machineStatus.className}`}
                        >
                          {machineStatus.label}
                        </span>

                        {/* แสดงเฉพาะกรณีมี Alert จริง */}
                        {hasOpenAlert && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-100">
                            <AlertTriangle className="h-3 w-3" />
                            มี Alert
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {machine.machineCode}
                      </p>

                      <p className="mt-2 truncate text-xs leading-5 text-slate-500">
                        {
                          machine.productionLine.department.building
                            .buildingName
                        }{" "}
                        ·{" "}
                        {
                          machine.productionLine.department
                            .departmentName
                        }{" "}
                        · {machine.productionLine.lineName}
                      </p>
                    </div>

                    {/* =================================================
                        READINESS
                    ================================================== */}
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 xl:hidden">
                        ความพร้อม
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 xl:mt-0">
                        <MiniBadge
                          icon={RadioTower}
                          label={`${machine._count.sensors} Sensor`}
                          active={machine._count.sensors > 0}
                        />

                        <MiniBadge
                          icon={QrCode}
                          label={`${machine._count.qrCodes} QR`}
                          active={machine._count.qrCodes > 0}
                        />
                      </div>
                    </div>

                    {/* =================================================
                        LATEST RESOURCE USAGE
                    ================================================== */}
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 xl:hidden">
                        ข้อมูลล่าสุด
                      </p>

                      {latest ? (
                        <div className="xl:mt-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatNumber(latest.quantity)}{" "}
                              {latest.unit.symbol}
                            </p>

                            <span className="text-[11px] font-medium text-slate-400">
                              {latest.resourceType.resourceCode}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {latest.resourceType.resourceName} ·{" "}
                            {latest.sourceType}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatDateTime(latest.usageAt)}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 xl:mt-0">
                          <p className="text-sm font-medium text-slate-400">
                            ยังไม่มี ResourceUsage
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            ยังไม่มีการบันทึกข้อมูลของเครื่องนี้
                          </p>
                        </div>
                      )}
                    </div>

                    {/* =================================================
                        OPEN DETAIL
                    ================================================== */}
                    <div className="hidden justify-end xl:flex">
                      <span
                        className="
                          flex h-9 w-9 items-center justify-center
                          rounded-full text-slate-300
                          transition duration-200
                          group-hover:bg-white
                          group-hover:text-emerald-700
                          group-hover:shadow-sm
                        "
                      >
                        <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>

                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ===============================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  tone: "slate" | "sky" | "violet" | "rose" | "amber";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    sky: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {note}
          </p>
        </div>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
    </div>
  );
}

/* ===============================================================
   MINI BADGE
================================================================ */

function MiniBadge({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-400",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
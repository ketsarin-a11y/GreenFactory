import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleGauge,
  Clock3,
  Database,
  Factory,
  Gauge,
  MapPin,
  QrCode,
  RadioTower,
  Wrench,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    machineId: string;
  }>;
};

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

function formatDate(value: Date | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

function formatNumber(value: unknown) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(number) ? number : 0);
}

function machineStatus(status: string) {
  switch (status.toUpperCase()) {
    case "NORMAL":
      return {
        label: "ปกติ",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };
    case "WARNING":
      return {
        label: "เฝ้าระวัง",
        className: "bg-amber-50 text-amber-700 ring-amber-100",
      };
    case "ERROR":
    case "CRITICAL":
      return {
        label: "ผิดปกติ",
        className: "bg-rose-50 text-rose-700 ring-rose-100",
      };
    case "OFFLINE":
    case "STOPPED":
      return {
        label: "ไม่พร้อมใช้งาน",
        className: "bg-slate-100 text-slate-600 ring-slate-200",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-600 ring-slate-200",
      };
  }
}

function alertTone(severity: string) {
  const upper = severity.toUpperCase();

  if (upper === "CRITICAL" || upper === "HIGH") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (upper === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default async function ManagerMachineDetailPage({
  params,
}: PageProps) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.roleName !== "MANAGER") redirect("/");
  if (!session.companyId) redirect("/");

  const { machineId: rawMachineId } = await params;
  const machineId = Number(rawMachineId);

  if (!Number.isInteger(machineId) || machineId <= 0) {
    notFound();
  }

  const machine = await prisma.machine.findFirst({
    where: {
      machineId,
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
      manufacturer: true,
      model: true,
      serialNumber: true,
      installationDate: true,
      locationNote: true,
      operationalStatus: true,
      updatedAt: true,

      machineType: {
        select: {
          machineTypeCode: true,
          machineTypeName: true,
        },
      },

      productionLine: {
        select: {
          lineId: true,
          lineCode: true,
          lineName: true,
          department: {
            select: {
              departmentId: true,
              departmentCode: true,
              departmentName: true,
              building: {
                select: {
                  buildingId: true,
                  buildingCode: true,
                  buildingName: true,
                  factory: {
                    select: {
                      factoryId: true,
                      factoryCode: true,
                      factoryName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },

      sensors: {
        orderBy: {
          sensorName: "asc",
        },
        select: {
          sensorId: true,
          sensorCode: true,
          sensorName: true,
          serialNumber: true,
          manufacturer: true,
          protocol: true,
          lastConnectedAt: true,
          lastCalibrationDate: true,
          nextCalibrationDate: true,
          status: true,
          data: {
            orderBy: {
              measuredAt: "desc",
            },
            take: 1,
            select: {
              rawValue: true,
              processedValue: true,
              qualityStatus: true,
              measuredAt: true,
              unit: {
                select: {
                  symbol: true,
                },
              },
            },
          },
        },
      },

      qrCodes: {
        orderBy: {
          generatedAt: "desc",
        },
        select: {
          qrId: true,
          qrStatus: true,
          generatedAt: true,
          revokedAt: true,
        },
      },

      resourceUsages: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          usageAt: "desc",
        },
        take: 12,
        select: {
          usageId: true,
          usageReference: true,
          quantity: true,
          usageAt: true,
          sourceType: true,
          processingStatus: true,
          remark: true,
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

      alerts: {
        orderBy: {
          triggeredAt: "desc",
        },
        take: 8,
        select: {
          alertId: true,
          alertCode: true,
          severity: true,
          title: true,
          message: true,
          status: true,
          triggeredAt: true,
          actualValue: true,
          thresholdValue: true,
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
    },
  });

  if (!machine) {
    notFound();
  }

  const status = machineStatus(machine.operationalStatus);
  const activeSensors = machine.sensors.filter(
    (sensor) => sensor.status === "ACTIVE",
  ).length;
  const activeQr = machine.qrCodes.filter(
    (qr) => qr.qrStatus === "ACTIVE",
  ).length;
  const openAlerts = machine.alerts.filter(
    (alert) => alert.status === "OPEN",
  );

  const latestUsage = machine.resourceUsages[0];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f6f8f7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-5">
          <Link
            href="/manager/overview/equipment"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปเครื่องจักรทั้งหมด
          </Link>
        </div>

        <section className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-start lg:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Wrench className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                    {machine.machineName}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-1.5 text-sm font-medium text-slate-500">
                  {machine.machineCode} · {machine.machineType.machineTypeName}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Factory className="h-4 w-4 text-slate-400" />
                    {
                      machine.productionLine.department.building.factory
                        .factoryName
                    }
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {machine.productionLine.department.building.buildingName}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {machine.productionLine.department.departmentName} ·{" "}
                    {machine.productionLine.lineName}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
              <MiniSummary
                label="Sensor"
                value={String(machine._count.sensors)}
                detail={`${activeSensors} active`}
              />
              <MiniSummary
                label="QR"
                value={String(machine._count.qrCodes)}
                detail={`${activeQr} active`}
              />
              <MiniSummary
                label="Alert"
                value={String(openAlerts.length)}
                detail="open"
                danger={openAlerts.length > 0}
              />
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={Activity}
            label="สถานะเครื่อง"
            value={status.label}
            note={`อัปเดต ${formatDateTime(machine.updatedAt)}`}
          />

          <InfoCard
            icon={Database}
            label="ResourceUsage"
            value={machine._count.resourceUsages.toLocaleString("th-TH")}
            note="รายการทั้งหมดของเครื่องนี้"
          />

          <InfoCard
            icon={RadioTower}
            label="Sensor"
            value={`${activeSensors}/${machine._count.sensors}`}
            note="Sensor ที่เปิดใช้งาน"
          />

          <InfoCard
            icon={QrCode}
            label="QR Code"
            value={`${activeQr}/${machine._count.qrCodes}`}
            note="QR ที่ยังใช้งานได้"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,0.75fr)]">
          <div className="space-y-6">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    ข้อมูลล่าสุด
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    ResourceUsage ล่าสุดของเครื่องนี้
                  </p>
                </div>

                <CircleGauge className="h-5 w-5 text-emerald-600" />
              </div>

              {latestUsage ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric
                    label="ทรัพยากร"
                    value={latestUsage.resourceType.resourceName}
                  />
                  <Metric
                    label="ปริมาณ"
                    value={`${formatNumber(latestUsage.quantity)} ${latestUsage.unit.symbol}`}
                  />
                  <Metric label="ที่มา" value={latestUsage.sourceType} />
                  <Metric
                    label="เวลา"
                    value={formatDateTime(latestUsage.usageAt)}
                  />
                </div>
              ) : (
                <EmptyState text="เครื่องนี้ยังไม่มี ResourceUsage" />
              )}
            </section>

            <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="font-semibold text-slate-950">
                  ประวัติการใช้ทรัพยากร
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  12 รายการล่าสุด
                </p>
              </div>

              {machine.resourceUsages.length === 0 ? (
                <div className="p-6">
                  <EmptyState text="ยังไม่มีประวัติการใช้ทรัพยากร" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-slate-50 text-[11px] font-medium text-slate-500">
                      <tr>
                        <th className="px-5 py-3 sm:px-6">วันที่</th>
                        <th className="px-4 py-3">ทรัพยากร</th>
                        <th className="px-4 py-3">ปริมาณ</th>
                        <th className="px-4 py-3">ที่มา</th>
                        <th className="px-4 py-3">สถานะ</th>
                        <th className="px-5 py-3 sm:px-6">Reference</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {machine.resourceUsages.map((usage) => (
                        <tr
                          key={String(usage.usageId)}
                          className="text-sm text-slate-700"
                        >
                          <td className="whitespace-nowrap px-5 py-3.5 text-xs sm:px-6">
                            {formatDateTime(usage.usageAt)}
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="font-medium text-slate-900">
                              {usage.resourceType.resourceName}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {usage.resourceType.resourceCode}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-950">
                            {formatNumber(usage.quantity)} {usage.unit.symbol}
                          </td>

                          <td className="px-4 py-3.5 text-xs">
                            {usage.sourceType}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                              {usage.processingStatus}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-xs text-slate-500 sm:px-6">
                            {usage.usageReference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="font-semibold text-slate-950">
                  Sensor ของเครื่องนี้
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  สถานะและค่าที่รับล่าสุดจาก SensorData
                </p>
              </div>

              {machine.sensors.length === 0 ? (
                <EmptyState text="เครื่องนี้ยังไม่มี Sensor" />
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {machine.sensors.map((sensor) => {
                    const latest = sensor.data[0];

                    return (
                      <div
                        key={sensor.sensorId}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {sensor.sensorName}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {sensor.sensorCode}
                            </p>
                          </div>

                          <span
                            className={[
                              "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                              sensor.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500",
                            ].join(" ")}
                          >
                            {sensor.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <Metric
                            label="ค่าล่าสุด"
                            value={
                              latest
                                ? `${formatNumber(
                                    latest.processedValue ??
                                      latest.rawValue,
                                  )} ${latest.unit.symbol}`
                                : "-"
                            }
                          />

                          <Metric
                            label="วัดล่าสุด"
                            value={
                              latest
                                ? formatDateTime(latest.measuredAt)
                                : "-"
                            }
                          />

                          <Metric
                            label="Connection"
                            value={formatDateTime(sensor.lastConnectedAt)}
                          />

                          <Metric
                            label="Protocol"
                            value={sensor.protocol || "-"}
                          />
                        </div>

                        {latest ? (
                          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                            <span
                              className={[
                                "h-2 w-2 rounded-full",
                                latest.qualityStatus === "VALID"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500",
                              ].join(" ")}
                            />
                            Data quality: {latest.qualityStatus}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Gauge className="h-5 w-5 text-violet-600" />
                <h2 className="font-semibold text-slate-950">
                  ข้อมูลเครื่องจักร
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                <DetailRow
                  label="ประเภท"
                  value={machine.machineType.machineTypeName}
                />
                <DetailRow
                  label="ผู้ผลิต"
                  value={machine.manufacturer || "-"}
                />
                <DetailRow label="Model" value={machine.model || "-"} />
                <DetailRow
                  label="Serial Number"
                  value={machine.serialNumber || "-"}
                />
                <DetailRow
                  label="ติดตั้ง"
                  value={formatDate(machine.installationDate)}
                />
                <DetailRow
                  label="ตำแหน่งเพิ่มเติม"
                  value={machine.locationNote || "-"}
                />
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                <h2 className="font-semibold text-slate-950">
                  ตำแหน่งในโรงงาน
                </h2>
              </div>

              <div className="space-y-3">
                <LocationRow
                  label="โรงงาน"
                  value={
                    machine.productionLine.department.building.factory
                      .factoryName
                  }
                />
                <LocationRow
                  label="อาคาร"
                  value={
                    machine.productionLine.department.building.buildingName
                  }
                />
                <LocationRow
                  label="แผนก"
                  value={machine.productionLine.department.departmentName}
                />
                <LocationRow
                  label="สายการผลิต"
                  value={machine.productionLine.lineName}
                />
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  <h2 className="font-semibold text-slate-950">
                    Alert ล่าสุด
                  </h2>
                </div>

                {openAlerts.length > 0 ? (
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700">
                    {openAlerts.length} OPEN
                  </span>
                ) : null}
              </div>

              {machine.alerts.length === 0 ? (
                <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                  ไม่มี Alert ของเครื่องนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {machine.alerts.map((alert) => (
                    <div
                      key={String(alert.alertId)}
                      className={`rounded-2xl border p-4 ${alertTone(
                        alert.severity,
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold">
                          {alert.title}
                        </p>
                        <span className="shrink-0 text-[10px] font-bold">
                          {alert.severity}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 opacity-80">
                        {alert.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] opacity-70">
                        <span>{alert.status}</span>
                        <span>{formatDateTime(alert.triggeredAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MiniSummary({
  label,
  value,
  detail,
  danger = false,
}: {
  label: string;
  value: string;
  detail: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p
        className={[
          "mt-1 text-xl font-semibold",
          danger ? "text-rose-600" : "text-slate-950",
        ].join(" ")}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-slate-400">{detail}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{note}</p>
        </div>

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="break-words text-right font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

function LocationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <Database className="mx-auto h-5 w-5 text-slate-300" />
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  );
}

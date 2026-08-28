import Link from "next/link";
import {
  ChevronRight,
  CircleDot,
  Factory,
  FileClock,
  Leaf,
  ListChecks,
  QrCode,
  RefreshCw,
} from "lucide-react";

import type {
  CarbonFootprintData,
  ManagerResourceDashboard,
} from "@/lib/manager queries";

interface ManagerHomePageProps {
  resourceDashboard: ManagerResourceDashboard;
  carbon: CarbonFootprintData;
  currentUserName: string;
}

export default function ManagerHomePage({
  resourceDashboard,
  carbon,
  currentUserName,
}: ManagerHomePageProps) {
  const {
    totalRecords,
    totalMachines,
    resourceTypeCount,
    pendingCount,
    qrCount,
    manualCount,
    activity,
    resources,
    recentRecords,
    lastUpdatedAt,
  } = resourceDashboard;

  return (
    <div className="mx-auto w-full max-w-[1580px] space-y-6 pb-12">
      {/* PAGE HEADER */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            สวัสดี คุณ{currentUserName}
          </p>
          <h1 className="mt-1 text-[30px] font-black tracking-[-0.035em] text-slate-950 sm:text-[34px]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ภาพรวมข้อมูลที่ถูกบันทึกจากการปฏิบัติงานของโรงงาน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            7 วันล่าสุด
          </span>
          <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500">
            <RefreshCw className="h-3.5 w-3.5" />
            {formatLastUpdated(lastUpdatedAt)}
          </span>
        </div>
      </section>

      {/* KPI */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ListChecks}
          label="รายการบันทึก"
          value={totalRecords.toLocaleString("th-TH")}
          meta="รายการในช่วง 7 วันล่าสุด"
          tone="emerald"
        />
        <StatCard
          icon={Factory}
          label="เครื่องจักรที่มีข้อมูล"
          value={totalMachines.toLocaleString("th-TH")}
          meta="เครื่องที่มีการบันทึกในช่วงนี้"
          tone="slate"
        />
        <StatCard
          icon={CircleDot}
          label="ประเภททรัพยากร"
          value={resourceTypeCount.toLocaleString("th-TH")}
          meta="แยกตาม Resource Type"
          tone="violet"
        />
        <StatCard
          icon={Leaf}
          label="Carbon"
          value={formatNumber(carbon.totalKgCO2e)}
          unit="kgCO₂e"
          meta="ค่าประมาณจากข้อมูลการใช้ทรัพยากร"
          tone="sky"
          href="/manager/overview/carbon"
        />
      </section>

      {/* MAIN DASHBOARD */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
        <Panel
          title="กิจกรรมการบันทึกข้อมูล"
          subtitle="จำนวนรายการที่ถูกบันทึกในแต่ละวัน"
          actionHref="/manager/overview"
          actionLabel="ดู Analytics"
        >
          <ActivityChart data={activity} />
        </Panel>

        <Panel title="สถานะข้อมูล" subtitle="ภาพรวมข้อมูลที่เข้าระบบ">
          <div className="space-y-3">
            <StatusRow
              icon={FileClock}
              label="รอประมวลผล"
              value={pendingCount}
              tone="amber"
            />
            <StatusRow
              icon={QrCode}
              label="บันทึกผ่าน QR"
              value={qrCount}
              tone="violet"
            />
            <StatusRow
              icon={ListChecks}
              label="บันทึกแบบเลือกเครื่อง"
              value={manualCount}
              tone="sky"
            />
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Data source
            </p>
            <p className="mt-1 text-sm font-bold text-slate-700">
              ResourceUsage
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              ข้อมูลชุดเดียวกับที่ Operator บันทึกในบริษัทเดียวกัน
            </p>
          </div>
        </Panel>
      </section>

      {/* RESOURCE SUMMARY */}
      <Panel
        title="ทรัพยากรที่ถูกบันทึก"
        subtitle="แสดงแยกตามประเภทและหน่วย ไม่รวมค่าคนละหน่วยเข้าด้วยกัน"
        actionHref="/manager/overview"
        actionLabel="ดูรายละเอียด"
      >
        {resources.length === 0 ? (
          <EmptyState text="ยังไม่มีข้อมูลทรัพยากรในช่วง 7 วันล่าสุด" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {resources.map((resource) => (
              <ResourceCard
                key={`${resource.resourceCode}-${resource.unit}`}
                name={resource.resourceName}
                code={resource.resourceCode}
                total={resource.total}
                unit={resource.unit}
                records={resource.recordCount}
              />
            ))}
          </div>
        )}
      </Panel>

      {/* RECENT RECORDS */}
      <Panel
        title="รายการล่าสุด"
        subtitle="ข้อมูลล่าสุดที่เข้ามาจากฝั่ง Operator"
        actionHref="/manager/reports"
        actionLabel="ดูรายงาน"
      >
        {recentRecords.length === 0 ? (
          <EmptyState text="ยังไม่มีรายการบันทึกในช่วงเวลานี้" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <Th>เวลา</Th>
                  <Th>เครื่องจักร / จุดตรวจ</Th>
                  <Th>ตำแหน่ง</Th>
                  <Th>ทรัพยากร</Th>
                  <Th>ปริมาณ</Th>
                  <Th>แหล่งข้อมูล</Th>
                  <Th>สถานะ</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRecords.map((record) => (
                  <tr key={record.id} className="text-sm text-slate-700">
                    <Td>
                      <div className="font-semibold text-slate-700">
                        {record.dateLabel}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {record.timeLabel}
                      </div>
                    </Td>
                    <Td>
                      <div className="font-bold text-slate-800">
                        {record.machineName}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {record.reference}
                      </div>
                    </Td>
                    <Td>
                      <div>{record.departmentName}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {record.buildingName}
                      </div>
                    </Td>
                    <Td>
                      <div className="font-semibold">{record.resourceName}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {record.resourceCode}
                      </div>
                    </Td>
                    <Td>
                      <span className="font-extrabold text-slate-900">
                        {formatNumber(record.quantity)}
                      </span>{" "}
                      <span className="text-xs text-slate-400">{record.unit}</span>
                    </Td>
                    <Td>
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                          record.sourceType === "QR"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-sky-50 text-sky-700",
                        ].join(" ")}
                      >
                        {record.sourceType === "QR" ? "QR" : "Manual"}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                          record.processingStatus === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        {record.processingStatus === "PENDING"
                          ? "รอประมวลผล"
                          : record.processingStatus}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-[11px] leading-5 text-slate-400">{subtitle}</p>
          )}
        </div>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#126447]"
          >
            {actionLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  meta,
  tone,
  href,
}: {
  icon: typeof Factory;
  label: string;
  value: string;
  unit?: string;
  meta: string;
  tone: "emerald" | "slate" | "violet" | "sky";
  href?: string;
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
    violet: "bg-violet-50 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
  };

  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        {href && <ChevronRight className="h-4 w-4 text-slate-300" />}
      </div>
      <p className="mt-4 text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-[27px] font-black leading-none tracking-[-0.03em] text-slate-950">
        {value}
        {unit && (
          <span className="ml-2 text-xs font-semibold tracking-normal text-slate-400">
            {unit}
          </span>
        )}
      </p>
      <p className="mt-2 text-[11px] text-slate-400">{meta}</p>
    </>
  );

  const className =
    "rounded-[18px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)] p-4 transition hover:border-slate-300 hover:shadow-sm";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function ActivityChart({
  data,
}: {
  data: ManagerResourceDashboard["activity"];
}) {
  if (data.length === 0) {
    return <EmptyState text="ยังไม่มีข้อมูลสำหรับแสดงกราฟ" />;
  }

  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="flex h-[250px] items-end gap-2.5 sm:gap-4">
      {data.map((item) => {
        const height =
          item.count === 0 ? 2 : Math.max(10, (item.count / max) * 100);

        return (
          <div
            key={item.dateKey}
            className="group flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <div className="relative flex flex-1 items-end">
              <div
                className="w-full rounded-t-[10px] bg-gradient-to-t from-emerald-700 to-emerald-500 transition duration-200 group-hover:from-emerald-800 group-hover:to-emerald-600"
                style={{ height: `${height}%` }}
              />
              <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                {item.count.toLocaleString("th-TH")} รายการ
              </div>
            </div>
            <p className="mt-2 truncate text-center text-[10px] font-medium text-slate-400">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileClock;
  label: string;
  value: number;
  tone: "amber" | "violet" | "sky";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-3.5 py-3 transition hover:bg-slate-50">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">
        {label}
      </span>
      <span className="text-lg font-black text-slate-900">
        {value.toLocaleString("th-TH")}
      </span>
    </div>
  );
}

function ResourceCard({
  name,
  code,
  total,
  unit,
  records,
}: {
  name: string;
  code: string;
  total: number;
  unit: string;
  records: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/35 px-4 py-4 transition hover:bg-white hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-800">{name}</p>
          <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {code}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
          {records} รายการ
        </span>
      </div>

      <p className="mt-5 text-[24px] font-black leading-none tracking-[-0.03em] text-slate-950">
        {formatNumber(total)}
        <span className="ml-2 text-xs font-semibold tracking-normal text-slate-400">
          {unit}
        </span>
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400 first:pl-0 last:pr-0">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-3.5 align-middle first:pl-0 last:pr-0">
      {children}
    </td>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center text-center text-xs text-slate-400">
      {text}
    </div>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("th-TH", {
    maximumFractionDigits: 2,
  });
}

function formatLastUpdated(value: string | null) {
  if (!value) return "ยังไม่มีข้อมูล";

  return `อัปเดต ${new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value))}`;
}

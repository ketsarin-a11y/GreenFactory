"use client";

import {
  Activity,
  Building2,
  CalendarClock,
  Cpu,
  Radio,
  RefreshCw,
  X,
} from "lucide-react";

import type { SensorItem } from "./sensor-data";

type Props = {
  sensor: SensorItem | null;
  onClose: () => void;
};

function formatDate(value: string | null) {
  if (!value) return "ยังไม่มีข้อมูล";

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(
  status: SensorItem["connectionStatus"],
) {
  switch (status) {
    case "ONLINE":
      return "เชื่อมต่อ";
    case "OFFLINE":
      return "ออฟไลน์";
    case "MAINTENANCE":
      return "บำรุงรักษา";
    case "FAULT":
      return "ผิดปกติ";
  }
}

function statusClasses(
  status: SensorItem["connectionStatus"],
) {
  switch (status) {
    case "ONLINE":
      return "bg-emerald-50 text-emerald-700";
    case "OFFLINE":
      return "bg-slate-100 text-slate-600";
    case "MAINTENANCE":
      return "bg-amber-50 text-amber-700";
    case "FAULT":
      return "bg-red-50 text-red-700";
  }
}

export default function SensorDetail({
  sensor,
  onClose,
}: Props) {
  if (!sensor) return null;

  const latestValue = sensor.latestData
    ? `${
        sensor.latestData.processedValue ??
        sensor.latestData.rawValue
      } ${sensor.latestData.unit.symbol}`.trim()
    : "-";

  const details = [
    ["ประเภท", sensor.type.name, Activity],
    ["Protocol", sensor.protocol || "-", Cpu],
    ["โรงงาน", sensor.factory.name, Building2],
    ["อาคาร", sensor.building.name, Building2],
    ["แผนก", sensor.department.name, Building2],
    [
      "สายการผลิต",
      sensor.productionLine.name,
      Building2,
    ],
    ["เครื่องจักร", sensor.machine.name, Cpu],
    [
      "เชื่อมต่อล่าสุด",
      formatDate(sensor.lastConnectedAt),
      RefreshCw,
    ],
    [
      "สอบเทียบครั้งถัดไป",
      formatDate(sensor.nextCalibrationDate),
      CalendarClock,
    ],
  ] as const;

  return (
    <aside
      className="
        w-full
        border-t border-[#e3e8ed]
        bg-[#fbfcfc]
        xl:w-[340px]
        xl:border-l
        xl:border-t-0
      "
    >
      <div
        className="
          p-4
          sm:p-5
          xl:sticky
          xl:top-[72px]
          xl:max-h-[calc(100vh-72px)]
          xl:overflow-y-auto
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              <Radio className="h-3 w-3" />
              Sensor Detail
            </div>

            <h2 className="mt-3 break-words text-[16px] font-semibold leading-6 text-[#283548] sm:text-[17px]">
              {sensor.name}
            </h2>

            <p className="mt-1 text-[11px] font-medium text-[#929ca9]">
              {sensor.code}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดรายละเอียดเซนเซอร์"
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-[10px]
              border border-[#e3e8ed]
              bg-white
              text-[#7c8795]
              transition
              hover:bg-[#f1f4f6]
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* STATUS */}
        <div className="mt-3">
          <span
            className={`
              inline-flex items-center gap-1.5
              rounded-full px-2.5 py-1.5
              text-[10px] font-semibold
              ${statusClasses(sensor.connectionStatus)}
            `}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />

            {statusLabel(sensor.connectionStatus)}
          </span>
        </div>

        {/* LATEST VALUE */}
        <div className="mt-4 rounded-[14px] border border-[#dfe5eb] bg-white p-4">
          <div className="flex items-center gap-3">
            <span
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-[12px]
                bg-[#eaf6ef]
                text-[#2d8057]
              "
            >
              <Radio className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-medium text-[#929ca9]">
                ค่าล่าสุด
              </p>

              <p className="mt-0.5 break-words text-[20px] font-semibold tracking-[-0.02em] text-[#273449] sm:text-[21px]">
                {latestValue}
              </p>

              <p className="mt-1 text-[10px] text-[#9aa4af]">
                {sensor.latestData
                  ? formatDate(
                      sensor.latestData.measuredAt,
                    )
                  : "ยังไม่มี Sensor Data"}
              </p>
            </div>
          </div>
        </div>

        {/* INFORMATION */}
        <div className="mt-5">
          <p className="mb-3 text-[12px] font-semibold text-[#3f4c5e]">
            ข้อมูลเซนเซอร์
          </p>

          <div
            className="
              grid grid-cols-1 gap-2.5
              sm:grid-cols-2
              xl:grid-cols-1
            "
          >
            {details.map(
              ([label, value, Icon]) => (
                <div
                  key={label}
                  className="
                    flex items-start gap-3
                    rounded-[12px]
                    border border-[#e6eaee]
                    bg-white
                    px-3.5 py-3
                    transition
                    hover:border-[#d8e0e5]
                  "
                >
                  <span
                    className="
                      flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-[9px]
                      bg-[#f2f5f4]
                      text-[#68786f]
                    "
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[#99a2ad]">
                      {label}
                    </p>

                    <p className="mt-0.5 break-words text-[12px] font-medium leading-5 text-[#495669]">
                      {value}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* CONNECTION */}
        <div className="mt-5 rounded-[14px] border border-[#dfe5eb] bg-white p-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#687687]" />

            <p className="text-[12px] font-semibold text-[#4c596b]">
              การเชื่อมต่อ
            </p>
          </div>

          <div className="mt-3 space-y-2">
            <ConnectionRow
              label="Address"
              value={
                sensor.connectionAddress || "-"
              }
            />

            <ConnectionRow
              label="Data Topic"
              value={sensor.dataTopic || "-"}
            />

            <ConnectionRow
              label="Sampling"
              value={
                sensor.samplingIntervalSeconds
                  ? `${sensor.samplingIntervalSeconds} วินาที`
                  : "-"
              }
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function ConnectionRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] bg-[#f7f9fa] px-3 py-2.5">
      <p className="text-[9px] font-medium text-[#98a1ac]">
        {label}
      </p>

      <p className="mt-0.5 break-all text-[11px] font-medium leading-5 text-[#536174]">
        {value}
      </p>
    </div>
  );
}
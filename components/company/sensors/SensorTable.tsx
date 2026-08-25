"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { SensorItem } from "./sensor-data";

type Props = {
  sensors: SensorItem[];
  startIndex: number;
  selectedId: number | null;
  menuId: number | null;
  onSelect: (sensor: SensorItem) => void;
  onToggleMenu: (sensorId: number) => void;
  onEdit: (sensor: SensorItem) => void;
  onDelete: (sensor: SensorItem) => void;
};

function statusClasses(
  status: SensorItem["connectionStatus"],
) {
  switch (status) {
    case "ONLINE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "OFFLINE":
      return "border-slate-200 bg-slate-100 text-slate-600";

    case "MAINTENANCE":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "FAULT":
      return "border-red-200 bg-red-50 text-red-700";
  }
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

function formatDate(value: string | null) {
  if (!value) {
    return "ยังไม่มีข้อมูล";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function latestValue(sensor: SensorItem) {
  if (!sensor.latestData) {
    return "-";
  }

  const value =
    sensor.latestData.processedValue ??
    sensor.latestData.rawValue;

  return `${value} ${sensor.latestData.unit.symbol}`.trim();
}

export default function SensorTable({
  sensors,
  startIndex,
  selectedId,
  menuId,
  onSelect,
  onToggleMenu,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] border-collapse">
        {/* HEADER */}
        <thead>
          <tr className="border-b border-[#e4e9ee] bg-[#f8fafb] text-left">
            <th className="w-[80px] px-5 py-4 text-[12px] font-semibold text-[#788594]">
              ลำดับ
            </th>

            <th className="min-w-[150px] px-5 py-4 text-[12px] font-semibold text-[#788594]">
              รหัสเซนเซอร์
            </th>

            <th className="min-w-[220px] px-5 py-4 text-[12px] font-semibold text-[#788594]">
              ชื่อเซนเซอร์
            </th>

            <th className="min-w-[180px] px-5 py-4 text-[12px] font-semibold text-[#788594]">
              ประเภท
            </th>

            <th className="min-w-[300px] px-5 py-4 text-[12px] font-semibold text-[#788594]">
              เครื่องจักร / ตำแหน่ง
            </th>

            <th className="min-w-[140px] px-5 py-4 text-[12px] font-semibold text-[#788594]">
              สถานะ
            </th>

            <th className="min-w-[190px] px-5 py-4 text-[12px] font-semibold text-[#788594]">
              ข้อมูลล่าสุด
            </th>

            <th className="w-[80px] px-5 py-4" />
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {sensors.map((sensor, index) => {
            const active = selectedId === sensor.id;

            return (
              <tr
                key={sensor.id}
                onClick={() => onSelect(sensor)}
                className={`group cursor-pointer border-b border-[#edf0f3] transition-all duration-200 last:border-0 ${
                  active
                    ? "bg-[#eef8f3]"
                    : "bg-white hover:bg-[#f8fbfa]"
                }`}
              >
                {/* INDEX */}
                <td className="px-5 py-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#f2f5f7] text-[12px] font-semibold text-[#728091]">
                    {startIndex + index + 1}
                  </div>
                </td>

                {/* CODE */}
                <td className="px-5 py-5">
                  <span className="inline-flex rounded-[9px] border border-[#dfe5e9] bg-white px-3 py-1.5 font-mono text-[12px] font-semibold tracking-[0.03em] text-[#536174] shadow-sm">
                    {sensor.code}
                  </span>
                </td>

                {/* NAME */}
                <td className="px-5 py-5">
                  <div className="max-w-[260px]">
                    <p className="truncate text-[14px] font-semibold text-[#2f3c4f]">
                      {sensor.name}
                    </p>

                    <p className="mt-1.5 truncate text-[11px] text-[#929dab]">
                      {sensor.productionLine.name}
                    </p>
                  </div>
                </td>

                {/* TYPE */}
                <td className="px-5 py-5">
                  <p className="text-[13px] font-medium text-[#4d5b6d]">
                    {sensor.type.name}
                  </p>

                  <p className="mt-1.5 text-[11px] text-[#98a2ae]">
                    {sensor.protocol ||
                      "ยังไม่ระบุ Protocol"}
                  </p>
                </td>

                {/* MACHINE */}
                <td className="px-5 py-5">
                  <div className="max-w-[360px]">
                    <p className="truncate text-[13px] font-semibold text-[#4a586a]">
                      {sensor.machine.name}
                    </p>

                    <p className="mt-1.5 truncate text-[11px] leading-5 text-[#96a0ad]">
                      {sensor.factory.name}
                      {" · "}
                      {sensor.building.name}
                      {" · "}
                      {sensor.department.name}
                    </p>
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-5 py-5">
                  <span
                    className={`inline-flex min-w-[105px] items-center justify-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold ${statusClasses(
                      sensor.connectionStatus,
                    )}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />

                    {statusLabel(
                      sensor.connectionStatus,
                    )}
                  </span>
                </td>

                {/* LAST VALUE */}
                <td className="px-5 py-5">
                  <p className="text-[12px] font-medium text-[#5c6979]">
                    {formatDate(
                      sensor.latestData?.measuredAt ??
                        sensor.lastConnectedAt,
                    )}
                  </p>

                  <p className="mt-1.5 text-[13px] font-semibold text-[#334155]">
                    {latestValue(sensor)}
                  </p>
                </td>

                {/* MENU */}
                <td
                  className="relative px-5 py-5"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      onToggleMenu(sensor.id)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-transparent text-[#798594] transition hover:border-[#e1e6ea] hover:bg-white hover:shadow-sm"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {menuId === sensor.id && (
                    <div className="absolute right-5 top-[58px] z-30 w-[190px] rounded-[14px] border border-[#dde3e8] bg-white p-2 shadow-[0_18px_50px_rgba(24,38,56,0.16)]">
                      <button
                        type="button"
                        onClick={() =>
                          onEdit(sensor)
                        }
                        className="flex min-h-[44px] w-full items-center gap-3 rounded-[10px] px-3 text-left text-[12px] font-medium text-[#526073] transition hover:bg-[#f3f6f8]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#eef4f1] text-[#287554]">
                          <Pencil className="h-4 w-4" />
                        </span>

                        แก้ไขข้อมูล
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete(sensor)
                        }
                        className="mt-1 flex min-h-[44px] w-full items-center gap-3 rounded-[10px] px-3 text-left text-[12px] font-medium text-[#b14848] transition hover:bg-[#fff1f1]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#fff0f0] text-[#bf4f4f]">
                          <Trash2 className="h-4 w-4" />
                        </span>

                        ลบ / ปิดใช้งาน
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
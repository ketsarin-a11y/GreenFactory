"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { SensorItem } from "./sensor-data";

type SensorTableProps = {
  sensors: SensorItem[];
  startIndex: number;
  selectedId: string | null;
  menuId: string | null;
  onSelect: (sensor: SensorItem) => void;
  onToggleMenu: (sensorId: string) => void;
  onEdit: (sensor: SensorItem) => void;
  onDelete: (sensor: SensorItem) => void;
};

function statusClasses(status: SensorItem["status"]) {
  switch (status) {
    case "ONLINE":
      return "bg-[#e8f7ef] text-[#24734b]";
    case "OFFLINE":
      return "bg-[#f1f3f5] text-[#707b89]";
    case "MAINTENANCE":
      return "bg-[#fff4df] text-[#9b6a16]";
    case "FAULT":
      return "bg-[#fff0f0] text-[#b14848]";
  }
}

function statusLabel(status: SensorItem["status"]) {
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

export default function SensorTable({
  sensors,
  startIndex,
  selectedId,
  menuId,
  onSelect,
  onToggleMenu,
  onEdit,
  onDelete,
}: SensorTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-[#e7ebef] bg-[#fafbfc] text-left">
            <th className="w-[64px] px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
              ลำดับ
            </th>
            <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
              รหัสเซนเซอร์
            </th>
            <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
              ชื่อเซนเซอร์
            </th>
            <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
              ประเภท
            </th>
            <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
              เครื่องจักร / จุดตรวจ
            </th>
            <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
              สถานะ
            </th>
            <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
              เชื่อมต่อล่าสุด
            </th>
            <th className="w-[78px] px-4 py-3" />
          </tr>
        </thead>

        <tbody>
          {sensors.map((sensor, index) => (
            <tr
              key={sensor.id}
              onClick={() => onSelect(sensor)}
              className={`cursor-pointer border-b border-[#eef1f3] transition last:border-0 ${
                selectedId === sensor.id
                  ? "bg-[#f2faf6]"
                  : "hover:bg-[#fbfcfd]"
              }`}
            >
              <td className="px-4 py-3 text-[9px] text-[#7f8a98]">
                {startIndex + index + 1}
              </td>

              <td className="px-4 py-3 text-[9px] font-medium text-[#526073]">
                {sensor.code}
              </td>

              <td className="px-4 py-3">
                <p className="text-[9px] font-semibold text-[#3d4a5d]">
                  {sensor.name}
                </p>
                <p className="mt-1 text-[7px] text-[#98a1ac]">
                  {sensor.productionLine}
                </p>
              </td>

              <td className="px-4 py-3">
                <p className="text-[9px] text-[#596677]">{sensor.type}</p>
                <p className="mt-1 text-[7px] text-[#9aa3ae]">
                  {sensor.unit}
                </p>
              </td>

              <td className="px-4 py-3">
                <p className="text-[9px] text-[#596677]">{sensor.machine}</p>
                <p className="mt-1 text-[7px] text-[#9aa3ae]">
                  {sensor.building}
                </p>
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-medium ${statusClasses(
                    sensor.status,
                  )}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusLabel(sensor.status)}
                </span>
              </td>

              <td className="px-4 py-3">
                <p className="text-[8px] text-[#6d7887]">
                  {sensor.lastUpdated}
                </p>
                <p className="mt-1 text-[7px] text-[#9aa3ae]">
                  {sensor.lastValue}
                </p>
              </td>

              <td
                className="relative px-4 py-3"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onToggleMenu(sensor.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d8896] hover:bg-[#eef2f5]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {menuId === sensor.id && (
                  <div className="absolute right-4 top-[44px] z-20 w-[160px] rounded-[11px] border border-[#dfe5eb] bg-white p-1.5 shadow-[0_16px_42px_rgba(26,38,57,0.14)]">
                    <button
                      type="button"
                      onClick={() => onEdit(sensor)}
                      className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#566274] hover:bg-[#f4f6f8]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      แก้ไข
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(sensor)}
                      className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#b14848] hover:bg-[#fff1f1]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      ลบเซนเซอร์
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

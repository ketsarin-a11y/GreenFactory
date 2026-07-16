"use client";

import {
  Activity,
  Building2,
  Cpu,
  Radio,
  RefreshCw,
  X,
} from "lucide-react";

import type { SensorItem } from "./sensor-data";

type SensorDetailProps = {
  sensor: SensorItem | null;
  onClose: () => void;
};

export default function SensorDetail({
  sensor,
  onClose,
}: SensorDetailProps) {
  if (!sensor) return null;

  return (
    <aside className="w-full border-l border-[#e3e8ed] bg-white xl:w-[330px]">
      <div className="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#2b8057]">
              Sensor Detail
            </p>
            <h2 className="mt-2 text-[15px] font-semibold text-[#283548]">
              {sensor.name}
            </h2>
            <p className="mt-1 text-[8px] text-[#929ca9]">{sensor.code}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#7c8795] hover:bg-[#eef2f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-[15px] border border-[#dfe5eb] bg-[#fafbfc] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e8f5ed] text-[#2d8057]">
              <Radio className="h-5 w-5" />
            </span>

            <div>
              <p className="text-[8px] text-[#929ca9]">ค่าล่าสุด</p>
              <p className="mt-1 text-[18px] font-semibold text-[#273449]">
                {sensor.lastValue}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {[
            ["ประเภท", sensor.type, Activity],
            ["หน่วย", sensor.unit, RefreshCw],
            ["Protocol", sensor.protocol, Cpu],
            ["อาคาร", sensor.building, Building2],
            ["แผนก", sensor.department, Building2],
            ["สายการผลิต", sensor.productionLine, Building2],
            ["เครื่องจักร / จุดตรวจ", sensor.machine, Cpu],
            ["อัปเดตล่าสุด", sensor.lastUpdated, RefreshCw],
          ].map(([label, value, Icon]) => (
            <div
              key={String(label)}
              className="flex items-start gap-3 rounded-[12px] border border-[#e6eaee] px-3 py-3"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#6f7b8a]" />
              <div className="min-w-0">
                <p className="text-[7px] text-[#99a2ad]">{String(label)}</p>
                <p className="mt-1 break-words text-[9px] font-medium text-[#495669]">
                  {String(value)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] p-4">
          <p className="text-[8px] font-semibold text-[#4c596b]">หมายเหตุ</p>
          <p className="mt-2 text-[8px] leading-5 text-[#808b99]">
            {sensor.description || "-"}
          </p>
        </div>
      </div>
    </aside>
  );
}

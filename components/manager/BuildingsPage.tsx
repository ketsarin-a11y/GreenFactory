"use client";

import { Building2, Wrench, Zap, Droplet } from "lucide-react";
import type { BuildingSummary } from "@/lib/manager queries";

export default function BuildingsPage({ summaries, dateFrom, dateTo }: { summaries: BuildingSummary[]; dateFrom: string; dateTo: string }) {
  const totalEquipment = summaries.reduce((s, d) => s + d.equipmentCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-slate-400">
        ช่วงข้อมูล: {formatThaiDate(dateFrom)} - {formatThaiDate(dateTo)} · เครื่องจักรทั้งหมด {totalEquipment} เครื่อง ใน {summaries.length} ตำแหน่ง
      </p>
      <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-400">
        หมายเหตุ: ใช้ตำแหน่ง (Equipment.location) แทนแนวคิด "อาคาร" ที่เป็นทางการ เพราะระบบยังไม่มีตาราง Building แยกต่างหาก
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((b) => (
          <div key={b.location} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Building2 size={16} />
              </span>
              <p className="font-semibold text-slate-800">{b.location}</p>
            </div>
            <ul className="flex flex-col divide-y divide-slate-100 text-sm">
              <li className="flex items-center justify-between py-2">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Wrench size={13} /> เครื่องจักร
                </span>
                <span className="font-medium text-slate-700">{b.equipmentCount} เครื่อง</span>
              </li>
              <li className="flex items-center justify-between py-2">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Zap size={13} /> พลังงาน
                </span>
                <span className="font-medium text-slate-700">{b.energyTotal.toLocaleString("th-TH")} kWh</span>
              </li>
              <li className="flex items-center justify-between py-2">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Droplet size={13} /> น้ำ
                </span>
                <span className="font-medium text-slate-700">{b.waterTotal.toLocaleString("th-TH")} m³</span>
              </li>
            </ul>
          </div>
        ))}
        {summaries.length === 0 && <p className="text-sm text-slate-400">ยังไม่มีข้อมูล</p>}
      </div>
    </div>
  );
}

function formatThaiDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}
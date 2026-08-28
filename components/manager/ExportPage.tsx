"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

export default function ExportPage({ defaultFrom, defaultTo }: { defaultFrom: string; defaultTo: string }) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const href = `/api/manager/export?from=${from}&to=${to}`;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileSpreadsheet size={20} />
          </span>
          <div>
            <p className="font-semibold text-slate-800">ส่งออกข้อมูลบันทึกการใช้ทรัพยากร</p>
            <p className="text-xs text-slate-400">ส่งออกเป็นไฟล์ CSV เปิดได้ด้วย Excel — ข้อมูลจริงทั้งหมดจากระบบ</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">จากวันที่</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} max={to} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">ถึงวันที่</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} min={from} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
        </div>

        <a
          href={href}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Download size={16} />
          ดาวน์โหลด CSV
        </a>

        <p className="mt-3 text-xs text-slate-400">
          ไฟล์จะมีคอลัมน์: วันที่และเวลา, เครื่องจักร, รหัสเครื่อง, ประเภทเครื่องจักร, ไลน์การผลิต, แผนก, ประเภททรัพยากร,
          หน่วยวัด, ปริมาณที่ใช้, ผู้บันทึก, สถานะ, หมายเหตุ
        </p>
      </section>
    </div>
  );
}
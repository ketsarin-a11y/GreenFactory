"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import type { SensorItem } from "./sensor-data";

type Props = {
  sensor: SensorItem | null;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SensorDeleteDialog({
  sensor,
  busy = false,
  onClose,
  onConfirm,
}: Props) {
  if (!sensor) return null;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-[#0d1726]/40 backdrop-blur-[2px]"
      />

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
        <section className="w-full max-w-[440px] rounded-[20px] border border-[#e2e6eb] bg-white p-6 shadow-[0_24px_80px_rgba(18,31,48,0.2)]">
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#fff0f0] text-[#c14d4d]">
              <AlertTriangle className="h-5 w-5" />
            </span>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#7c8795] hover:bg-[#eef2f5]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h2 className="mt-5 text-[16px] font-semibold text-[#283548]">
            ลบหรือปิดใช้งานเซนเซอร์
          </h2>

          <p className="mt-2 text-[10px] leading-5 text-[#778291]">
            ยืนยันการดำเนินการกับ <strong>{sensor.name}</strong> ({sensor.code}) หรือไม่?
            หากเซนเซอร์มี Sensor Data เชื่อมโยงอยู่ ระบบจะปิดใช้งานแทนการลบจริง
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="min-h-[42px] rounded-[10px] border border-[#dfe5eb] px-4 text-[10px] text-[#667283] disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] bg-[#c34f4f] px-4 text-[10px] font-semibold text-white disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {busy ? "กำลังดำเนินการ..." : "ยืนยัน"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

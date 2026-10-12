"use client";

import { Lightbulb } from "lucide-react";

interface TipBannerProps {
  title?: string;
  message?: string;
}

export default function TipBanner({
  title = "เคล็ดลับ",
  message = "บันทึกข้อมูลให้ถูกต้องและครบถ้วน เพื่อให้การวิเคราะห์และคำนวณคาร์บอนเป็นไปอย่างแม่นยำ",
}: TipBannerProps) {
  return (
    <section className="flex min-w-0 items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:items-center sm:gap-4 sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 sm:h-11 sm:w-11">
        <Lightbulb className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-emerald-700">
          {title}
        </p>

        <p className="mt-0.5 break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
          {message}
        </p>
      </div>
    </section>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, Info, ChevronRight, ArrowRight } from "lucide-react";
import type { TodayTaskSummary, ResourceIcon } from "@/constants/dashboard";
import { RESOURCE_ICONS } from "@/lib/resource-meta";

const ICON_TONE: Record<ResourceIcon, string> = {
  zap: "bg-amber-50 text-amber-500",
  droplet: "bg-sky-50 text-sky-500",
  droplets: "bg-sky-50 text-sky-500",
  snowflake: "bg-sky-50 text-sky-500",
  wind: "bg-slate-100 text-slate-500",
  atom: "bg-slate-100 text-slate-500",
  flame: "bg-violet-50 text-violet-500",
  waves: "bg-violet-50 text-violet-500",
  fuel: "bg-violet-50 text-violet-500",
};

export default function TodayTasks({ summary }: { summary: TodayTaskSummary }) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-1.5 text-base font-semibold text-slate-800">
        งานที่ต้องบันทึกวันนี้
        <Info size={15} className="text-slate-300" />
      </h2>

      <div className="mb-5 flex items-center gap-4 rounded-2xl bg-emerald-50/60 p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <ClipboardList size={22} />
        </span>
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {summary.totalCount} <span className="text-base font-medium text-slate-500">รายการ</span>
          </p>
          <p className="text-sm text-slate-400">ยังไม่ได้บันทึกข้อมูล</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {summary.categories.map((cat) => {
          const Icon = RESOURCE_ICONS[cat.icon];
          return (
            <li key={cat.key}>
              <button
                type="button"
                onClick={() => router.push(`/operator/record?category=${cat.key}`)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${ICON_TONE[cat.icon]}`}>
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                </span>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  {cat.count} รายการ
                  <ChevronRight size={16} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => router.push("/operator/record")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        ดูรายการทั้งหมด
        <ArrowRight size={16} />
      </button>
    </section>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ArrowRight } from "lucide-react";
import type { RecentRecord, ResourceIcon } from "@/constants/dashboard";
import { RESOURCE_ICONS } from "@/lib/resource-meta";

const ICON_TONE: Record<RecentRecord["iconColor"], string> = {
  amber: "bg-amber-50 text-amber-500",
  blue: "bg-sky-50 text-sky-500",
  slate: "bg-slate-100 text-slate-500",
  purple: "bg-violet-50 text-violet-500",
};

export default function RecentRecords({ records }: { records: RecentRecord[] }) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">บันทึกล่าสุดของคุณ</h2>
        <button
          type="button"
          onClick={() => router.push("/operator/history")}
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ดูทั้งหมด
          <ArrowRight size={15} />
        </button>
      </div>

      <ul className="flex flex-col divide-y divide-slate-100">
        {records.map((rec) => {
          const Icon = RESOURCE_ICONS[rec.icon as ResourceIcon];
          return (
            <li key={rec.id}>
              <button
                type="button"
                onClick={() => router.push("/operator/history")}
                className="flex w-full items-center gap-3 py-3.5 text-left hover:bg-slate-50"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${ICON_TONE[rec.iconColor]}`}>
                  <Icon size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-800">{rec.equipment}</span>
                  <span className="block text-xs text-slate-400">{rec.location}</span>
                </span>
                <span className="text-xs text-slate-400">{rec.dateLabel}</span>
                <span className="ml-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                  {rec.status}
                </span>
                <ChevronRight size={16} className="ml-1 text-slate-300" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
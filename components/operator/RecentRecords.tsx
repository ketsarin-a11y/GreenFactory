"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";

import { RESOURCE_ICONS } from "@/lib/resource-meta";

type ResourceIcon = keyof typeof RESOURCE_ICONS;

type RecentRecord = {
  id: string | number;
  equipment: string;
  location: string;
  dateLabel: string;
  status: string;
  icon: ResourceIcon;
  iconColor: "amber" | "blue" | "slate" | "purple";
};

const ICON_TONE: Record<RecentRecord["iconColor"], string> = {
  amber: "bg-amber-50 text-amber-500",
  blue: "bg-sky-50 text-sky-500",
  slate: "bg-slate-100 text-slate-500",
  purple: "bg-violet-50 text-violet-500",
};

interface RecentRecordsProps {
  records: RecentRecord[];
}

export default function RecentRecords({
  records,
}: RecentRecordsProps) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">
          บันทึกล่าสุดของคุณ
        </h2>

        <button
          type="button"
          onClick={() => router.push("/operator/history")}
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
        >
          ดูทั้งหมด
          <ArrowRight size={15} />
        </button>
      </div>

      {records.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          ยังไม่มีรายการบันทึกล่าสุด
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100">
          {records.map((record) => {
            const Icon = RESOURCE_ICONS[record.icon];

            return (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => router.push("/operator/history")}
                  className="flex w-full items-center gap-3 py-3.5 text-left transition hover:bg-slate-50"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      ICON_TONE[record.iconColor]
                    }`}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {record.equipment}
                    </span>

                    <span className="block truncate text-xs text-slate-400">
                      {record.location}
                    </span>
                  </span>

                  <span className="shrink-0 text-xs text-slate-400">
                    {record.dateLabel}
                  </span>

                  <span className="ml-2 shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    {record.status}
                  </span>

                  <ChevronRight
                    size={16}
                    className="ml-1 shrink-0 text-slate-300"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";

import type {
  RecentRecord,
} from "@/constants/dashboard";
import { RESOURCE_ICONS } from "@/lib/resource-meta";

const ICON_TONE: Record<
  RecentRecord["iconColor"],
  string
> = {
  amber:
    "bg-amber-50 text-amber-500",
  blue:
    "bg-sky-50 text-sky-500",
  slate:
    "bg-slate-100 text-slate-500",
  purple:
    "bg-violet-50 text-violet-500",
};

export default function RecentRecords({
  records,
  isRefreshing = false,
}: {
  records: RecentRecord[];
  isRefreshing?: boolean;
}) {
  const router = useRouter();

  return (
    <section className="flex min-h-[360px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              บันทึกล่าสุดของคุณ
            </h2>

            <span
              className={[
                "h-2 w-2 rounded-full",
                isRefreshing
                  ? "animate-pulse bg-sky-400"
                  : "bg-emerald-400",
              ].join(" ")}
            />
          </div>

          <p className="mt-1 text-xs font-medium text-slate-400">
            5 รายการล่าสุดจาก ResourceUsage
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/operator/history",
            )
          }
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
        >
          ดูทั้งหมด
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6">
        {records.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-10 text-center">
            <div>
              <p className="text-sm font-bold text-slate-500">
                ยังไม่มีรายการบันทึก
              </p>

              <p className="mt-1 text-xs text-slate-400">
                รายการใหม่จะปรากฏที่นี่อัตโนมัติ
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {records.map(
              (record) => {
                const Icon =
                  RESOURCE_ICONS[
                    record.icon
                  ];

                return (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/operator/history",
                        )
                      }
                      className="flex w-full items-center gap-3 py-3.5 text-left transition hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          ICON_TONE[
                            record.iconColor
                          ]
                        }`}
                      >
                        <Icon className="h-[17px] w-[17px]" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-800">
                          {
                            record.equipment
                          }
                        </span>

                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {
                            record.location
                          }
                        </span>
                      </span>

                      <span className="hidden shrink-0 text-[11px] text-slate-400 xl:block">
                        {record.dateLabel}
                      </span>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                        {record.status}
                      </span>

                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </button>
                  </li>
                );
              },
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
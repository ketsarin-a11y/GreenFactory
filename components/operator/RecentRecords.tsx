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
  amber: "bg-amber-50 text-amber-500",
  blue: "bg-sky-50 text-sky-500",
  slate: "bg-slate-100 text-slate-500",
  purple: "bg-violet-50 text-violet-500",
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
    <section className="flex min-h-[340px] min-w-0 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm sm:min-h-[360px] sm:rounded-[24px]">
      <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-base font-extrabold text-slate-900">
              บันทึกล่าสุดของคุณ
            </h2>

            <span
              className={[
                "h-2 w-2 shrink-0 rounded-full",
                isRefreshing
                  ? "animate-pulse bg-sky-400"
                  : "bg-emerald-400",
              ].join(" ")}
            />
          </div>

          <p className="mt-1 truncate text-xs font-medium text-slate-400">
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
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold text-emerald-600 transition hover:text-emerald-700 sm:text-xs"
        >
          ดูทั้งหมด
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-4 sm:px-6">
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
          <ul className="min-w-0 divide-y divide-slate-100">
            {records.map(
              (record) => {
                const Icon =
                  RESOURCE_ICONS[
                    record.icon
                  ];

                return (
                  <li
                    key={record.id}
                    className="min-w-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/operator/history",
                        )
                      }
                      className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3.5 text-left transition hover:bg-slate-50 sm:flex"
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
                        <span className="block truncate text-[13px] font-bold text-slate-800 sm:text-sm">
                          {
                            record.equipment
                          }
                        </span>

                        <span className="mt-0.5 block truncate text-[11px] text-slate-400 sm:text-xs">
                          {
                            record.location
                          }
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="hidden text-[11px] text-slate-400 xl:block">
                          {record.dateLabel}
                        </span>

                        <span className="max-w-[82px] truncate rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 sm:max-w-none sm:px-2.5 sm:text-[11px]">
                          {record.status}
                        </span>

                        <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
                      </span>
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

"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
} from "lucide-react";

import type {
  ResourceIcon,
  TodayTaskSummary,
} from "@/constants/dashboard";
import { RESOURCE_ICONS } from "@/lib/resource-meta";

const ICON_TONE: Record<
  ResourceIcon,
  string
> = {
  zap:
    "bg-amber-50 text-amber-500",
  droplet:
    "bg-sky-50 text-sky-500",
  droplets:
    "bg-sky-50 text-sky-500",
  snowflake:
    "bg-sky-50 text-sky-500",
  wind:
    "bg-slate-100 text-slate-500",
  atom:
    "bg-slate-100 text-slate-500",
  flame:
    "bg-violet-50 text-violet-500",
  waves:
    "bg-violet-50 text-violet-500",
  fuel:
    "bg-violet-50 text-violet-500",
};

export default function TodayTasks({
  summary,
  isRefreshing = false,
}: {
  summary: TodayTaskSummary;
  isRefreshing?: boolean;
}) {
  const router = useRouter();

  const visibleCategories =
    summary.categories.slice(0, 4);

  return (
    <section className="flex min-h-[360px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              การบันทึกวันนี้
            </h2>

            <span
              className={[
                "h-2 w-2 rounded-full",
                isRefreshing
                  ? "animate-pulse bg-sky-400"
                  : "bg-emerald-400",
              ].join(" ")}
              title={
                isRefreshing
                  ? "กำลังอัปเดต"
                  : "ข้อมูลล่าสุด"
              }
            />
          </div>

          <p className="mt-1 text-xs font-medium text-slate-400">
            ข้อมูลจาก ResourceUsage วันนี้
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 py-5">
        <div className="flex items-center gap-4 rounded-[18px] bg-emerald-50/70 px-4 py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-emerald-100 text-emerald-600">
            <ClipboardList className="h-5 w-5" />
          </span>

          <div>
            <p className="text-2xl font-black tracking-tight text-slate-950">
              {summary.totalCount}
              <span className="ml-1.5 text-sm font-semibold text-slate-500">
                รายการ
              </span>
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              บันทึกเข้าสู่ระบบแล้ววันนี้
            </p>
          </div>
        </div>

        {visibleCategories.length >
        0 ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {visibleCategories.map(
              (category) => {
                const Icon =
                  RESOURCE_ICONS[
                    category.icon
                  ];

                return (
                  <li key={category.key}>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/operator/history`,
                        )
                      }
                      className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          ICON_TONE[
                            category.icon
                          ]
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                        {category.label}
                      </span>

                      <span className="shrink-0 text-sm font-bold text-slate-500">
                        {category.count}
                      </span>
                    </button>
                  </li>
                );
              },
            )}
          </ul>
        ) : (
          <div className="flex flex-1 items-center justify-center py-8 text-center">
            <div>
              <p className="text-sm font-bold text-slate-500">
                ยังไม่มีการบันทึกวันนี้
              </p>

              <p className="mt-1 text-xs text-slate-400">
                เริ่มบันทึกจากเมนูด้านบนได้เลย
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/operator/history",
            )
          }
          className="mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          ดูประวัติทั้งหมด
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
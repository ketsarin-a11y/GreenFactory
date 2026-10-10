"use client";

import {
  Cloud,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import { RESOURCE_META } from "@/lib/resource-meta";
import type { CarbonFootprintData } from "@/lib/manager queries";

const COLORS = [
  "#059669",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#64748b",
  "#14b8a6",
  "#f97316",
  "#a3e635",
];

export default function CarbonPage({
  data,
  dateFrom,
  dateTo,
}: {
  data: CarbonFootprintData;
  dateFrom: string;
  dateTo: string;
}) {
  const hasPreviousPeriodData =
    data.hasPreviousPeriodData && data.changePct !== null;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-slate-400">
        ช่วงข้อมูล: {formatThaiDate(dateFrom)} - {formatThaiDate(dateTo)}
        {data.lastUpdatedAt && (
          <>
            {" "}
            · อัปเดตข้อมูลล่าสุด {formatThaiDateTime(data.lastUpdatedAt)}
          </>
        )}
      </p>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          ตัวเลขนี้คำนวณจากค่าสัมประสิทธิ์การปล่อยคาร์บอน
          <strong>โดยประมาณ</strong>{" "}
          (ไม่ใช่ค่าที่บริษัทยืนยันอย่างเป็นทางการ)
          คูณกับข้อมูลการใช้ทรัพยากรจริง —
          ห้ามใช้ตัวเลขนี้ในรายงานที่ต้องผ่านการตรวจสอบ (audit) จริง
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <Cloud size={24} />
        </span>

        <div>
          <p className="text-sm text-slate-400">
            Carbon Footprint รวมในช่วงที่เลือก
          </p>

          <p className="text-2xl font-bold text-slate-900">
            {(data.totalKgCO2e / 1000).toLocaleString("th-TH", {
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-base font-normal text-slate-400">
              tCO₂e
            </span>
          </p>

          {!hasPreviousPeriodData ? (
            <p className="mt-1 text-sm text-slate-500">
              ยังไม่มีข้อมูลช่วงก่อนหน้าที่เพียงพอสำหรับการเปรียบเทียบ
            </p>
          ) : (
            <p
              className={`mt-1 flex items-center gap-1 text-sm ${
                data.changePct! <= 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {data.changePct! <= 0 ? (
                <ArrowDownRight size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}

              {Math.abs(data.changePct!).toLocaleString("th-TH", {
                maximumFractionDigits: 1,
              })}
              % จากช่วงก่อนหน้าความยาวเท่ากัน
            </p>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          แยกตาม Scope (GHG Protocol)
        </h2>

        {data.scopeTotals.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            ยังไม่มีข้อมูลในช่วงที่เลือก
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {data.scopeTotals.map((scope) => (
              <div
                key={scope.scope}
                className="rounded-xl border border-slate-100 p-4"
              >
                <p className="text-xs font-medium text-slate-500">
                  {scope.scope}
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {scope.carbonKg.toLocaleString("th-TH")}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    kgCO₂e
                  </span>
                </p>

                <p className="text-xs text-slate-400">
                  {scope.percent}% ของทั้งหมด
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {scope.scope === "Scope 1" &&
                    "ปล่อยตรงจากแหล่งของบริษัทเอง (ดีเซล/แก๊ส/ไอน้ำ/ไนโตรเจน)"}

                  {scope.scope === "Scope 2" &&
                    "ไฟฟ้าที่ซื้อจากภายนอก"}

                  {scope.scope === "Scope 3" &&
                    "ปล่อยทางอ้อมจากห่วงโซ่อุปทาน (น้ำ/ลมอัด)"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          สัดส่วนการปล่อยคาร์บอนแยกตามประเภททรัพยากร
        </h2>

        {data.breakdown.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            ยังไม่มีข้อมูลในช่วงที่เลือก
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 font-medium">
                    ประเภททรัพยากร
                  </th>
                  <th className="px-3 py-2.5 font-medium">
                    Scope
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    ปริมาณการใช้
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Carbon (kgCO₂e)
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    สัดส่วน
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.breakdown.map((item, index) => (
                  <tr key={item.resourceType}>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              COLORS[index % COLORS.length],
                          }}
                        />

                        {RESOURCE_META[item.resourceType]?.label ??
                          item.resourceType}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-slate-500">
                      {item.scope}
                    </td>

                    <td className="px-3 py-3 text-right text-slate-500">
                      {item.usageValue.toLocaleString("th-TH")}{" "}
                      {item.unit}
                    </td>

                    <td className="px-3 py-3 text-right font-medium text-slate-700">
                      {item.carbonKg.toLocaleString("th-TH")}
                    </td>

                    <td className="px-3 py-3 text-right text-slate-500">
                      {item.percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatThaiDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatThaiDateTime(iso: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
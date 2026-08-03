"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import type { ResourceDetailData } from "@/lib/manager queries";

const DEPT_COLORS = ["#059669", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

interface ResourceDetailPageProps {
  title: string;
  icon: React.ReactNode;
  data: ResourceDetailData;
  dateFrom: string;
  dateTo: string;
}

/**
 * components/manager/ResourceDetailPage.tsx
 * ---------------------------------------------
 * ใช้ร่วมกันสำหรับหน้า "พลังงาน" และ "น้ำ" — ข้อมูลจริงทั้งหมด (ไม่มี mock)
 * เพราะเป็นการดึง ResourceRecord จริง กรองตามประเภททรัพยากรที่กำหนด
 */
export default function ResourceDetailPage({ title, icon, data, dateFrom, dateTo }: ResourceDetailPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          ช่วงข้อมูล: {formatThaiDate(dateFrom)} - {formatThaiDate(dateTo)}
          {data.lastUpdatedAt && <> · อัปเดตข้อมูลล่าสุด {formatThaiDateTime(data.lastUpdatedAt)}</>}
        </span>
      </div>

      {/* KPI สรุป */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">{icon}</span>
        <div>
          <p className="text-sm text-slate-400">{title}รวมในช่วงที่เลือก</p>
          <p className="text-2xl font-bold text-slate-900">
            {data.total.toLocaleString("th-TH")} <span className="text-base font-normal text-slate-400">{data.unit}</span>
          </p>
          <p className={`flex items-center gap-1 text-sm ${data.changePct <= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {data.changePct <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {Math.abs(data.changePct)}% จากช่วงก่อนหน้าความยาวเท่ากัน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* กราฟแนวโน้มรายวัน แยกตามแผนก */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            แนวโน้มรายวัน แยกตามแผนก
            <Info size={13} className="text-slate-300" />
          </h2>
          {data.trend.length === 0 ? (
            <p className="flex h-56 items-center justify-center text-xs text-slate-400">ยังไม่มีข้อมูลในช่วงที่เลือก</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={40} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                {data.departments.map((dept, i) => (
                  <Line key={dept} type="monotone" dataKey={dept} stroke={DEPT_COLORS[i % DEPT_COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          {data.departments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {data.departments.map((dept, i) => (
                <span key={dept} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                  {dept}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* สัดส่วนแยกตามแผนก */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">สัดส่วนแยกตามแผนก</h2>
          {data.breakdown.length === 0 ? (
            <p className="flex h-40 items-center justify-center text-xs text-slate-400">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={data.breakdown} dataKey="value" nameKey="department" innerRadius={38} outerRadius={60} paddingAngle={2}>
                    {data.breakdown.map((entry, i) => (
                      <Cell key={entry.department} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-1.5 text-xs">
                {data.breakdown.map((item, i) => (
                  <li key={item.department} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                      {item.department}
                    </span>
                    <span className="font-medium text-slate-700">
                      {item.value.toLocaleString("th-TH")} {data.unit} ({item.percent}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatThaiDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}
function formatThaiDateTime(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import type { ComparisonPeriodResult } from "@/lib/manager queries";

interface ComparePageProps {
  results: ComparisonPeriodResult[];
  fromA: string;
  toA: string;
  fromB: string;
  toB: string;
}

export default function ComparePage({ results, fromA, toA, fromB, toB }: ComparePageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [a1, setA1] = useState(fromA);
  const [a2, setA2] = useState(toA);
  const [b1, setB1] = useState(fromB);
  const [b2, setB2] = useState(toB);

  function applyRange() {
    const params = new URLSearchParams({ fromA: a1, toA: a2, fromB: b1, toB: b2 });
    router.push(`${pathname}?${params.toString()}`);
  }

  const [periodA, periodB] = results;
  const chartData = [
    { metric: "พลังงาน (kWh)", [periodA.label]: periodA.energy, [periodB.label]: periodB.energy },
    { metric: "น้ำ (m³)", [periodA.label]: periodA.water, [periodB.label]: periodB.water },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <GitCompareArrows size={16} />
          เลือกช่วงเวลาที่จะเปรียบเทียบ
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">ช่วงที่ 1</p>
            <div className="flex items-center gap-2">
              <input type="date" value={a1} onChange={(e) => setA1(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
              <span className="text-slate-300">–</span>
              <input type="date" value={a2} onChange={(e) => setA2(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">ช่วงที่ 2</p>
            <div className="flex items-center gap-2">
              <input type="date" value={b1} onChange={(e) => setB1(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
              <span className="text-slate-300">–</span>
              <input type="date" value={b2} onChange={(e) => setB2(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={applyRange}
          className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          เปรียบเทียบ
          <ArrowRight size={15} />
        </button>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map((r, i) => (
          <div key={r.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-1 text-xs font-medium text-slate-500">
              {r.label} ({formatThaiDate(r.from)} - {formatThaiDate(r.to)})
            </p>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-slate-400">พลังงาน</p>
                <p className="text-lg font-bold text-slate-900">{r.energy.toLocaleString("th-TH")} kWh</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">น้ำ</p>
                <p className="text-lg font-bold text-slate-900">{r.water.toLocaleString("th-TH")} m³</p>
              </div>
            </div>
            {i === 1 && <DiffLine label="พลังงาน" a={results[0].energy} b={results[1].energy} />}
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">กราฟเปรียบเทียบ</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={periodA.label} fill="#059669" radius={[6, 6, 0, 0]} />
            <Bar dataKey={periodB.label} fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

function DiffLine({ label, a, b }: { label: string; a: number; b: number }) {
  const diff = b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 1000) / 10;
  return (
    <p className={`mt-3 text-xs ${diff <= 0 ? "text-emerald-600" : "text-red-500"}`}>
      {label}ช่วงที่ 1 {diff <= 0 ? "น้อยกว่า" : "มากกว่า"}ช่วงที่ 2 อยู่ {Math.abs(diff)}%
    </p>
  );
}

function formatThaiDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}
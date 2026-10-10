"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  GitCompareArrows,
  Minus,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Row = {
  name: string;
  current: number;
  previous: number;
  unit: string;
  change: number;
};

export default function ManagerComparePage({
  rows,
  dateFrom,
  dateTo,
  previousFrom,
  previousTo,
}: {
  rows: Row[];
  dateFrom: string;
  dateTo: string;
  previousFrom: string;
  previousTo: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);

  const biggest = useMemo(
    () => [...rows].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0],
    [rows],
  );
  const lowerCount = rows.filter((row) => row.change < 0).length;
  const higherCount = rows.filter((row) => row.change > 0).length;
  const stableCount = rows.filter((row) => row.change === 0).length;
  const maxMovement = Math.max(...rows.map((row) => Math.abs(row.change)), 1);

  const compare = () => {
    if (!from || !to) return;
    router.push(
      `/manager/overview/compare?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
  };

  const reset = () => {
    setFrom(dateFrom);
    setTo(dateTo);
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-200/60">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative grid gap-7 px-6 py-7 lg:px-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
                <GitCompareArrows className="h-3.5 w-3.5" />
                Comparison Intelligence
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                Equal-period analysis
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl xl:text-[44px]">
              เปรียบเทียบการใช้ทรัพยากรระหว่างช่วงเวลา
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              มองเห็นทันทีว่าทรัพยากรใดเพิ่มขึ้น ลดลง หรือเปลี่ยนแปลงมากที่สุด
              โดยเทียบกับช่วงก่อนหน้าที่มีจำนวนวันเท่ากัน
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Current vs Previous</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Largest Movement</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Resource Signals</span>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-300">Comparison Window</p>
                <p className="mt-1 text-xs text-slate-400">กำหนดช่วงที่ต้องการเปรียบเทียบ</p>
              </div>
              <CalendarDays className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <DateField label="จาก" value={from} set={setFrom} max={to} />
              <span className="mb-3 hidden text-slate-500 sm:block"><ArrowRight className="h-4 w-4" /></span>
              <DateField label="ถึง" value={to} set={setTo} min={from} />
              <button
                type="button"
                onClick={compare}
                disabled={!from || !to}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-400 px-4 text-sm font-black text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GitCompareArrows className="h-4 w-4" />
                เปรียบเทียบ
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(300px,0.8fr)]">
        <PeriodCard
          eyebrow="CURRENT PERIOD"
          title="ช่วงปัจจุบัน"
          from={dateFrom}
          to={dateTo}
          active
        />
        <PeriodCard
          eyebrow="PREVIOUS PERIOD"
          title="ช่วงก่อนหน้า"
          from={previousFrom}
          to={previousTo}
        />
        <article className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-white p-5 shadow-sm">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-violet-100/70 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-700">Largest Movement</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            {biggest ? (
              <>
                <p className="mt-5 text-lg font-black text-slate-950">{biggest.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-3xl font-black ${biggest.change > 0 ? "text-rose-700" : biggest.change < 0 ? "text-emerald-700" : "text-slate-700"}`}>
                    {signed(biggest.change)}%
                  </span>
                  <SignalIcon change={biggest.change} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  มีการเปลี่ยนแปลงมากที่สุดเมื่อเทียบกับช่วงก่อนหน้า
                </p>
              </>
            ) : (
              <p className="mt-5 text-sm text-slate-500">ยังไม่มีข้อมูลสำหรับเปรียบเทียบ</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <SignalSummary
          icon={TrendingDown}
          label="ใช้ลดลง"
          value={lowerCount}
          description="ทรัพยากรที่มีปริมาณลดลง"
          tone="emerald"
        />
        <SignalSummary
          icon={TrendingUp}
          label="ใช้เพิ่มขึ้น"
          value={higherCount}
          description="ทรัพยากรที่มีปริมาณเพิ่มขึ้น"
          tone="rose"
        />
        <SignalSummary
          icon={Minus}
          label="ไม่เปลี่ยนแปลง"
          value={stableCount}
          description="ทรัพยากรที่คงที่จากช่วงก่อน"
          tone="slate"
        />
      </section>

      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <GitCompareArrows className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-950">Resource Comparison</h2>
              <p className="mt-1 text-sm text-slate-500">รายละเอียดการเปลี่ยนแปลงของแต่ละทรัพยากร</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
              <ArrowDownRight className="h-3.5 w-3.5" /> Lower usage
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">
              <ArrowUpRight className="h-3.5 w-3.5" /> Higher usage
            </span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <GitCompareArrows className="h-6 w-6" />
            </span>
            <p className="mt-4 font-bold text-slate-800">ยังไม่มีข้อมูลสำหรับเปรียบเทียบ</p>
            <p className="mt-1 text-sm text-slate-500">ลองเลือกช่วงเวลาอื่นที่มีข้อมูล ResourceUsage</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-6 py-3.5">Resource</th>
                  <th className="px-4 py-3.5">Previous</th>
                  <th className="px-4 py-3.5">Current</th>
                  <th className="px-4 py-3.5">Movement</th>
                  <th className="px-4 py-3.5">Difference</th>
                  <th className="px-6 py-3.5">Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => {
                  const width = Math.min((Math.abs(row.change) / maxMovement) * 100, 100);
                  return (
                    <tr key={row.name} className="group transition hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="font-bold text-slate-950">{row.name}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{row.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-semibold text-slate-600">{num(row.previous)}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{row.unit}</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-black text-slate-950">{num(row.current)}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{row.unit}</p>
                      </td>
                      <td className="w-[210px] px-4 py-5">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${row.change > 0 ? "bg-rose-400" : row.change < 0 ? "bg-emerald-500" : "bg-slate-300"}`}
                            style={{ width: `${Math.max(width, row.change !== 0 ? 4 : 0)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">ขนาดการเปลี่ยนแปลง</p>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-black ${row.change > 0 ? "bg-rose-50 text-rose-700" : row.change < 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          <SignalIcon change={row.change} />
                          {signed(row.change)}%
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <SignalLabel change={row.change} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p>
              Lower/Higher usage เป็นสัญญาณการเปลี่ยนแปลงของปริมาณการใช้
              ไม่ได้สรุปว่าประสิทธิภาพดีหรือแย่โดยอัตโนมัติ
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            คืนค่าวันที่
          </button>
        </div>
      </section>
    </main>
  );
}

const num = (value: number) =>
  Number(value || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });

const signed = (value: number) => {
  const rounded = Math.round(Number(value || 0) * 100) / 100;
  return rounded > 0 ? `+${num(rounded)}` : num(rounded);
};

function DateField({
  label,
  value,
  set,
  min,
  max,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-400">{label}</span>
      <input
        className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm font-semibold text-white outline-none [color-scheme:dark] transition focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10"
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => set(event.target.value)}
      />
    </label>
  );
}

function PeriodCard({
  eyebrow,
  title,
  from,
  to,
  active = false,
}: {
  eyebrow: string;
  title: string;
  from: string;
  to: string;
  active?: boolean;
}) {
  return (
    <article className={`rounded-3xl border p-5 shadow-sm ${active ? "border-violet-200 bg-gradient-to-br from-violet-50 to-white" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${active ? "text-violet-700" : "text-slate-400"}`}>{eyebrow}</p>
          <h2 className="mt-1 text-base font-black text-slate-950">{title}</h2>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"}`}>
          <CalendarDays className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">{formatDate(from)}</span>
        <ArrowRight className="h-4 w-4 text-slate-300" />
        <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">{formatDate(to)}</span>
      </div>
    </article>
  );
}

function SignalSummary({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: typeof TrendingDown;
  label: string;
  value: number;
  description: string;
  tone: "emerald" | "rose" | "slate";
}) {
  const classes = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${classes[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black text-slate-950">{value}</p>
          <p className="text-sm font-bold text-slate-700">{label}</p>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </article>
  );
}

function SignalIcon({ change }: { change: number }) {
  if (change > 0) return <ArrowUpRight className="h-4 w-4" />;
  if (change < 0) return <ArrowDownRight className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

function SignalLabel({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
        <ArrowUpRight className="h-4 w-4" />
        Higher usage
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
        <ArrowDownRight className="h-4 w-4" />
        Lower usage
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
      <Minus className="h-4 w-4" />
      No change
    </span>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

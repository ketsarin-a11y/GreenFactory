"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calculator,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Factory,
  Info,
  Layers3,
  Leaf,
  Loader2,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { CarbonFootprintData } from "@/lib/manager queries";
type Props = {
  carbon: CarbonFootprintData;
  dateFrom: string;
  dateTo: string;
};
export default function ManagerCarbonIntelligencePage({
  carbon,
  dateFrom,
  dateTo,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);
  const top = carbon.breakdown?.[0];
  const totalKg = safeNumber(carbon.totalKgCO2e);
  const totalTonnes = totalKg / 1000;
  const previousKg = safeNumber(carbon.previousKgCO2e);
  const hasPrevious =
    carbon.hasPreviousPeriodData && carbon.changePct !== null;
  const changePct = carbon.changePct ?? 0;
  const invalidRange = !from || !to || from > to;
  function navigate(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams({ from: nextFrom, to: nextTo });
    startTransition(() => {
      router.push(`/manager/overview/carbon?${params.toString()}`);
    });
  }
  function calculate() {
    if (invalidRange || isPending) return;
    navigate(from, to);
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    calculate();
  }
  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    const nextFrom = localDate(start);
    const nextTo = localDate(end);
    setFrom(nextFrom);
    setTo(nextTo);
    navigate(nextFrom, nextTo);
  }
  function askGFay() {
    const prompt = top
      ? `ช่วยวิเคราะห์ Carbon Footprint ช่วง ${dateFrom} ถึง ${dateTo} จากผลรวม ${num(totalKg)} kgCO2e โดยแหล่งสูงสุดคือ ${top.label} ${num(top.percent)}% และอธิบายสิ่งที่ผู้จัดการควรตรวจสอบต่อจากข้อมูลโรงงานจริง`
      : `ช่วยวิเคราะห์ Carbon Footprint ช่วง ${dateFrom} ถึง ${dateTo} จากข้อมูลโรงงานจริง และบอกว่าควรตรวจสอบอะไรต่อ`;
    window.dispatchEvent(
      new CustomEvent("greenfactory:ask-ai", {
        detail: {
          prompt,
          evidence: {
            dateFrom,
            dateTo,
            totalKgCO2e: totalKg,
            previousKgCO2e: previousKg,
            changePct: carbon.changePct,
            topResource: top
              ? {
                  label: top.label,
                  carbonKg: top.carbonKg,
                  percent: top.percent,
                  scope: top.scope,
                }
              : null,
          },
        },
      }),
    );
  }
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
        <div className="grid gap-5 px-5 py-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                <Leaf className="h-4 w-4" />
                Carbon Intelligence
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Carbon Engine V2
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-[38px]">
              Carbon Intelligence Workspace
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
              เลือกช่วงเวลา ดูผล Carbon ตรวจสอบสูตร และต่อยอดสู่ Insight
              จากข้อมูลโรงงานจริงในหน้าเดียว
            </p>
          </div>
          <div className="hidden items-center gap-2 xl:flex">
            <JourneyStep number="01" label="กำหนดช่วงเวลา" active />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <JourneyStep number="02" label="ตรวจผลและสูตร" />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <JourneyStep number="03" label="วิเคราะห์ต่อ" />
          </div>
        </div>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
              Control Center
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              กำหนดช่วงวิเคราะห์
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              ระบบอ่าน CarbonResult ที่คำนวณแล้วตามช่วงวันที่ที่เลือก
            </p>
          </div>
          <form onSubmit={submit} className="p-5 sm:p-6">
            <div className="space-y-4">
              <DateField
                id="carbon-from"
                label="วันที่เริ่มต้น"
                value={from}
                onChange={setFrom}
                max={to || undefined}
              />
              <div className="flex items-center gap-3 px-1">
                <span className="h-px flex-1 bg-slate-100" />
                <ArrowDownRight className="h-4 w-4 text-slate-300" />
                <span className="h-px flex-1 bg-slate-100" />
              </div>
              <DateField
                id="carbon-to"
                label="วันที่สิ้นสุด"
                value={to}
                onChange={setTo}
                min={from || undefined}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <PresetButton onClick={() => applyPreset(7)}>
                7 วันล่าสุด
              </PresetButton>
              <PresetButton onClick={() => applyPreset(30)}>
                30 วันล่าสุด
              </PresetButton>
            </div>
            <button
              type="submit"
              disabled={invalidRange || isPending}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-base font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_14px_30px_rgba(15,23,42,0.18)] focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังคำนวณ
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5" />
                  คำนวณ Carbon
                </>
              )}
            </button>
            {invalidRange && from && to ? (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold leading-5 text-rose-700"
              >
                วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด
              </p>
            ) : null}
          </form>
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Data Status
            </p>
            <div className="mt-3 space-y-3">
              <StatusRow
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Calculation engine"
                value="CARBON-V2"
              />
              <StatusRow
                icon={<Layers3 className="h-4 w-4" />}
                label="Carbon sources"
                value={`${carbon.breakdown.length} รายการ`}
              />
              <StatusRow
                icon={<CircleDot className="h-4 w-4" />}
                label="Last data"
                value={
                  carbon.lastUpdatedAt
                    ? new Date(carbon.lastUpdatedAt).toLocaleString("th-TH")
                    : "ไม่มีข้อมูล"
                }
              />
            </div>
          </div>
        </aside>
        <section
          aria-live="polite"
          className="relative overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                  Carbon Overview
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  ผลสะสมจากช่วงเวลาที่เลือก
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Verified result
              </span>
            </div>
            <div className="grid flex-1 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="px-6 py-7 sm:px-8">
                <p className="text-sm font-semibold text-slate-400">
                  Total Carbon Footprint
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <span className="text-6xl font-black tracking-[-0.06em] sm:text-7xl">
                    {num(totalKg)}
                  </span>
                  <span className="pb-2 text-xl font-bold text-slate-300">
                    kgCO₂e
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-400">
                  ≈ {num(totalTonnes)} tCO₂e
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <DarkMetric
                    label="แหล่ง Carbon สูงสุด"
                    value={top?.label ?? "ไม่มีข้อมูล"}
                    detail={
                      top
                        ? `${num(top.percent)}% ของ Carbon ทั้งหมด`
                        : "ยังไม่มีข้อมูลในช่วงนี้"
                    }
                    icon={<Factory className="h-5 w-5" />}
                  />
                  <DarkMetric
                    label="GHG Scope หลัก"
                    value={top?.scope ?? "—"}
                    detail={
                      top
                        ? `${num(top.carbonKg)} kgCO₂e จากแหล่งสูงสุด`
                        : "ยังไม่มีข้อมูลในช่วงนี้"
                    }
                    icon={<Layers3 className="h-5 w-5" />}
                  />
                </div>
              </div>
              <div className="border-t border-white/10 px-6 py-7 sm:px-8 lg:border-l lg:border-t-0">
                <p className="text-sm font-bold text-slate-300">
                  เทียบกับช่วงก่อนหน้า
                </p>
                {hasPrevious ? (
                  <div className="mt-5">
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                          changePct <= 0
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-rose-400/10 text-rose-300"
                        }`}
                      >
                        {changePct <= 0 ? (
                          <TrendingDown className="h-7 w-7" />
                        ) : (
                          <TrendingUp className="h-7 w-7" />
                        )}
                      </span>
                      <div>
                        <p className="text-4xl font-black tracking-tight">
                          {changePct > 0 ? "+" : ""}
                          {num(changePct)}%
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {changePct < 0
                            ? "ลดลงจากช่วงก่อนหน้า"
                            : changePct > 0
                              ? "เพิ่มขึ้นจากช่วงก่อนหน้า"
                              : "ไม่เปลี่ยนแปลง"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-bold text-slate-500">
                        Previous period
                      </p>
                      <p className="mt-1 text-xl font-black">
                        {num(previousKg)}{" "}
                        <span className="text-sm text-slate-400">kgCO₂e</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-black">ยังไม่มีข้อมูลช่วงก่อนหน้า</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      ระบบจะไม่สร้างเปอร์เซ็นต์เปรียบเทียบจากฐานที่ไม่มีข้อมูล
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </section>
      <section className="mt-4 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
              Calculation Audit Trail
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              ผลนี้คำนวณมาอย่างไร
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Activity Data × Emission Factor = Carbon Result
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Traceable calculation
          </span>
        </div>
        {carbon.breakdown.length ? (
          <div className="divide-y divide-slate-100">
            {carbon.breakdown.map((item, index) => (
              <article key={item.resourceType} className="px-5 py-6 sm:px-7">
                <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)] xl:items-center">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-slate-950">
                        {item.label}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                          {item.scope}
                        </span>
                        <span className="px-1 py-1 text-xs font-bold text-slate-400">
                          {num(item.percent)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
                    <FormulaBox
                      step="01"
                      label="Activity Data"
                      value={num(item.usageValue)}
                      unit={item.unit}
                    />
                    <OperatorMark value="×" />
                    <FormulaBox
                      step="02"
                      label="Emission Factor"
                      value={
                        item.hasMixedFactors
                          ? "หลายค่า"
                          : item.factorUsed !== null
                            ? factorNum(item.factorUsed)
                            : "ไม่มีข้อมูล"
                      }
                      unit={
                        item.hasMixedFactors
                          ? "หลาย Factor ในช่วงนี้"
                          : item.factorUnit ?? "—"
                      }
                      factor
                    />
                    <OperatorMark value="=" />
                    <FormulaBox
                      step="03"
                      label="Carbon Result"
                      value={num(item.carbonKg)}
                      unit="kgCO₂e"
                      result
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                    <Layers3 className="h-4 w-4" />
                    Engine · {item.calculationVersion ?? "CARBON-V2"}
                  </span>
                  <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-500">
                    <span className="font-black text-slate-700">
                      Factor source ·{" "}
                    </span>
                    {item.factorSource ?? "ไม่ระบุใน Master Data"}
                  </div>
                </div>
                {item.hasMixedFactors ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
                    ช่วงนี้มี Emission Factor มากกว่า 1 ค่า
                    ระบบจึงไม่สรุปเป็น Factor เดียวเพื่อป้องกันการตีความผิด
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <Empty />
        )}
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Verified Total
            </p>
            <p className="mt-1 text-sm text-slate-500">
              ผลรวม Carbon ของทุกทรัพยากรในช่วงเวลาที่เลือก
            </p>
          </div>
          <p className="text-2xl font-black tracking-tight text-slate-950">
            {num(totalKg)}{" "}
            <span className="text-sm font-bold text-slate-500">kgCO₂e</span>
          </p>
        </div>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel
          eyebrow="GHG PROTOCOL"
          title="Scope Distribution"
          subtitle="ดูว่าสัดส่วน Carbon อยู่ใน Scope ใด"
        >
          {carbon.scopeTotals.length ? (
            <div className="space-y-5">
              {carbon.scopeTotals.map((scope) => (
                <div key={scope.scope}>
                  <div className="mb-2 flex items-end justify-between gap-4">
                    <div>
                      <p className="font-black text-slate-900">{scope.scope}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {num(scope.carbonKg)} kgCO₂e
                      </p>
                    </div>
                    <p className="text-xl font-black text-slate-950">
                      {num(scope.percent)}%
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, safeNumber(scope.percent)),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Panel>
        <Panel
          eyebrow="PRIORITY"
          title="Carbon Hotspots"
          subtitle="เรียงแหล่งปล่อยจากผลกระทบสูงสุด"
        >
          {carbon.breakdown.length ? (
            <div className="space-y-3">
              {carbon.breakdown.map((item, index) => (
                <div
                  key={item.resourceType}
                  className="group rounded-2xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-black text-slate-900">
                          {item.label}
                        </p>
                        <p className="shrink-0 font-black text-slate-950">
                          {num(item.carbonKg)} kgCO₂e
                        </p>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, safeNumber(item.percent)),
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-400">
                        <span>
                          {num(item.usageValue)} {item.unit} · {item.scope}
                        </span>
                        <span>{num(item.percent)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Panel>
      </section>
      <section className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Carbon Intelligence
              </p>
              <h2 className="mt-2 text-2xl font-black">
                จากตัวเลข สู่สิ่งที่ควรตรวจต่อ
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                ใช้ผล Carbon ที่คำนวณแล้วเป็นจุดเริ่มต้นในการเจาะหาสาเหตุ
                และประเด็นที่ผู้จัดการควรติดตาม
              </p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Zap className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-slate-950">
                  {top ? "Hotspot ที่ควรติดตาม" : "ยังไม่มีข้อมูลเพียงพอ"}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {top
                    ? `${top.label} เป็นแหล่ง CO₂e สูงสุดในช่วงที่เลือก คิดเป็น ${num(top.percent)}% หรือ ${num(top.carbonKg)} kgCO₂e จากผลที่ระบบคำนวณไว้`
                    : "เลือกช่วงเวลาที่มีข้อมูล Carbon เพื่อดู Hotspot และ Insight"}
                </p>
                <button
                  type="button"
                  onClick={askGFay}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <Bot className="h-4 w-4" />
                  วิเคราะห์ผลนี้กับ G-Fay
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            หน้านี้แสดงผลจาก Carbon Engine และ CarbonResult
            โดยไม่สร้าง Emission Factor ใหม่บนหน้าเว็บ
          </p>
        </div>
        <p className="shrink-0 font-semibold">
          อัปเดตล่าสุด:{" "}
          {carbon.lastUpdatedAt
            ? new Date(carbon.lastUpdatedAt).toLocaleString("th-TH")
            : "ไม่มีข้อมูล"}
        </p>
      </footer>
    </main>
  );
}
function safeNumber(value: number | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function num(value: number) {
  return safeNumber(value).toLocaleString("th-TH", {
    maximumFractionDigits: 2,
  });
}
function factorNum(value: number) {
  return safeNumber(value).toLocaleString("th-TH", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}
function localDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function JourneyStep({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`min-w-[128px] rounded-2xl border px-4 py-3 ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-[10px] font-black tracking-[0.16em] ${
          active ? "text-emerald-700" : "text-slate-400"
        }`}
      >
        {number}
      </p>
      <p className="mt-1 text-xs font-black text-slate-700">{label}</p>
    </div>
  );
}
function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-base font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
        />
      </div>
    </label>
  );
}
function PresetButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-50"
    >
      {children}
    </button>
  );
}
function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="truncate text-sm font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}
function DarkMetric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-xs font-bold">{label}</p>
      </div>
      <p className="mt-3 truncate text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}
function OperatorMark({ value }: { value: "×" | "=" }) {
  return (
    <div className="hidden items-center justify-center md:flex">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-500">
        {value}
      </span>
    </div>
  );
}
function FormulaBox({
  step,
  label,
  value,
  unit,
  factor = false,
  result = false,
}: {
  step: string;
  label: string;
  value: string;
  unit: string;
  factor?: boolean;
  result?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        result
          ? "border-emerald-200 bg-emerald-50"
          : factor
            ? "border-cyan-100 bg-cyan-50/50"
            : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-[10px] font-black uppercase tracking-[0.12em] ${
            result
              ? "text-emerald-700"
              : factor
                ? "text-cyan-700"
                : "text-slate-400"
          }`}
        >
          {label}
        </p>
        <span className="text-[10px] font-black text-slate-300">{step}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-slate-950">
          {value}
        </span>
        <span className="text-xs font-bold leading-5 text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}
function Panel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
function Empty() {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Leaf className="h-5 w-5" />
      </div>
      <p className="mt-4 font-black text-slate-600">
        ยังไม่มีข้อมูลในช่วงเวลานี้
      </p>
      <p className="mt-1 text-sm text-slate-400">
        ลองเลือกช่วงวันที่อื่นแล้วคำนวณอีกครั้ง
      </p>
    </div>
  );
}

"use client";

import { ArrowUpRight, Building2, Download, Plus, ShieldCheck } from "lucide-react";

type Props = {
  totalCompanies: number;
  totalFactories: number;
  totalUsers: number;
  activeCompanies: number;
  onCreate: () => void;
  onExport: () => void;
};

export default function CompanyHeader({
  totalCompanies,
  totalFactories,
  totalUsers,
  activeCompanies,
  onCreate,
  onExport,
}: Props) {
  const activePercent = totalCompanies ? Math.round((activeCompanies / totalCompanies) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#f7f5ef] shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)]">
      <div className="grid min-h-[300px] lg:grid-cols-[1.18fr_.82fr]">
        <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/75 px-3 py-1.5 text-[10px] font-semibold text-slate-600 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Platform administration
            </div>

            <h1 className="mt-6 max-w-[680px] text-[34px] font-bold leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-[46px]">
              ภาพรวมบริษัทที่อยู่ภายใต้การดูแลของแพลตฟอร์ม
            </h1>

            <p className="mt-4 max-w-[620px] text-[13px] leading-7 text-slate-600 sm:text-[14px]">
              ตรวจสอบสถานะบริษัท โรงงาน และผู้ใช้งานจากจุดเดียว พร้อมจัดการข้อมูลสำคัญโดยไม่ต้องสลับหลายหน้าจอ
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-[12px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              เพิ่มบริษัท
            </button>
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-[12px] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
            >
              <Download className="h-4 w-4" />
              ส่งออกข้อมูล
            </button>
          </div>
        </div>

        <div className="relative border-t border-slate-200 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0 sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Network health</p>
              <p className="mt-2 text-[19px] font-semibold tracking-[-0.02em]">สถานะระบบโดยรวม</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
              <Building2 className="h-5 w-5 text-sky-300" />
            </div>
          </div>

          <div className="mt-7 rounded-[22px] border border-white/10 bg-white/[0.055] p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] text-slate-400">บริษัทที่พร้อมใช้งาน</p>
                <p className="mt-2 text-[38px] font-bold tracking-[-0.05em]">{activePercent}%</p>
              </div>
              <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                Stable <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${activePercent}%` }} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["บริษัท", totalCompanies],
              ["โรงงาน", totalFactories],
              ["ผู้ใช้งาน", totalUsers],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[9px] text-slate-500">{label}</p>
                <p className="mt-2 text-[22px] font-bold tracking-[-0.04em]">{Number(value).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

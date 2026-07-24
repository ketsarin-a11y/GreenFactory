import { Activity, Factory, UserRoundCheck } from "lucide-react";
import type { Company } from "./types";

export default function OperationsOverview({ companies }: { companies: Company[] }) {
  const active = companies.filter((item) => item.status === "ACTIVE").length;
  const suspended = companies.filter((item) => item.status === "SUSPENDED").length;
  const inactive = companies.filter((item) => item.status === "INACTIVE").length;
  const max = Math.max(active, suspended, inactive, 1);

  const statusRows = [
    ["ใช้งานอยู่", active, "bg-emerald-500"],
    ["ระงับชั่วคราว", suspended, "bg-amber-500"],
    ["ยกเลิกใช้งาน", inactive, "bg-rose-500"],
  ] as const;

  const topCompanies = [...companies].sort((a, b) => b.users - a.users).slice(0, 4);

  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Company status</p>
            <h2 className="mt-1 text-[17px] font-bold tracking-[-0.025em] text-slate-950">สัดส่วนสถานะบริษัท</h2>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-7 space-y-5">
          {statusRows.map(([label, value, color]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600">{label}</span>
                <span className="font-bold text-slate-900">{value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Largest accounts</p>
            <h2 className="mt-1 text-[17px] font-bold tracking-[-0.025em] text-slate-950">บริษัทที่มีผู้ใช้งานสูงสุด</h2>
          </div>
          <UserRoundCheck className="h-5 w-5 text-violet-600" />
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {topCompanies.map((company, index) => (
            <div key={company.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <span className="w-5 text-[10px] font-bold text-slate-300">0{index + 1}</span>
              <div className={`grid h-9 w-9 place-items-center rounded-xl text-[10px] font-bold ${company.logoClass}`}>
                {company.logoText}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-slate-800">{company.name}</p>
                <p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                  <Factory className="h-3 w-3" /> {company.factories} โรงงาน
                </p>
              </div>
              <p className="text-[12px] font-bold text-slate-900">{company.users.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

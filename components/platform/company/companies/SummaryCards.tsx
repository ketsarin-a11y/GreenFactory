import { Building2, CirclePause, Factory, Users } from "lucide-react";
import type { Company } from "./types";

export default function SummaryCards({ companies }: { companies: Company[] }) {
  const cards = [
    { label: "บริษัททั้งหมด", value: companies.length, note: "+2 จากเดือนก่อน", icon: Building2, accent: "bg-blue-600", soft: "bg-blue-50 text-blue-700" },
    { label: "กำลังใช้งาน", value: companies.filter((item) => item.status === "ACTIVE").length, note: "ระบบทำงานปกติ", icon: Users, accent: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700" },
    { label: "รอตรวจสอบ", value: companies.filter((item) => item.status !== "ACTIVE").length, note: "ต้องดำเนินการ", icon: CirclePause, accent: "bg-amber-500", soft: "bg-amber-50 text-amber-700" },
    { label: "โรงงานเชื่อมต่อ", value: companies.reduce((sum, item) => sum + item.factories, 0), note: "ทุกพื้นที่ในระบบ", icon: Factory, accent: "bg-violet-600", soft: "bg-violet-50 text-violet-700" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{card.label}</p>
                <p className="mt-4 text-[30px] font-bold tracking-[-0.05em] text-slate-950">{card.value.toLocaleString()}</p>
                <p className="mt-2 text-[10px] text-slate-400">{card.note}</p>
              </div>
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${card.soft}`}><Icon className="h-5 w-5" /></div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

import { AlertTriangle, Building2, Factory, UsersRound } from "lucide-react";
import type { CompanySummary } from "./types";

export default function SummaryCards({ summary }: { summary: CompanySummary }) {
  const cards = [
    ["บริษัททั้งหมด", summary.totalCompanies, "บริษัท", Building2, "bg-[#eaf3ff] text-[#3478da]"],
    ["โรงงานในระบบ", summary.totalFactories, "โรงงาน", Factory, "bg-[#eaf7f1] text-[#168662]"],
    ["ผู้ใช้งาน", summary.totalUsers, "บัญชี", UsersRound, "bg-[#f2edff] text-[#7c56c4]"],
    ["เหตุการณ์ที่ต้องดู", summary.unresolvedAlerts, "รายการ", AlertTriangle, "bg-[#fff4e5] text-[#d28718]"],
  ] as const;
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {cards.map(([label, value, unit, Icon, color]) => <article key={label} className="rounded-[20px] border border-[#e4e8e5] bg-white p-5 shadow-[0_12px_36px_rgba(44,55,49,.045)]">
      <div className="flex justify-between">
        <div><p className="text-[11px] text-[#737f79]">{label}</p><div className="mt-3 flex items-end gap-2"><strong className="text-[28px] text-[#202a25]">{value.toLocaleString("th-TH")}</strong><span className="pb-1 text-[10px] text-[#8d9691]">{unit}</span></div></div>
        <div className={`grid h-11 w-11 place-items-center rounded-[15px] ${color}`}><Icon className="h-5 w-5" /></div>
      </div>
    </article>)}
  </section>;
}

import { AlertTriangle, BarChart3, CheckCircle2, Clock3 } from "lucide-react";

type Props = {
  total: number;
  ready: number;
  processing: number;
  failed: number;
};

const cards = [
  { key: "total", label: "รายงานทั้งหมด", icon: BarChart3, box: "bg-[#edf3ff] text-[#5278e6]" },
  { key: "ready", label: "พร้อมดาวน์โหลด", icon: CheckCircle2, box: "bg-[#e9f8ef] text-[#199156]" },
  { key: "processing", label: "กำลังประมวลผล", icon: Clock3, box: "bg-[#fff5dd] text-[#b77a0a]" },
  { key: "failed", label: "ต้องตรวจสอบ", icon: AlertTriangle, box: "bg-[#fff0f0] text-[#c85252]" },
] as const;

export default function ReportsSummary(props: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.key} className="rounded-[20px] border border-[#dfeae3] bg-white p-4 shadow-[0_14px_38px_rgba(34,72,48,0.055)]">
            <span className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${card.box}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[12px] font-semibold text-[#738078]">{card.label}</p>
            <p className="mt-1 text-[24px] font-extrabold text-[#24342b]">{props[card.key]}</p>
          </article>
        );
      })}
    </section>
  );
}

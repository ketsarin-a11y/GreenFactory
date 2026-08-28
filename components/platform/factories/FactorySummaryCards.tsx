import {
  Building2,
  CheckCircle2,
  Factory,
  UsersRound,
} from "lucide-react";

import type { FactorySummary } from "./types";

export default function FactorySummaryCards({
  summary,
}: {
  summary: FactorySummary;
}) {
  const cards = [
    {
      label: "โรงงานทั้งหมด",
      value: summary.totalFactories,
      unit: "โรงงาน",
      icon: Factory,
      iconClass: "bg-[#eaf3ff] text-[#3478da]",
    },
    {
      label: "เปิดใช้งาน",
      value: summary.activeFactories,
      unit: "โรงงาน",
      icon: CheckCircle2,
      iconClass: "bg-[#eaf7f1] text-[#168662]",
    },
    {
      label: "อาคารทั้งหมด",
      value: summary.totalBuildings,
      unit: "อาคาร",
      icon: Building2,
      iconClass: "bg-[#f2edff] text-[#7c56c4]",
    },
    {
      label: "ผู้ใช้ประจำโรงงาน",
      value: summary.totalUsers,
      unit: "บัญชี",
      icon: UsersRound,
      iconClass: "bg-[#fff4e5] text-[#d28718]",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="rounded-[20px] border border-[#e4e8e5] bg-white p-5 shadow-[0_12px_36px_rgba(44,55,49,0.045)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-[#737f79]">{card.label}</p>
                <div className="mt-3 flex items-end gap-2">
                  <strong className="text-[28px] font-bold text-[#202a25]">
                    {card.value.toLocaleString("th-TH")}
                  </strong>
                  <span className="pb-1 text-[10px] text-[#8d9691]">
                    {card.unit}
                  </span>
                </div>
              </div>

              <div
                className={`grid h-11 w-11 place-items-center rounded-[15px] ${card.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

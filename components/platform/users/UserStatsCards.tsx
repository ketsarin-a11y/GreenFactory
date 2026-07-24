import {
  ArrowDown,
  ArrowUp,
  Ban,
  CircleUserRound,
  UserCheck,
  Users,
  X,
} from "lucide-react";

function SummaryCard({
  label,
  value,
  helper,
  trend,
  icon,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <article className="rounded-[18px] border border-[#e9e6e1] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(52,45,37,0.045)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-[#737a76]">{label}</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-[28px] font-bold tracking-[-0.04em] text-[#1f2925]">
              {value}
            </p>
            <span className="pb-1 text-[11px] font-medium text-[#89908c]">
              คน
            </span>
          </div>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-[14px] ${tone}`}>
          {icon}
        </div>
      </div>

      <div
        className={`mt-3 flex items-center gap-1.5 text-[11px] font-semibold ${
          trend === "up" ? "text-[#118361]" : "text-[#d26a25]"
        }`}
      >
        {trend === "up" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )}
        <span>{helper}</span>
      </div>
    </article>
  );
}

export default function UserStatsCards({
  total,
  active,
  suspended,
  expired,
  newUsers,
}: {
  total: number;
  active: number;
  suspended: number;
  expired: number;
  newUsers: number;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="ผู้ใช้งานทั้งหมด"
        value={total}
        helper="+28 คน (เดือนนี้)"
        trend="up"
        icon={<Users className="h-5 w-5 text-[#0c8a63]" />}
        tone="bg-[#e8f7f1]"
      />
      <SummaryCard
        label="ใช้งานอยู่"
        value={active}
        helper="85.77% ของทั้งหมด"
        trend="up"
        icon={<UserCheck className="h-5 w-5 text-[#138c66]" />}
        tone="bg-[#eaf8f2]"
      />
      <SummaryCard
        label="ระงับการใช้งาน"
        value={suspended}
        helper="9.25% ของทั้งหมด"
        trend="down"
        icon={<Ban className="h-5 w-5 text-[#c87819]" />}
        tone="bg-[#fff3e2]"
      />
      <SummaryCard
        label="หมดอายุ"
        value={expired}
        helper="4.98% ของทั้งหมด"
        trend="down"
        icon={<X className="h-5 w-5 text-[#d65a66]" />}
        tone="bg-[#fff0f1]"
      />
      <SummaryCard
        label="ผู้ใช้ใหม่ (เดือนนี้)"
        value={newUsers}
        helper="ดูรายละเอียด"
        trend="up"
        icon={<CircleUserRound className="h-5 w-5 text-[#7a56d1]" />}
        tone="bg-[#f1edff]"
      />
    </section>
  );
}

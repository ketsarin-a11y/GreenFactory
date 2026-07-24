import {
  FileBarChart,
  LogIn,
  Settings,
  UserPlus,
} from "lucide-react";
import { activityItems } from "./data";
import SectionCard from "./SectionCard";

const iconMap = {
  login: LogIn,
  report: FileBarChart,
  user: UserPlus,
  settings: Settings,
};

const colorMap = {
  login: "bg-[#eaf8ef] text-[#188250]",
  report: "bg-[#edf3ff] text-[#5577d9]",
  user: "bg-[#fff5df] text-[#b47708]",
  settings: "bg-[#f3edff] text-[#8052c2]",
};

export default function ActivityTimeline() {
  return (
    <SectionCard
      title="กิจกรรมล่าสุด"
      description="ประวัติการใช้งานบัญชีล่าสุด"
    >
      <div className="space-y-1">
        {activityItems.map((item, index) => {
          const Icon = iconMap[item.type];

          return (
            <div key={item.id} className="relative flex gap-3 py-3">
              {index < activityItems.length - 1 && (
                <span className="absolute left-[19px] top-12 h-[calc(100%-28px)] w-px bg-[#e1e9e4]" />
              )}

              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${colorMap[item.type]}`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13px] font-bold text-[#35463c]">
                    {item.title}
                  </p>
                  <p className="text-[10px] font-semibold text-[#98a39c]">
                    {item.date} · {item.time}
                  </p>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-[#7f8d85]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

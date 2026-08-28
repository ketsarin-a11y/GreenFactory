import { Laptop, MapPin, Smartphone } from "lucide-react";
import { sessions } from "./data";
import SectionCard from "./SectionCard";

export default function ActiveSessions() {
  return (
    <SectionCard
      title="อุปกรณ์ที่เข้าสู่ระบบ"
      description="ตรวจสอบ Session ที่กำลังใช้งานบัญชีนี้"
    >
      <div className="space-y-3">
        {sessions.map((session) => {
          const Icon = session.device.includes("iPhone") ? Smartphone : Laptop;

          return (
            <div
              key={session.id}
              className="flex items-start gap-3 rounded-[16px] border border-[#e2ebe5] bg-[#fbfdfc] px-4 py-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#edf5ff] text-[#5577d9]">
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-bold text-[#35463c]">
                    {session.device}
                  </p>
                  {session.current && (
                    <span className="rounded-full bg-[#eaf8ef] px-2 py-0.5 text-[9px] font-bold text-[#188250]">
                      อุปกรณ์ปัจจุบัน
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-[#7f8d85]">
                  {session.browser}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-[#94a098]">
                  <MapPin className="h-3 w-3" />
                  {session.location} · {session.lastActive}
                </p>
              </div>

              {!session.current && (
                <button
                  type="button"
                  className="text-[11px] font-bold text-[#bd5151] hover:underline"
                >
                  ออกจากระบบ
                </button>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

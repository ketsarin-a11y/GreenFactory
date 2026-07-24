"use client";

import { Bell, Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import SectionCard from "./SectionCard";

const items = [
  {
    key: "email",
    title: "อีเมลแจ้งเตือน",
    description: "รับรายงานและเหตุการณ์สำคัญผ่านอีเมล",
    icon: Mail,
  },
  {
    key: "system",
    title: "การแจ้งเตือนในระบบ",
    description: "แสดงการแจ้งเตือนบน Dashboard",
    icon: Bell,
  },
  {
    key: "mobile",
    title: "การแจ้งเตือนบนอุปกรณ์",
    description: "รับการแจ้งเตือนบนอุปกรณ์ที่ใช้งาน",
    icon: Smartphone,
  },
] as const;

export default function NotificationPreferences() {
  const [settings, setSettings] = useState({
    email: true,
    system: true,
    mobile: false,
  });

  return (
    <SectionCard
      title="การแจ้งเตือน"
      description="ตั้งค่าช่องทางแจ้งเตือนสำหรับบัญชีของคุณ"
    >
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const enabled = settings[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  [item.key]: !current[item.key],
                }))
              }
              className="flex w-full items-center gap-3 rounded-[16px] border border-[#e2ebe5] bg-[#fbfdfc] px-4 py-3 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#edf6f1] text-[#26845a]">
                <Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-[#35463c]">
                  {item.title}
                </span>
                <span className="mt-1 block text-[11px] text-[#839087]">
                  {item.description}
                </span>
              </span>

              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  enabled ? "bg-[#1d9b5f]" : "bg-[#ccd6d0]"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    enabled ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

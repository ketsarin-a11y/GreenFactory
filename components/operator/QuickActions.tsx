"use client";

import { useRouter } from "next/navigation";
import { PenLine, QrCode, Search, ArrowRight, LucideIcon } from "lucide-react";

interface ActionItem {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  tone: "emerald" | "sky" | "violet";
}

const ACTIONS: ActionItem[] = [
  {
    href: "/operator/record",
    title: "บันทึกการใช้ทรัพยากร",
    desc: "บันทึกข้อมูลการใช้ไฟฟ้า, น้ำ, แก๊ส หรือสารต่างๆ ของเครื่องจักร",
    icon: PenLine,
    tone: "emerald",
  },
  {
    href: "/operator/scan",
    title: "สแกน QR Code",
    desc: "สแกน QR Code ที่เครื่องจักรหรือจุดตรวจ",
    icon: QrCode,
    tone: "sky",
  },
  {
    href: "/operator/record",
    title: "เลือกเครื่องจักร/จุดตรวจ",
    desc: "ค้นหาและเลือกเครื่องจักรเพื่อบันทึกข้อมูล",
    icon: Search,
    tone: "violet",
  },
];

const TONE = {
  emerald: { card: "bg-emerald-50 border-emerald-100", icon: "bg-emerald-600 text-white", arrow: "bg-emerald-600 text-white" },
  sky: { card: "bg-sky-50 border-sky-100", icon: "bg-sky-500 text-white", arrow: "bg-sky-500 text-white" },
  violet: { card: "bg-violet-50 border-violet-100", icon: "bg-violet-500 text-white", arrow: "bg-violet-500 text-white" },
};

export default function QuickActions() {
  const router = useRouter();

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-slate-800">เริ่มต้นใช้งาน</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const tone = TONE[action.tone];
          return (
            <button
              key={action.title}
              type="button"
              onClick={() => router.push(action.href)}
              className={`group relative flex flex-col gap-4 rounded-2xl border p-5 text-left transition-shadow hover:shadow-md ${tone.card}`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}`}>
                <Icon size={20} />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{action.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{action.desc}</span>
              </span>
              <span
                className={`absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full ${tone.arrow} transition-transform group-hover:translate-x-0.5`}
              >
                <ArrowRight size={16} />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
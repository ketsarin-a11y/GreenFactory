"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  PenLine,
  QrCode,
  Search,
  type LucideIcon,
} from "lucide-react";

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
    desc: "กรอกข้อมูลการใช้ไฟฟ้า น้ำ แก๊ส หรือทรัพยากรของเครื่องจักร",
    icon: PenLine,
    tone: "emerald",
  },
  {
    href: "/operator/scan",
    title: "สแกน QR Code",
    desc: "สแกน QR เพื่อระบุเครื่องจักรหรือจุดตรวจได้ทันที",
    icon: QrCode,
    tone: "sky",
  },
  {
    href: "/operator/record",
    title: "เลือกเครื่องจักร / จุดตรวจ",
    desc: "ค้นหาและเลือกเครื่องจักรเพื่อเริ่มบันทึกข้อมูล",
    icon: Search,
    tone: "violet",
  },
];

const TONE = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-700 border-emerald-100",
    hover: "hover:bg-emerald-50/55",
    arrow: "group-hover:text-emerald-700",
  },
  sky: {
    icon: "bg-sky-50 text-sky-700 border-sky-100",
    hover: "hover:bg-sky-50/55",
    arrow: "group-hover:text-sky-700",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700 border-violet-100",
    hover: "hover:bg-violet-50/55",
    arrow: "group-hover:text-violet-700",
  },
} satisfies Record<
  ActionItem["tone"],
  {
    icon: string;
    hover: string;
    arrow: string;
  }
>;

export default function QuickActions() {
  const router = useRouter();

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900">
            เริ่มต้นใช้งาน
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-400">
            เลือกวิธีเริ่มบันทึกข้อมูลที่เหมาะกับงานของคุณ
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            const tone = TONE[action.tone];

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => router.push(action.href)}
                className={[
                  "group flex min-h-[118px] min-w-0 items-center gap-4 px-5 py-5 text-left",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset",
                  tone.hover,
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border",
                    tone.icon,
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-extrabold text-slate-900">
                    {action.title}
                  </span>

                  <span className="mt-1 block line-clamp-2 text-[12px] font-medium leading-5 text-slate-500">
                    {action.desc}
                  </span>
                </span>

                <ArrowRight
                  className={[
                    "h-4 w-4 shrink-0 text-slate-300 transition-all duration-200",
                    "group-hover:translate-x-0.5",
                    tone.arrow,
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
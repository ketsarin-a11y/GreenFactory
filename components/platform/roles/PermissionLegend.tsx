import { Check, Eye, Minus, ShieldCheck } from "lucide-react";

const items = [
  {
    label: "เข้าถึงและใช้งานได้",
    icon: Check,
    className: "bg-[#0f8a5f] text-white",
  },
  {
    label: "เข้าถึงได้ (เฉพาะดูข้อมูล)",
    icon: Eye,
    className: "bg-[#3f7cff] text-white",
  },
  {
    label: "ไม่สามารถเข้าถึงได้",
    icon: Minus,
    className: "bg-[#ef4354] text-white",
  },
];

export default function PermissionLegend() {
  return (
    <div className="rounded-[16px] border border-[#e6e9e7] bg-[#fbfcfb] p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#0d7d59]" />
        <p className="text-[11px] font-bold text-[#39453f]">คำอธิบายสัญลักษณ์</p>
      </div>

      <div className="mt-3 space-y-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className={`grid h-5 w-5 place-items-center rounded-full ${item.className}`}>
                <Icon className="h-3 w-3" strokeWidth={2.2} />
              </span>
              <span className="text-[10px] text-[#68736e]">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

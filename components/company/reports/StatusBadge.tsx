import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { ReportStatus } from "./types";

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const styles = {
    ready: {
      label: "พร้อมดาวน์โหลด",
      icon: CheckCircle2,
      className: "bg-[#eaf8ef] text-[#188250]",
    },
    processing: {
      label: "กำลังประมวลผล",
      icon: Clock3,
      className: "bg-[#fff7df] text-[#a66b00]",
    },
    failed: {
      label: "สร้างไม่สำเร็จ",
      icon: XCircle,
      className: "bg-[#fff0f0] text-[#bf4b4b]",
    },
  };

  const item = styles[status];
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.className}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {item.label}
    </span>
  );
}

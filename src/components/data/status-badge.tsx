import { AlertOctagon, AlertTriangle, CheckCircle2, CircleOff, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "good" | "warning" | "serious" | "critical" | "neutral" | "info";
const TONE: Record<Tone, { cls: string; icon: LucideIcon }> = {
  good: { cls: "bg-[#0ca30c]/10 text-[#0a7d0a] dark:text-status-good", icon: CheckCircle2 },
  warning: { cls: "bg-status-warning/15 text-[#8a5a00] dark:text-status-warning", icon: AlertTriangle },
  serious: { cls: "bg-status-serious/15 text-[#a14a24] dark:text-status-serious", icon: AlertTriangle },
  critical: { cls: "bg-status-critical/10 text-status-critical", icon: AlertOctagon },
  neutral: { cls: "bg-muted text-muted-foreground", icon: CircleOff },
  info: { cls: "bg-accent text-accent-foreground", icon: Info },
};

/** Status is never color alone: icon + Thai label + tone. */
export function StatusBadge({ tone, children, className, icon }: { tone: Tone; children: React.ReactNode; className?: string; icon?: LucideIcon }) {
  const t = TONE[tone];
  const Icon = icon ?? t.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", t.cls, className)}>
      <Icon className="size-3.5" aria-hidden />
      {children}
    </span>
  );
}

// Shared label maps so every page says the same thing for the same status.
export const RECORD_STATUS: Record<string, [Tone, string]> = {
  ACTIVE: ["good", "ใช้งานอยู่"],
  INACTIVE: ["neutral", "ปิดใช้งาน"],
  PENDING: ["warning", "รอตรวจสอบ"],
  SUSPENDED: ["critical", "ระงับใช้งาน"],
  LOCKED: ["critical", "ระงับใช้งาน"],
};
export const MACHINE_STATUS: Record<string, [Tone, string]> = {
  NORMAL: ["good", "ปกติ"],
  WARNING: ["warning", "เฝ้าระวัง"],
  MAINTENANCE: ["info", "บำรุงรักษา"],
  STOPPED: ["neutral", "หยุดทำงาน"],
  ERROR: ["critical", "ผิดปกติ"],
};
export const SEVERITY: Record<string, [Tone, string]> = {
  CRITICAL: ["critical", "วิกฤต"],
  HIGH: ["serious", "สูง"],
  MEDIUM: ["warning", "ปานกลาง"],
};
export const ALERT_STATUS: Record<string, [Tone, string]> = {
  OPEN: ["critical", "เปิดอยู่"],
  ACKNOWLEDGED: ["warning", "รับทราบแล้ว"],
  RESOLVED: ["good", "ปิดแล้ว"],
};
export const PROCESSING: Record<string, [Tone, string]> = {
  COMPLETED: ["good", "ประมวลผลแล้ว"],
  PENDING: ["warning", "กำลังประมวลผล"],
  FAILED: ["critical", "ประมวลผลไม่สำเร็จ"],
};
export const CONNECTION: Record<string, [Tone, string]> = {
  ONLINE: ["good", "เชื่อมต่อ"],
  OFFLINE: ["neutral", "ออฟไลน์"],
  FAULT: ["critical", "ผิดปกติ"],
  MAINTENANCE: ["info", "บำรุงรักษา"],
};
export const QR_STATUS: Record<string, [Tone, string]> = {
  ACTIVE: ["good", "ใช้งานอยู่"],
  SUSPENDED: ["warning", "ระงับชั่วคราว"],
  REVOKED: ["neutral", "ยกเลิกแล้ว"],
};

export function Status({ map, value }: { map: Record<string, [Tone, string]>; value: string }) {
  const [tone, label] = map[value] ?? ["neutral", value];
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}


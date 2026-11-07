// Thai labels shared by the platform pages (client-safe, no server imports).
import type { StatusBadge } from "@/components/data/status-badge";

type Tone = Parameters<typeof StatusBadge>[0]["tone"];

export const DEVICE_LABEL_TH: Record<string, string> = { Desktop: "คอมพิวเตอร์", Mobile: "มือถือ", Tablet: "แท็บเล็ต", Unknown: "ไม่ทราบอุปกรณ์" };

export const PLAN_LABEL: Record<string, string> = { TRIAL: "ทดลองใช้", STANDARD: "มาตรฐาน", ENTERPRISE: "องค์กร" };

export const TICKET_STATUS: Record<string, [Tone, string]> = {
  OPEN: ["warning", "เปิดใหม่"],
  IN_PROGRESS: ["info", "กำลังดำเนินการ"],
  RESOLVED: ["good", "แก้ไขแล้ว"],
  CLOSED: ["neutral", "ปิดแล้ว"],
};
export const LOGIN_STATUS: Record<string, [Tone, string]> = { SUCCESS: ["good", "สำเร็จ"], FAILED: ["critical", "ไม่สำเร็จ"] };
export const BACKUP_STATUS: Record<string, [Tone, string]> = {
  RUNNING: ["info", "กำลังสำรอง"],
  COMPLETED: ["good", "สำเร็จ"],
  FAILED: ["critical", "ไม่สำเร็จ"],
};
export const PRIORITY_LABEL: Record<string, string> = { LOW: "ต่ำ", NORMAL: "ปกติ", HIGH: "สูง", URGENT: "เร่งด่วน" };

export const AUDIT_ACTION_LABEL: Record<string, string> = {
  CREATE: "สร้าง",
  UPDATE: "แก้ไข",
  DELETE: "ลบ",
  STATUS: "เปลี่ยนสถานะ",
  RESTORE: "กู้คืน",
  LOGIN: "เข้าสู่ระบบ",
};

export const MODULE_LABEL: Record<string, string> = {
  company: "บริษัท",
  factory: "โรงงาน",
  building: "อาคาร",
  department: "แผนก",
  production_line: "ไลน์การผลิต",
  user: "ผู้ใช้งาน",
  role_permission: "สิทธิ์ตามบทบาท",
  machine: "เครื่องจักร",
  checkpoint: "จุดตรวจวัด",
  sensor: "เซนเซอร์",
  qr_code: "QR Code",
  resource_usage: "รายการบันทึก",
  alert: "การแจ้งเตือน",
  kpi: "KPI",
  report: "รายงาน",
  machine_type: "ประเภทเครื่องจักร",
  sensor_type: "ประเภทเซนเซอร์",
  resource_category: "หมวดหมู่ทรัพยากร",
  resource_type: "ประเภททรัพยากร",
  unit: "หน่วยวัด",
  emission_factor: "Emission Factor",
  backup_record: "สำรองข้อมูล",
  system_setting: "ตั้งค่าระบบ",
  support_tickets: "คำร้องขอความช่วยเหลือ",
};
export const moduleLabel = (t: string) => MODULE_LABEL[t] ?? t;

export const fmtBytes = (n: number | null) => {
  if (n === null) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toLocaleString("th-TH", { maximumFractionDigits: i ? 1 : 0 })} ${units[i]}`;
};

/** "3 ชม.ที่แล้ว" style relative age. */
export function ago(d: Date, now = new Date()) {
  const s = Math.max(0, Math.round((now.getTime() - d.getTime()) / 1000));
  if (s < 60) return "เมื่อสักครู่";
  if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
  if (s < 86400) return `${Math.floor(s / 3600)} ชม.ที่แล้ว`;
  return `${Math.floor(s / 86400)} วันที่แล้ว`;
}

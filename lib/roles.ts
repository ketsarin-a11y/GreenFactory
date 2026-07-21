export const ALLOWED_ROLES = ["PLATFORM_ADMIN", "COMPANY_ADMIN", "MANAGER", "OPERATOR"] as const;

export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export function isAllowedRole(roleName: string): roleName is AllowedRole {
  return (ALLOWED_ROLES as readonly string[]).includes(roleName);
}

export function getRedirectPath(roleName: AllowedRole): string {
  switch (roleName) {
    case "PLATFORM_ADMIN":
      return "/platform";
    case "COMPANY_ADMIN":
      return "/company";
    case "MANAGER":
      return "/manager";
    case "OPERATOR":
      return "/operator";
  }
}

// ข้อความที่โชว์ใน UI (เช่นใต้ชื่อผู้ใช้ใน Header) — "OPERATOR" ในฐานข้อมูล จะโชว์เป็น "Operator"
export const ROLE_LABELS: Record<AllowedRole, string> = {
  PLATFORM_ADMIN: "Platform Admin",
  COMPANY_ADMIN: "Company Admin",
  MANAGER: "Manager",
  OPERATOR: "Operator",
};

// รายการสิทธิ์การเข้าถึงแบบ static ต่อ role — คำนวณจากชื่อ role เฉยๆ ยังไม่มีตาราง
// permission แยกย่อยใน DB จริง (ดูหมายเหตุใน prisma/user-profile-fields-update.md)
export const ROLE_PERMISSIONS: Record<AllowedRole, string[]> = {
  PLATFORM_ADMIN: ["จัดการทุกบริษัทในระบบ", "จัดการผู้ใช้และสิทธิ์ทั้งหมด", "ตั้งค่าระบบ"],
  COMPANY_ADMIN: ["จัดการผู้ใช้ในบริษัท", "จัดการเครื่องจักร/จุดตรวจ", "ดูรายงานทั้งบริษัท"],
  MANAGER: ["ดูประวัติการบันทึกทั้งหมด", "อนุมัติ/ปฏิเสธรายการบันทึก", "ดูรายงาน"],
  OPERATOR: ["บันทึกการใช้ทรัพยากร", "ดูประวัติการบันทึก", "สแกน QR Code"],
};
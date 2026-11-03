export const ROLES = ["PLATFORM_ADMIN", "COMPANY_ADMIN", "MANAGER", "OPERATOR"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  PLATFORM_ADMIN: "ผู้ดูแลแพลตฟอร์ม",
  COMPANY_ADMIN: "ผู้ดูแลบริษัท",
  MANAGER: "ผู้จัดการโรงงาน",
  OPERATOR: "ผู้ปฏิบัติงาน",
};

const HOME: Record<Role, string> = {
  PLATFORM_ADMIN: "/platform",
  COMPANY_ADMIN: "/company",
  MANAGER: "/manager",
  OPERATOR: "/operator",
};

export const isRole = (v: string): v is Role => (ROLES as readonly string[]).includes(v);
export const homeFor = (role: Role) => HOME[role];

/** Accept only same-site absolute paths, so a login link can't redirect off-site. */
export function safeReturnTo(value: string | null | undefined): string | null {
  // Control chars are stripped by browsers ("/\t/evil.com" → "//evil.com"), so reject them outright.
  if (!value || !value.startsWith("/") || /[\u0000-\u001f\u007f\\]/.test(value)) return null;
  const u = new URL(value, "http://same.origin");
  if (u.origin !== "http://same.origin") return null;
  return u.pathname + u.search + u.hash;
}

import bcrypt from "bcryptjs";

const COST = 12;
export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/** ≥ 8 chars with at least one letter and one digit. Returns a Thai error or null. */
export function passwordProblem(plain: string): string | null {
  if (plain.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  if (!/[A-Za-z]/.test(plain) || !/\d/.test(plain)) return "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข";
  return null;
}

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
 
/**
 * lib/session.ts
 * ---------------
 * Session แบบ stateless: JWT เซ็นด้วย SESSION_SECRET
 * แยกเป็น 2 ขั้นตอนตามที่ app/api/auth/login/route.ts เรียกใช้:
 *   1) createSessionToken()  -> เซ็น JWT อย่างเดียว ยังไม่ยุ่งกับ cookie
 *   2) setSessionCookie()    -> เอา token ไปเก็บใน httpOnly cookie
 *
 * ต้องตั้ง env: SESSION_SECRET=<สุ่มยาวๆ อย่างน้อย 32 ตัวอักษร>
 */
 
const COOKIE_NAME = "gfi_session";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 ชั่วโมง
const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 วัน ("จดจำการเข้าสู่ระบบ")
 
// payload ตรงกับสิ่งที่ route.ts ส่งเข้ามาตอน login สำเร็จ
export interface SessionPayload {
  userId: number;
  email: string;
  roleName: string; // เช่น "OPERATOR", "COMPANY_ADMIN"
  companyId: number | null;
  companyCode: string | null;
  firstName: string;
  lastName: string;
}
 
function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET environment variable");
  }
  return new TextEncoder().encode(secret);
}
 
function maxAgeFor(rememberMe: boolean) {
  return rememberMe ? REMEMBER_MAX_AGE_SECONDS : DEFAULT_MAX_AGE_SECONDS;
}
 
/** เซ็น JWT จาก payload ผู้ใช้ (ยังไม่ set cookie) */
export async function createSessionToken(payload: SessionPayload, rememberMe: boolean): Promise<string> {
  const maxAge = maxAgeFor(rememberMe);
 
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSecretKey());
}
 
/** เอา token ที่เซ็นแล้วไปเก็บใน httpOnly cookie */
export async function setSessionCookie(token: string, rememberMe: boolean): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeFor(rememberMe),
  });
}
 
/** อ่าน + verify session cookie ปัจจุบัน คืนค่า null ถ้าไม่มี/หมดอายุ/ปลอม */
export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
 
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      roleName: payload.roleName as string,
      companyId: (payload.companyId as number | null) ?? null,
      companyCode: (payload.companyCode as string | null) ?? null,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
    };
  } catch {
    return null;
  }
}
 
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
 

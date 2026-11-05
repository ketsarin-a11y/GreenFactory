import "server-only";
import { z, type ZodType } from "zod";
import { getCurrentUser, type CurrentUser } from "@/server/auth/current-user";
import type { Role } from "@/server/auth/roles";

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Thrown inside an action to return a friendly Thai error instead of a 500. */
export class UserError extends Error {}

export const fail = (message: string): never => {
  throw new UserError(message);
};

/**
 * Every mutation goes through here: authenticate, authorize by role, validate input,
 * then run. Unexpected errors are logged and hidden from the user.
 */
export function action<S extends ZodType, T>(
  roles: Role[],
  schema: S,
  fn: (input: z.output<S>, user: CurrentUser) => Promise<T>,
) {
  return async (raw: unknown): Promise<ActionResult<T>> => {
    const user = await getCurrentUser();
    if (!user) return { ok: false, message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
    if (!roles.includes(user.role)) return { ok: false, message: "คุณไม่มีสิทธิ์ทำรายการนี้" };

    const parsed = schema.safeParse(raw instanceof FormData ? Object.fromEntries(raw) : raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
      return { ok: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", fieldErrors };
    }
    try {
      return { ok: true, data: await fn(parsed.data, user) };
    } catch (e) {
      if (e instanceof UserError) return { ok: false, message: e.message };
      if (isUniqueViolation(e)) return { ok: false, message: "ข้อมูลนี้มีอยู่ในระบบแล้ว (รหัสหรืออีเมลซ้ำ)" };
      console.error("[action]", e);
      return { ok: false, message: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง" };
    }
  };
}

const isUniqueViolation = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";

// Small reusable zod pieces with Thai messages.
export const zId = z.coerce.number().int().positive("ข้อมูลอ้างอิงไม่ถูกต้อง");
export const zCode = z
  .string()
  .trim()
  .min(1, "กรุณากรอกรหัส")
  .max(50, "รหัสยาวเกิน 50 ตัวอักษร")
  .transform((s) => s.toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9_-]+$/, "รหัสใช้ได้เฉพาะ A-Z, 0-9, - และ _"));
export const zName = (max = 200) => z.string().trim().min(1, "กรุณากรอกชื่อ").max(max, `ยาวเกิน ${max} ตัวอักษร`);
export const zOptText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `ยาวเกิน ${max} ตัวอักษร`)
    .optional()
    .transform((s) => (s ? s : null));
export const zStatus = z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE");

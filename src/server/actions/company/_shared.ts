import "server-only";
import { z } from "zod";
import { fail } from "../_action";

/** Only company admins change company setup. */
export const ADMIN = ["COMPANY_ADMIN" as const];

export const REFERENCED_MSG = "มีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ";

const code = (e: unknown) => (typeof e === "object" && e !== null ? (e as { code?: string }).code : undefined);

/** Runs a write; a duplicate-key error becomes the given Thai message. */
export async function unique<T>(write: Promise<T>, message: string): Promise<T> {
  try {
    return await write;
  } catch (e) {
    if (code(e) === "P2002") return fail(message);
    throw e;
  }
}

/**
 * Delete rule: anything referencing the row → set INACTIVE instead; otherwise hard delete.
 * A foreign-key failure at delete time (new reference raced in) also falls back to INACTIVE.
 */
export async function deleteOrDeactivate(referenced: boolean, del: () => Promise<unknown>, deactivate: () => Promise<unknown>) {
  if (!referenced) {
    try {
      await del();
      return { mode: "DELETED" as const, message: "ลบข้อมูลแล้ว" };
    } catch (e) {
      if (code(e) !== "P2003") throw e;
    }
  }
  await deactivate();
  return { mode: "DEACTIVATED" as const, message: REFERENCED_MSG };
}

export const anyCount = (c: Record<string, number>) => Object.values(c).some((n) => n > 0);

const blank = (v: unknown) => v === "" || v === null || v === undefined;
/** Optional id from a form ("" → undefined). */
export const zOptId = z.preprocess((v) => (blank(v) ? undefined : v), z.coerce.number().int().positive().optional());
/** Optional integer > 0 from a form. */
export const zOptPosInt = (msg: string) => z.preprocess((v) => (blank(v) ? null : v), z.coerce.number().int(msg).positive(msg).nullable());
/** Optional number within a range. */
export const zOptRange = (min: number, max: number, msg: string) =>
  z.preprocess((v) => (blank(v) ? null : v), z.coerce.number(msg).min(min, msg).max(max, msg).nullable());
/** Optional "YYYY-MM-DD" → Date at UTC midnight (DB `@db.Date`). */
export const zOptDate = z.preprocess(
  (v) => (blank(v) ? null : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "วันที่ไม่ถูกต้อง").transform((s) => new Date(`${s}T00:00:00Z`)).nullable(),
);
export const zEmail = z.preprocess(
  (v) => (blank(v) ? null : v),
  z.string().trim().toLowerCase().max(255).pipe(z.email("อีเมลไม่ถูกต้อง")).nullable(),
);
export const zPhone = z.preprocess(
  (v) => (blank(v) ? null : v),
  z.string().trim().max(30).regex(/^[0-9+\-\s()]*$/, "เบอร์โทรไม่ถูกต้อง").nullable(),
);
export const zUrl = z.preprocess((v) => (blank(v) ? null : v), z.url("ลิงก์ไม่ถูกต้อง").max(500).nullable());

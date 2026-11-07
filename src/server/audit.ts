import "server-only";
import { headers } from "next/headers";
import { db } from "@/server/db";

const safe = (v: unknown) =>
  v === undefined ? undefined : JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? x.toString() : x)));

/** One row per create/update/delete. Never throws: auditing must not break the user's action. */
export async function audit(
  userId: number | null,
  tableName: string,
  recordId: number | bigint,
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "STATUS",
  oldData?: unknown,
  newData?: unknown,
) {
  try {
    const h = await headers();
    await db.auditLog.create({
      data: {
        userId,
        tableName,
        recordId: BigInt(recordId),
        action,
        oldData: safe(oldData),
        newData: safe(newData),
        ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null,
        userAgent: h.get("user-agent")?.slice(0, 500) ?? null,
      },
    });
  } catch (e) {
    console.error("[audit] failed", tableName, recordId, e);
  }
}

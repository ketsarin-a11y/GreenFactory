import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/current-user";
import { backupDir, isInsideDir } from "@/server/backup";

/** Streams a backup file. Only verified files inside BACKUP_DIR, only for platform admins. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/platform/backups/[id]/download">) {
  const user = await getCurrentUser();
  if (user?.role !== "PLATFORM_ADMIN") return new Response("Forbidden", { status: 403 });
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  const rec = await db.backupRecord.findUnique({ where: { backupId: id } });
  if (!rec?.filePath || rec.status !== "COMPLETED" || !isInsideDir(rec.filePath, backupDir())) return new Response("Not found", { status: 404 });
  const info = await stat(rec.filePath).catch(() => null);
  if (!info?.isFile()) return new Response("ไฟล์สำรองข้อมูลไม่อยู่บนเครื่องนี้แล้ว", { status: 410 });
  const body = Readable.toWeb(createReadStream(rec.filePath)) as ReadableStream;
  return new Response(body, {
    headers: {
      "content-type": "application/sql",
      "content-length": String(info.size),
      "content-disposition": `attachment; filename="${rec.fileName ?? `${rec.backupCode}.sql`}"`,
      "cache-control": "no-store",
    },
  });
}

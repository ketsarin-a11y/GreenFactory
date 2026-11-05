import "server-only";
import { db } from "@/server/db";
import { backupDir, mysqlBin, mysqldumpBin, toolStatus } from "@/server/backup";

export async function backupOverview() {
  const [rows, dump, client] = await Promise.all([
    db.backupRecord.findMany({ orderBy: { startedAt: "desc" }, take: 50 }),
    toolStatus(mysqldumpBin()),
    toolStatus(mysqlBin()),
  ]);
  const names = await db.user.findMany({
    where: { userId: { in: rows.flatMap((r) => (r.restoredByUserId ? [r.restoredByUserId] : [])) } },
    select: { userId: true, firstName: true, lastName: true },
  });
  const nameOf = new Map(names.map((u) => [u.userId, `${u.firstName} ${u.lastName}`]));
  return {
    dir: backupDir(),
    dump,
    client,
    rows: rows.map((r) => ({
      id: r.backupId,
      code: r.backupCode,
      type: r.backupType,
      fileName: r.fileName,
      size: r.fileSize === null ? null : Number(r.fileSize),
      status: r.status,
      verified: r.verified,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      durationSeconds: r.durationSeconds,
      createdByName: r.createdByName,
      errorMessage: r.errorMessage,
      restoredAt: r.restoredAt,
      restoredBy: r.restoredByUserId ? (nameOf.get(r.restoredByUserId) ?? "—") : null,
    })),
  };
}

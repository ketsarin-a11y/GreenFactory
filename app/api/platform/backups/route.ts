import path from "node:path";
import { NextResponse } from "next/server";

import {
  buildBackupCode,
  createDatabaseBackup,
  formatBytes,
  formatDuration,
  getBackupFilePath,
} from "@/lib/backup";
import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CreateBackupBody = {
  scope?: "FULL" | "DATABASE";
  storage?: "LOCAL" | "CLOUD";
  autoVerify?: boolean;
};

function formatThaiDateTime(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

function toRecord(record: {
  backupId: number;
  backupCode: string;
  backupType: string;
  backupScope: string;
  storageType: string;
  fileName: string | null;
  fileSize: bigint | null;
  status: string;
  verified: boolean;
  startedAt: Date;
  completedAt: Date | null;
  durationSeconds: number | null;
  createdByName: string | null;
  errorMessage: string | null;
  restoredAt: Date | null;
}) {
  return {
    id: record.backupCode,
    databaseId: record.backupId,
    createdAt: formatThaiDateTime(record.startedAt),
    createdDate: record.startedAt.toISOString().slice(0, 10),
    type: record.backupType,
    scope: record.backupScope,
    size: formatBytes(record.fileSize),
    duration: formatDuration(record.durationSeconds),
    status: record.status,
    storage: record.storageType,
    createdBy: record.createdByName ?? "System",
    verified: record.verified,
    canDownload:
      record.status === "COMPLETED" &&
      Boolean(record.fileName),
    canRestore:
      record.status === "COMPLETED" &&
      record.verified &&
      Boolean(record.fileName),
    errorMessage: record.errorMessage,
    restoredAt: record.restoredAt
      ? formatThaiDateTime(record.restoredAt)
      : null,
  };
}

async function requirePlatformAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      response: NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      ),
      session: null,
    };
  }

  if (session.roleName !== "PLATFORM_ADMIN") {
    return {
      response: NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์ใช้งานเมนูนี้" },
        { status: 403 },
      ),
      session: null,
    };
  }

  return { response: null, session };
}

export async function GET() {
  try {
    const auth = await requirePlatformAdmin();
    if (auth.response) return auth.response;

    const records = await prisma.backupRecord.findMany({
      orderBy: {
        startedAt: "desc",
      },
      select: {
        backupId: true,
        backupCode: true,
        backupType: true,
        backupScope: true,
        storageType: true,
        fileName: true,
        fileSize: true,
        status: true,
        verified: true,
        startedAt: true,
        completedAt: true,
        durationSeconds: true,
        createdByName: true,
        errorMessage: true,
        restoredAt: true,
      },
    });

    const completed = records.filter(
      (record) => record.status === "COMPLETED",
    );
    const failed = records.filter(
      (record) => record.status === "FAILED",
    );

    const totalBytes = completed.reduce(
      (sum, record) => sum + Number(record.fileSize ?? 0),
      0,
    );

    const recoveryPoints = completed
      .filter((record) => record.verified && record.fileName)
      .slice(0, 6)
      .map((record) => ({
        id: record.backupCode,
        label:
          record.backupType === "MANUAL"
            ? "Manual recovery point"
            : "Automatic recovery point",
        createdAt: formatThaiDateTime(record.startedAt),
        size: formatBytes(record.fileSize),
        status: "READY" as const,
        databases: 1,
        files: 1,
      }));

    return NextResponse.json({
      success: true,
      data: records.map(toRecord),
      recoveryPoints,
      summary: {
        total: records.length,
        completed: completed.length,
        failed: failed.length,
        running: records.filter(
          (record) => record.status === "RUNNING",
        ).length,
        successRate:
          records.length > 0
            ? Math.round(
                (completed.length / records.length) * 100,
              )
            : 0,
        storageUsed: formatBytes(totalBytes),
        recoveryPointCount: recoveryPoints.length,
        latestCompletedAt:
          completed[0]?.completedAt != null
            ? formatThaiDateTime(completed[0].completedAt)
            : null,
      },
    });
  } catch (error) {
    console.error("GET /api/platform/backups failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดข้อมูล Backup ได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin();
  if (auth.response || !auth.session) {
    return auth.response;
  }

  const session = auth.session;
  const startedAt = new Date();
  let recordId: number | null = null;
  let filePath: string | null = null;

  try {
    const body = (await request.json()) as CreateBackupBody;

    const scope =
      body.scope === "DATABASE" ? "DATABASE" : "FULL";
    const storage =
      body.storage === "CLOUD" ? "CLOUD" : "LOCAL";
    const autoVerify = body.autoVerify !== false;

    if (storage === "CLOUD") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cloud Storage ยังไม่ได้เชื่อมต่อ กรุณาเลือก Local Backup Server",
        },
        { status: 400 },
      );
    }

    const backupCode = buildBackupCode(startedAt);
    const fileName = `${backupCode}.sql`;

    filePath = getBackupFilePath(fileName);

    const created = await prisma.backupRecord.create({
      data: {
        backupCode,
        backupType: "MANUAL",
        backupScope: scope,
        storageType: storage,
        fileName,
        filePath,
        status: "RUNNING",
        verified: false,
        startedAt,
        createdByUserId: session.userId,
        createdByName:
          `${session.firstName} ${session.lastName}`.trim() ||
          session.email,
      },
      select: {
        backupId: true,
      },
    });

    recordId = created.backupId;

    const result = await createDatabaseBackup(filePath);

    const completedAt = new Date();
    const durationSeconds = Math.max(
      1,
      Math.round(
        (completedAt.getTime() - startedAt.getTime()) / 1000,
      ),
    );

    const updated = await prisma.backupRecord.update({
      where: {
        backupId: created.backupId,
      },
      data: {
        fileSize: BigInt(result.fileSize),
        status: "COMPLETED",
        verified: autoVerify,
        completedAt,
        durationSeconds,
        errorMessage: null,
      },
      select: {
        backupId: true,
        backupCode: true,
        backupType: true,
        backupScope: true,
        storageType: true,
        fileName: true,
        fileSize: true,
        status: true,
        verified: true,
        startedAt: true,
        completedAt: true,
        durationSeconds: true,
        createdByName: true,
        errorMessage: true,
        restoredAt: true,
      },
    });

    await writeAuditLog({
      request,
      tableName: "backup_record",
      recordId: created.backupId,
      action: "CREATE",
      newData: {
        backupCode: updated.backupCode,
        backupScope: updated.backupScope,
        storageType: updated.storageType,
        status: updated.status,
        fileName: updated.fileName,
        fileSize: updated.fileSize?.toString() ?? null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "สำรองฐานข้อมูลเรียบร้อยแล้ว",
        data: toRecord(updated),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/platform/backups failed:", error);

    if (recordId != null) {
      await prisma.backupRecord
        .update({
          where: {
            backupId: recordId,
          },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            errorMessage:
              error instanceof Error
                ? error.message
                : "Backup failed",
          },
        })
        .catch(() => undefined);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถสำรองข้อมูลได้",
      },
      { status: 500 },
    );
  }
}

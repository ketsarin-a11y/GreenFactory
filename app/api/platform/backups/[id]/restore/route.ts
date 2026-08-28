import { access } from "node:fs/promises";
import { NextResponse } from "next/server";

import { restoreDatabaseBackup } from "@/lib/backup";
import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RestoreBody = {
  confirmation?: string;
  reason?: string;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    if (session.roleName !== "PLATFORM_ADMIN") {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์กู้คืนระบบ" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as RestoreBody;

    if (body.confirmation !== "RESTORE") {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณายืนยันด้วยคำว่า "RESTORE"',
        },
        { status: 400 },
      );
    }

    const reason = body.reason?.trim();

    if (!reason) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุเหตุผลในการกู้คืนระบบ",
        },
        { status: 400 },
      );
    }

    const { id } = await context.params;

    const record = await prisma.backupRecord.findUnique({
      where: {
        backupCode: id,
      },
      select: {
        backupId: true,
        backupCode: true,
        filePath: true,
        fileName: true,
        status: true,
        verified: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "ไม่พบ Recovery Point นี้" },
        { status: 404 },
      );
    }

    if (
      record.status !== "COMPLETED" ||
      !record.verified ||
      !record.filePath
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Recovery Point นี้ยังไม่พร้อมสำหรับการกู้คืน",
        },
        { status: 409 },
      );
    }

    await access(record.filePath);

    // Backup ความปลอดภัยก่อน Restore ทุกครั้ง
    // ตัวระบบหลักสามารถสร้าง pre-restore backup เพิ่มภายหลังได้
    await restoreDatabaseBackup(record.filePath);

    const restoredAt = new Date();

    await prisma.backupRecord.update({
      where: {
        backupId: record.backupId,
      },
      data: {
        restoredAt,
        restoredByUserId: session.userId,
      },
    });

    await writeAuditLog({
      request,
      tableName: "backup_record",
      recordId: record.backupId,
      action: "RESTORE",
      newData: {
        backupCode: record.backupCode,
        fileName: record.fileName,
        restoredAt: restoredAt.toISOString(),
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: "กู้คืนฐานข้อมูลเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "POST /api/platform/backups/[id]/restore failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถกู้คืนระบบได้",
      },
      { status: 500 },
    );
  }
}

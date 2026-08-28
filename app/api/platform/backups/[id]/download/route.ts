import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
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
        { success: false, message: "ไม่มีสิทธิ์ดาวน์โหลด Backup" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const record = await prisma.backupRecord.findUnique({
      where: {
        backupCode: id,
      },
      select: {
        backupCode: true,
        fileName: true,
        filePath: true,
        status: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "ไม่พบ Backup นี้" },
        { status: 404 },
      );
    }

    if (
      record.status !== "COMPLETED" ||
      !record.filePath ||
      !record.fileName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Backup นี้ยังไม่พร้อมให้ดาวน์โหลด",
        },
        { status: 409 },
      );
    }

    const file = await readFile(record.filePath);

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${record.fileName}"`,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "GET /api/platform/backups/[id]/download failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถดาวน์โหลด Backup ได้",
      },
      { status: 500 },
    );
  }
}

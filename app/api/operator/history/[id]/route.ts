import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณาเข้าสู่ระบบ",
      },
      { status: 401 },
    );
  }

  if (session.roleName !== "OPERATOR") {
    return NextResponse.json(
      {
        success: false,
        message: "ไม่มีสิทธิ์ลบรายการนี้",
      },
      { status: 403 },
    );
  }

  const { id } = await params;

  let usageId: bigint;

  try {
    usageId = BigInt(id);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "รหัสรายการไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  const record = await prisma.resourceUsage.findFirst({
    where: {
      usageId,
      recordedBy: session.userId,
      status: "ACTIVE",
    },
    select: {
      usageId: true,
      usageReference: true,
    },
  });

  if (!record) {
    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่พบรายการ หรือคุณไม่มีสิทธิ์ลบรายการที่ผู้อื่นบันทึก",
      },
      { status: 404 },
    );
  }

  await prisma.resourceUsage.update({
    where: {
      usageId,
    },
    data: {
      status: "INACTIVE",
    },
  });

  return NextResponse.json({
    success: true,
    message: "ลบรายการเรียบร้อยแล้ว",
    data: {
      usageId: record.usageId.toString(),
      usageReference: record.usageReference,
    },
  });
}
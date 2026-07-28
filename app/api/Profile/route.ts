import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

interface UpdateProfileBody {
  phone?: string;
  department?: string;
  productionLine?: string;
}

export async function PATCH(request: NextRequest) {
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
        message: "คุณไม่มีสิทธิ์ใช้งานส่วนนี้",
      },
      { status: 403 },
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as UpdateProfileBody | null;

  if (!body) {
    return NextResponse.json(
      {
        success: false,
        message: "ข้อมูลไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: {
      userId: session.userId,
    },
    data: {
      phone: body.phone?.trim() || null,
      department: body.department?.trim() || null,
      productionLine: body.productionLine?.trim() || null,
    },
  });

  return NextResponse.json({
    success: true,
    message: "อัปเดตข้อมูลเรียบร้อยแล้ว",
  });
}
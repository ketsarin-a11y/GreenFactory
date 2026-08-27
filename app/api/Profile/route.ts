import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const user = await prisma.user.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      productionLine: true,
      profileImagePath: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้งาน",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      department: user.department ?? "",
      productionLine: user.productionLine ?? "",
      avatarUrl: user.profileImagePath,
    },
  });
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

  const body = (await request.json().catch(() => null)) as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    productionLine?: string;
  } | null;

  if (!body) {
    return NextResponse.json(
      {
        success: false,
        message: "รูปแบบข้อมูลไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();

  if (!firstName || !lastName) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณากรอกชื่อและนามสกุล",
      },
      { status: 400 },
    );
  }

  if (firstName.length > 100 || lastName.length > 100) {
    return NextResponse.json(
      {
        success: false,
        message: "ชื่อหรือนามสกุลยาวเกินกำหนด",
      },
      { status: 400 },
    );
  }

  const phone = body.phone?.trim() || null;
  const department = body.department?.trim() || null;
  const productionLine = body.productionLine?.trim() || null;

  if (phone && phone.length > 30) {
    return NextResponse.json(
      {
        success: false,
        message: "เบอร์โทรศัพท์ยาวเกินกำหนด",
      },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: {
      userId: session.userId,
    },
    data: {
      firstName,
      lastName,
      phone,
      department,
      productionLine,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      productionLine: true,
      profileImagePath: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว",
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      department: user.department ?? "",
      productionLine: user.productionLine ?? "",
      avatarUrl: user.profileImagePath,
    },
  });
}
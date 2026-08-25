import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
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

  if (session.roleName !== "COMPANY_ADMIN") {
    return NextResponse.json(
      {
        success: false,
        message: "คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้",
      },
      { status: 403 },
    );
  }

  if (session.companyId === null) {
    return NextResponse.json(
      {
        success: false,
        message: "ไม่พบข้อมูลบริษัทของผู้ใช้งาน",
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

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const phone = body.phone?.trim() ?? "";

  if (!firstName) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณากรอกชื่อ",
      },
      { status: 400 },
    );
  }

  if (!lastName) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณากรอกนามสกุล",
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

  if (phone.length > 30) {
    return NextResponse.json(
      {
        success: false,
        message: "เบอร์โทรศัพท์ยาวเกินกำหนด",
      },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      userId: session.userId,
      companyId: session.companyId,
    },
    select: {
      userId: true,
    },
  });

  if (!existingUser) {
    return NextResponse.json(
      {
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้งาน",
      },
      { status: 404 },
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        userId: existingUser.userId,
      },
      data: {
        firstName,
        lastName,
        phone: phone || null,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        employeeCode: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลเรียบร้อยแล้ว",
      data: {
        ...updatedUser,
        phone: updatedUser.phone ?? "",
      },
    });
  } catch (error) {
    console.error("Update company profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}
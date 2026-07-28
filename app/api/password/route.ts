import { NextRequest, NextResponse } from "next/server";

import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
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
    .catch(() => null)) as ChangePasswordBody | null;

  const currentPassword = body?.currentPassword?.trim() ?? "";
  const newPassword = body?.newPassword ?? "";
  const confirmPassword = body?.confirmPassword ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน",
      },
      { status: 400 },
    );
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        message: `รหัสผ่านใหม่ต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`,
      },
      { status: 400 },
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน",
      },
      { status: 400 },
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      userId: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json(
      {
        success: false,
        message: "ไม่พบผู้ใช้งาน",
      },
      { status: 404 },
    );
  }

  if (!dbUser.isActive) {
    return NextResponse.json(
      {
        success: false,
        message: "บัญชีผู้ใช้งานถูกระงับ",
      },
      { status: 403 },
    );
  }

  const currentPasswordIsValid = await verifyPassword(
    currentPassword,
    dbUser.passwordHash,
  );

  if (!currentPasswordIsValid) {
    return NextResponse.json(
      {
        success: false,
        message: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      },
      { status: 401 },
    );
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      userId: session.userId,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return NextResponse.json({
    success: true,
    message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
  });
}
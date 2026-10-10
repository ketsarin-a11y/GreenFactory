import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ResetPasswordBody = {
  token?: string;
  password?: string;
};

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResetPasswordBody;
    const token = body.token?.trim();
    const password = body.password ?? "";

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลสำหรับตั้งรหัสผ่านใหม่ไม่ครบถ้วน" },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { success: false, message: passwordError },
        { status: 400 },
      );
    }

    const tokenHash = sha256(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId: resetToken.userId },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "ลิงก์ตั้งรหัสผ่านไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { userId: user.userId },
        data: {
          passwordHash,
          failedLogin: 0,
          lockedUntil: null,
        },
      }),

      prisma.passwordResetToken.update({
        where: { resetTokenId: resetToken.resetTokenId },
        data: {
          usedAt: now,
        },
      }),

      prisma.passwordResetToken.updateMany({
        where: {
          userId: user.userId,
          resetTokenId: { not: resetToken.resetTokenId },
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาลองอีกครั้ง",
      },
      { status: 500 },
    );
  }
}

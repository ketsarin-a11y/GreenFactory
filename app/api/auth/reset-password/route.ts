import { createHash } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบ Token สำหรับตั้งรหัสผ่านใหม่",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
        select: {
          resetTokenId: true,
          userId: true,
          expiresAt: true,
          usedAt: true,
        },
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "ลิงก์ตั้งรหัสผ่านไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "ลิงก์นี้ถูกใช้งานไปแล้ว",
        },
        { status: 400 },
      );
    }

    if (resetToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: "ลิงก์ตั้งรหัสผ่านหมดอายุแล้ว กรุณาขอลิงก์ใหม่",
        },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          userId: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          resetTokenId: resetToken.resetTokenId,
        },
        data: {
          usedAt: new Date(),
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
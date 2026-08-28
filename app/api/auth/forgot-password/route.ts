import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const RESET_TOKEN_EXPIRES_MINUTES = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกอีเมล",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        userId: true,
        email: true,
        status: true,
      },
    });

    /*
     * ไม่ควรบอกผู้ใช้ว่าอีเมลมีอยู่จริงหรือไม่
     * เพื่อป้องกัน email enumeration
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ",
      });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({
        success: true,
        message:
          "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ",
      });
    }

    /*
     * ยกเลิก token เก่าที่ยังไม่ได้ใช้ของ user คนนี้
     */
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.userId,
        usedAt: null,
      },
    });

    /*
     * Token จริงจะถูกส่งให้ผู้ใช้
     * แต่ใน database เก็บเฉพาะ hash
     */
    const resetToken = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000,
    );

    await prisma.passwordResetToken.create({
      data: {
        userId: user.userId,
        tokenHash,
        expiresAt,
      },
    });

    /*
     * ขั้นถัดไปเราจะใช้ resetToken ตัวนี้
     * สร้าง URL แล้วส่งเข้า email จริง
     *
     * ตัวอย่าง:
     * /reset-password?token=xxxx
     */

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Password reset link:",
        `http://localhost:3000/reset-password?token=${resetToken}`,
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่สามารถดำเนินการตั้งรหัสผ่านใหม่ได้ กรุณาลองอีกครั้ง",
      },
      { status: 500 },
    );
  }
}
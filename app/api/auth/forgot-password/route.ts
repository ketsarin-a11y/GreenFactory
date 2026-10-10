import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ForgotPasswordBody = {
  email?: string;
};

const GENERIC_MESSAGE =
  "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function sendResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.PASSWORD_RESET_FROM ??
    "GreenFactory Insight <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false as const, reason: "RESEND_API_KEY_NOT_CONFIGURED" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: "ตั้งรหัสผ่านใหม่ | GreenFactory Insight",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 12px">ตั้งรหัสผ่านใหม่</h2>
          <p style="line-height:1.7;color:#475569">
            เราได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี GreenFactory Insight
          </p>
          <a href="${params.resetUrl}"
             style="display:inline-block;margin:20px 0;padding:12px 20px;border-radius:12px;background:#059669;color:white;text-decoration:none;font-weight:700">
             ตั้งรหัสผ่านใหม่
          </a>
          <p style="font-size:13px;line-height:1.7;color:#64748b">
            ลิงก์นี้มีอายุ 30 นาที และใช้ได้เพียงครั้งเดียว
            หากคุณไม่ได้เป็นผู้ขอ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้
          </p>
        </div>
      `,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Resend password reset email failed:", errorText);
    return { sent: false as const, reason: "EMAIL_PROVIDER_ERROR" };
  }

  return { sent: true as const };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForgotPasswordBody;
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกอีเมล" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        email: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({
        success: true,
        message: GENERIC_MESSAGE,
      });
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.userId,
        tokenHash,
        expiresAt,
      },
    });

    const requestUrl = new URL(request.url);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      `${requestUrl.protocol}//${requestUrl.host}`;

    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    const mailResult = await sendResetEmail({
      to: user.email,
      resetUrl,
    });

    if (!mailResult.sent) {
      console.warn(
        `Password reset email was not sent: ${mailResult.reason}`,
      );
    }

    return NextResponse.json({
      success: true,
      message: GENERIC_MESSAGE,
      ...(process.env.NODE_ENV !== "production" && !mailResult.sent
        ? { devResetUrl: resetUrl }
        : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ChangePasswordBody | null;
  const currentPassword = body?.currentPassword ?? "";
  const newPassword = body?.newPassword ?? "";
  const confirmPassword = body?.confirmPassword ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ success: false, message: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน" }, { status: 400 });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { success: false, message: `รหัสผ่านใหม่ต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` },
      { status: 400 },
    );
  }

  const dbUser = await prisma.user.findUnique({ where: { userId: user.id } });
  if (!dbUser) {
    return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้งาน" }, { status: 404 });
  }

  const currentOk = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!currentOk) {
    return NextResponse.json({ success: false, message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { userId: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ success: true });
}
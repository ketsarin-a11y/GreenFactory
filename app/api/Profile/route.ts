import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateProfileBody {
  phone?: string;
  department?: string;
  productionLine?: string;
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UpdateProfileBody | null;
  if (!body) {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  // หมายเหตุ: ตั้งใจไม่ให้แก้ ชื่อ-นามสกุล / อีเมล / username / รหัสพนักงาน / ตำแหน่ง
  // จากหน้านี้ เพราะควรเป็นข้อมูลที่ต้องผ่านการอนุมัติจาก Company Admin เท่านั้น
  await prisma.user.update({
    where: { userId: user.id },
    data: {
      phone: body.phone?.trim() || null,
      department: body.department?.trim() || null,
      productionLine: body.productionLine?.trim() || null,
    },
  });

  return NextResponse.json({ success: true });
}
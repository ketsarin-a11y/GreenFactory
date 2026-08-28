import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export async function PATCH(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "กรุณาเข้าสู่ระบบ" },
      { status: 401 },
    );
  }

  if (session.roleName !== "PLATFORM_ADMIN") {
    return NextResponse.json(
      { success: false, message: "ไม่มีสิทธิ์ใช้งาน" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);

  const ticketId = Number(body?.ticketId);
  const status = String(body?.status ?? "");

  if (!Number.isInteger(ticketId) || !ALLOWED_STATUS.has(status)) {
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  await prisma.supportTicket.update({
    where: { ticketId },
    data: { status },
  });

  return NextResponse.json({ success: true });
}

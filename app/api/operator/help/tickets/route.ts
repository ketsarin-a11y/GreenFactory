import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function createReference() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `SUP-${date}-${random}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "กรุณาเข้าสู่ระบบ" },
      { status: 401 },
    );
  }

  if (session.roleName !== "OPERATOR") {
    return NextResponse.json(
      { success: false, message: "ไม่มีสิทธิ์ใช้งาน" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const subject = String(body.subject ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "GENERAL");
  const priority = String(body.priority ?? "NORMAL");
  const pageUrl = body.pageUrl ? String(body.pageUrl).trim() : null;

  if (!subject || !description) {
    return NextResponse.json(
      { success: false, message: "กรุณากรอกหัวข้อและรายละเอียด" },
      { status: 400 },
    );
  }

  const ticketReference = createReference();

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketReference,
      reporterId: session.userId,
      companyId: session.companyId ?? null,
      subject: subject.slice(0, 150),
      category: category.slice(0, 30),
      priority: priority.slice(0, 20),
      description: description.slice(0, 3000),
      pageUrl: pageUrl?.slice(0, 500) ?? null,
      status: "OPEN",
    },
    select: {
      ticketId: true,
      ticketReference: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      ticketId: ticket.ticketId,
      ticketReference: ticket.ticketReference,
    },
  });
}

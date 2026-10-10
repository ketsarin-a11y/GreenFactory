import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateBody = {
  status?: "ACTIVE" | "SUSPENDED";
};

async function auth() {
  const session = await getSession();

  if (
    !session ||
    session.roleName !== "COMPANY_ADMIN" ||
    session.companyId == null
  ) {
    return null;
  }

  return {
    session,
    companyId: session.companyId,
  };
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const authResult = await auth();

    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์จัดการผู้ใช้งานบริษัท",
        },
        { status: 403 },
      );
    }

    const { session, companyId } = authResult;
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const target = await prisma.user.findFirst({
      where: {
        userId,
        companyId,
      },
      select: {
        userId: true,
        role: {
          select: {
            roleName: true,
          },
        },
      },
    });

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งานในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    if (target.userId === session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่สามารถระงับบัญชีของตัวเองได้",
        },
        { status: 400 },
      );
    }

    if (target.role.roleName === "COMPANY_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่สามารถแก้ Company Admin จากหน้านี้",
        },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateBody;

    if (
      body.status !== "ACTIVE" &&
      body.status !== "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "สถานะไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: {
        userId,
      },
      data: {
        status:
          body.status === "SUSPENDED"
            ? "LOCKED"
            : "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        body.status === "SUSPENDED"
          ? "ระงับบัญชีแล้ว"
          : "เปิดใช้งานบัญชีแล้ว",
    });
  } catch (error) {
    console.error(
      "PATCH /api/company/users/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถแก้ไขผู้ใช้งานได้",
      },
      { status: 500 },
    );
  }
}
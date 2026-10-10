import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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

export async function POST(request: Request) {
  try {
    const authResult = await auth();

    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์จัดการสายการผลิต",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const body = await request.json();

    const departmentId = Number(body.departmentId);
    const lineCode = String(body.lineCode ?? "")
      .trim()
      .toUpperCase();
    const lineName = String(body.lineName ?? "").trim();

    if (
      !Number.isInteger(departmentId) ||
      departmentId <= 0 ||
      !lineCode ||
      !lineName
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณาระบุแผนก รหัสสายการผลิต และชื่อสายการผลิต",
        },
        { status: 400 },
      );
    }

    const department = await prisma.department.findFirst({
      where: {
        departmentId,
        building: {
          factory: {
            companyId,
          },
        },
      },
      select: {
        departmentId: true,
      },
    });

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบแผนกในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const duplicate = await prisma.productionLine.findFirst({
      where: {
        departmentId,
        lineCode,
      },
      select: {
        lineId: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสสายการผลิตนี้มีอยู่ในแผนกแล้ว",
        },
        { status: 409 },
      );
    }

    await prisma.productionLine.create({
      data: {
        departmentId,
        lineCode,
        lineName,
        description:
          String(body.description ?? "").trim() || null,
        status:
          body.status === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มสายการผลิตเรียบร้อยแล้ว",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/company/structure/production-lines failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เพิ่มสายการผลิตไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
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
          message: "ไม่มีสิทธิ์จัดการแผนก",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const body = await request.json();

    const buildingId = Number(body.buildingId);
    const departmentCode = String(body.departmentCode ?? "")
      .trim()
      .toUpperCase();
    const departmentName = String(body.departmentName ?? "").trim();

    if (
      !Number.isInteger(buildingId) ||
      buildingId <= 0 ||
      !departmentCode ||
      !departmentName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุอาคาร รหัสแผนก และชื่อแผนก",
        },
        { status: 400 },
      );
    }

    const building = await prisma.building.findFirst({
      where: {
        buildingId,
        factory: {
          companyId,
        },
      },
      select: {
        buildingId: true,
      },
    });

    if (!building) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบอาคารในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const duplicate = await prisma.department.findFirst({
      where: {
        buildingId,
        departmentCode,
      },
      select: {
        departmentId: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสแผนกนี้มีอยู่ในอาคารแล้ว",
        },
        { status: 409 },
      );
    }

    await prisma.department.create({
      data: {
        buildingId,
        departmentCode,
        departmentName,
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
        message: "เพิ่มแผนกเรียบร้อยแล้ว",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/company/structure/departments failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เพิ่มแผนกไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
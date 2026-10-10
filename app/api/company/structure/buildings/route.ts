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
          message: "ไม่มีสิทธิ์จัดการอาคาร",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const body = await request.json();

    const factoryId = Number(body.factoryId);
    const buildingCode = String(body.buildingCode ?? "")
      .trim()
      .toUpperCase();
    const buildingName = String(body.buildingName ?? "").trim();

    if (
      !Number.isInteger(factoryId) ||
      factoryId <= 0 ||
      !buildingCode ||
      !buildingName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุโรงงาน รหัสอาคาร และชื่ออาคาร",
        },
        { status: 400 },
      );
    }

    let floorCount: number | null = null;

    if (
      body.floorCount !== "" &&
      body.floorCount !== null &&
      body.floorCount !== undefined
    ) {
      floorCount = Number(body.floorCount);

      if (!Number.isInteger(floorCount) || floorCount <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "จำนวนชั้นต้องเป็นจำนวนเต็มมากกว่า 0",
          },
          { status: 400 },
        );
      }
    }

    const factory = await prisma.factory.findFirst({
      where: {
        factoryId,
        companyId,
      },
      select: {
        factoryId: true,
      },
    });

    if (!factory) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบโรงงานในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const duplicate = await prisma.building.findFirst({
      where: {
        factoryId,
        buildingCode,
      },
      select: {
        buildingId: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสอาคารนี้มีอยู่ในโรงงานแล้ว",
        },
        { status: 409 },
      );
    }

    await prisma.building.create({
      data: {
        factoryId,
        buildingCode,
        buildingName,
        buildingType:
          String(body.buildingType ?? "").trim() || null,
        floorCount,
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
        message: "เพิ่มอาคารเรียบร้อยแล้ว",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/company/structure/buildings failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เพิ่มอาคารไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
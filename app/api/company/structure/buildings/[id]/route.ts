import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Ctx = {
  params: Promise<{ id: string }>;
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

async function owned(id: number, companyId: number) {
  return prisma.building.findFirst({
    where: {
      buildingId: id,
      factory: {
        companyId,
      },
    },
    select: {
      buildingId: true,
      factoryId: true,
      buildingCode: true,
      _count: {
        select: {
          departments: true,
          resourceUsages: true,
          kpis: true,
          alerts: true,
          aiRecommendations: true,
        },
      },
    },
  });
}

export async function PATCH(request: Request, { params }: Ctx) {
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
    const buildingId = Number((await params).id);

    if (!Number.isInteger(buildingId) || buildingId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Building ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await owned(buildingId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบอาคารในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const factoryId =
      body.factoryId === undefined
        ? current.factoryId
        : Number(body.factoryId);

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Factory ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    if (body.factoryId !== undefined) {
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
    }

    const buildingCode =
      body.buildingCode === undefined
        ? current.buildingCode
        : String(body.buildingCode).trim().toUpperCase();

    if (!buildingCode) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุรหัสอาคาร",
        },
        { status: 400 },
      );
    }

    if (
      body.buildingName !== undefined &&
      !String(body.buildingName).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุชื่ออาคาร",
        },
        { status: 400 },
      );
    }

    let floorCount: number | null | undefined;

    if (body.floorCount !== undefined) {
      if (body.floorCount === "" || body.floorCount === null) {
        floorCount = null;
      } else {
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
    }

    const duplicate = await prisma.building.findFirst({
      where: {
        factoryId,
        buildingCode,
        NOT: {
          buildingId,
        },
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

    await prisma.building.update({
      where: {
        buildingId,
      },
      data: {
        ...(body.factoryId !== undefined && {
          factoryId,
        }),
        ...(body.buildingCode !== undefined && {
          buildingCode,
        }),
        ...(body.buildingName !== undefined && {
          buildingName: String(body.buildingName).trim(),
        }),
        ...(body.buildingType !== undefined && {
          buildingType:
            String(body.buildingType).trim() || null,
        }),
        ...(body.floorCount !== undefined && {
          floorCount,
        }),
        ...(body.description !== undefined && {
          description:
            String(body.description).trim() || null,
        }),
        ...(body.status !== undefined && {
          status:
            body.status === "INACTIVE"
              ? "INACTIVE"
              : "ACTIVE",
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลอาคารเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "PATCH /api/company/structure/buildings/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "แก้ไขอาคารไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Ctx,
) {
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
    const buildingId = Number((await params).id);

    if (!Number.isInteger(buildingId) || buildingId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Building ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await owned(buildingId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบอาคารในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const linked = Object.values(current._count).some(
      (value) => value > 0,
    );

    if (linked) {
      await prisma.building.update({
        where: {
          buildingId,
        },
        data: {
          status: "INACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "อาคารมีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ",
      });
    }

    await prisma.building.delete({
      where: {
        buildingId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบอาคารเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "DELETE /api/company/structure/buildings/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ลบอาคารไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
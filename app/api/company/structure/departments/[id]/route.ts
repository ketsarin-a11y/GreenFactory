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
  return prisma.department.findFirst({
    where: {
      departmentId: id,
      building: {
        factory: {
          companyId,
        },
      },
    },
    select: {
      departmentId: true,
      buildingId: true,
      departmentCode: true,
      _count: {
        select: {
          productionLines: true,
          users: true,
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
          message: "ไม่มีสิทธิ์จัดการแผนก",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const departmentId = Number((await params).id);

    if (
      !Number.isInteger(departmentId) ||
      departmentId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Department ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await owned(departmentId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบแผนกในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const buildingId =
      body.buildingId === undefined
        ? current.buildingId
        : Number(body.buildingId);

    if (
      !Number.isInteger(buildingId) ||
      buildingId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Building ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    if (body.buildingId !== undefined) {
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
    }

    const departmentCode =
      body.departmentCode === undefined
        ? current.departmentCode
        : String(body.departmentCode).trim().toUpperCase();

    if (!departmentCode) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุรหัสแผนก",
        },
        { status: 400 },
      );
    }

    if (
      body.departmentName !== undefined &&
      !String(body.departmentName).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุชื่อแผนก",
        },
        { status: 400 },
      );
    }

    const duplicate = await prisma.department.findFirst({
      where: {
        buildingId,
        departmentCode,
        NOT: {
          departmentId,
        },
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

    await prisma.department.update({
      where: {
        departmentId,
      },
      data: {
        ...(body.buildingId !== undefined && {
          buildingId,
        }),
        ...(body.departmentCode !== undefined && {
          departmentCode,
        }),
        ...(body.departmentName !== undefined && {
          departmentName: String(body.departmentName).trim(),
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
      message: "บันทึกข้อมูลแผนกเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "PATCH /api/company/structure/departments/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "แก้ไขแผนกไม่สำเร็จ",
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
          message: "ไม่มีสิทธิ์จัดการแผนก",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const departmentId = Number((await params).id);

    if (
      !Number.isInteger(departmentId) ||
      departmentId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Department ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await owned(departmentId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบแผนกในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const linked = Object.values(current._count).some(
      (value) => value > 0,
    );

    if (linked) {
      await prisma.department.update({
        where: {
          departmentId,
        },
        data: {
          status: "INACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "แผนกมีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ",
      });
    }

    await prisma.department.delete({
      where: {
        departmentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบแผนกเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "DELETE /api/company/structure/departments/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ลบแผนกไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
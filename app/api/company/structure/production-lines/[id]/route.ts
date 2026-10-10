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
  return prisma.productionLine.findFirst({
    where: {
      lineId: id,
      department: {
        building: {
          factory: {
            companyId,
          },
        },
      },
    },
    select: {
      lineId: true,
      departmentId: true,
      lineCode: true,
      _count: {
        select: {
          machines: true,
          checkpoints: true,
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
          message: "ไม่มีสิทธิ์จัดการสายการผลิต",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const lineId = Number((await params).id);

    if (!Number.isInteger(lineId) || lineId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Production Line ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await owned(lineId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบสายการผลิตในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const departmentId =
      body.departmentId === undefined
        ? current.departmentId
        : Number(body.departmentId);

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

    if (body.departmentId !== undefined) {
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
    }

    const lineCode =
      body.lineCode === undefined
        ? current.lineCode
        : String(body.lineCode).trim().toUpperCase();

    if (!lineCode) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุรหัสสายการผลิต",
        },
        { status: 400 },
      );
    }

    if (
      body.lineName !== undefined &&
      !String(body.lineName).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุชื่อสายการผลิต",
        },
        { status: 400 },
      );
    }

    const duplicate = await prisma.productionLine.findFirst({
      where: {
        departmentId,
        lineCode,
        NOT: {
          lineId,
        },
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

    await prisma.productionLine.update({
      where: {
        lineId,
      },
      data: {
        ...(body.departmentId !== undefined && {
          departmentId,
        }),
        ...(body.lineCode !== undefined && {
          lineCode,
        }),
        ...(body.lineName !== undefined && {
          lineName: String(body.lineName).trim(),
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
      message: "บันทึกข้อมูลสายการผลิตเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "PATCH /api/company/structure/production-lines/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "แก้ไขสายการผลิตไม่สำเร็จ",
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
          message: "ไม่มีสิทธิ์จัดการสายการผลิต",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const lineId = Number((await params).id);

    if (!Number.isInteger(lineId) || lineId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Production Line ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await owned(lineId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบสายการผลิตในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const linked = Object.values(current._count).some(
      (value) => value > 0,
    );

    if (linked) {
      await prisma.productionLine.update({
        where: {
          lineId,
        },
        data: {
          status: "INACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "สายการผลิตมีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ",
      });
    }

    await prisma.productionLine.delete({
      where: {
        lineId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบสายการผลิตเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "DELETE /api/company/structure/production-lines/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ลบสายการผลิตไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
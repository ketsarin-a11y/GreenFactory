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

async function owned(machineId: number, companyId: number) {
  return prisma.machine.findFirst({
    where: {
      machineId,
      productionLine: {
        department: {
          building: {
            factory: {
              companyId,
            },
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          sensors: true,
          qrCodes: true,
          resourceUsages: true,
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
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const machineId = Number((await params).id);

    if (!Number.isInteger(machineId) || machineId <= 0) {
      return NextResponse.json(
        { success: false, message: "Machine ID ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const current = await owned(machineId, companyId);

    if (!current) {
      return NextResponse.json(
        { success: false, message: "ไม่พบเครื่องจักรในบริษัทนี้" },
        { status: 404 },
      );
    }

    const b = await request.json();

    const lineId =
      b.lineId === undefined ? current.lineId : Number(b.lineId);

    if (!Number.isInteger(lineId) || lineId <= 0) {
      return NextResponse.json(
        { success: false, message: "Production Line ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    if (b.lineId !== undefined) {
      const line = await prisma.productionLine.findFirst({
        where: {
          lineId,
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
        },
      });

      if (!line) {
        return NextResponse.json(
          {
            success: false,
            message: "ไม่พบ Production Line ในบริษัทนี้",
          },
          { status: 404 },
        );
      }
    }

    const machineCode =
      b.machineCode === undefined
        ? current.machineCode
        : String(b.machineCode).trim().toUpperCase();

    if (!machineCode) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุรหัสเครื่องจักร" },
        { status: 400 },
      );
    }

    if (
      b.machineName !== undefined &&
      !String(b.machineName).trim()
    ) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุชื่อเครื่องจักร" },
        { status: 400 },
      );
    }

    if (b.machineTypeId !== undefined) {
      const machineTypeId = Number(b.machineTypeId);

      if (!Number.isInteger(machineTypeId) || machineTypeId <= 0) {
        return NextResponse.json(
          { success: false, message: "Machine Type ไม่ถูกต้อง" },
          { status: 400 },
        );
      }

      const machineType = await prisma.machineType.findFirst({
        where: {
          machineTypeId,
          status: "ACTIVE",
        },
        select: {
          machineTypeId: true,
        },
      });

      if (!machineType) {
        return NextResponse.json(
          { success: false, message: "ไม่พบ Machine Type ที่ใช้งานได้" },
          { status: 404 },
        );
      }
    }

    const duplicate = await prisma.machine.findFirst({
      where: {
        lineId,
        machineCode,
        NOT: {
          machineId,
        },
      },
      select: {
        machineId: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสเครื่องจักรซ้ำใน Production Line",
        },
        { status: 409 },
      );
    }

    await prisma.machine.update({
      where: {
        machineId,
      },
      data: {
        ...(b.lineId !== undefined && {
          lineId,
        }),
        ...(b.machineTypeId !== undefined && {
          machineTypeId: Number(b.machineTypeId),
        }),
        ...(b.machineCode !== undefined && {
          machineCode,
        }),
        ...(b.machineName !== undefined && {
          machineName: String(b.machineName).trim(),
        }),
        ...(b.manufacturer !== undefined && {
          manufacturer: String(b.manufacturer).trim() || null,
        }),
        ...(b.model !== undefined && {
          model: String(b.model).trim() || null,
        }),
        ...(b.serialNumber !== undefined && {
          serialNumber: String(b.serialNumber).trim() || null,
        }),
        ...(b.installationDate !== undefined && {
          installationDate: b.installationDate
            ? new Date(`${b.installationDate}T00:00:00`)
            : null,
        }),
        ...(b.locationNote !== undefined && {
          locationNote: String(b.locationNote).trim() || null,
        }),
        ...(b.operationalStatus !== undefined && {
          operationalStatus: String(b.operationalStatus),
        }),
        ...(b.status !== undefined && {
          status: b.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลเครื่องจักรเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "PATCH /api/company/machines/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "แก้ไขไม่สำเร็จ",
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
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const machineId = Number((await params).id);

    if (!Number.isInteger(machineId) || machineId <= 0) {
      return NextResponse.json(
        { success: false, message: "Machine ID ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const current = await owned(machineId, companyId);

    if (!current) {
      return NextResponse.json(
        { success: false, message: "ไม่พบเครื่องจักรในบริษัทนี้" },
        { status: 404 },
      );
    }

    if (
      current._count.sensors ||
      current._count.qrCodes ||
      current._count.resourceUsages
    ) {
      await prisma.machine.update({
        where: {
          machineId,
        },
        data: {
          status: "INACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "มีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ",
      });
    }

    await prisma.machine.delete({
      where: {
        machineId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบเครื่องจักรเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "DELETE /api/company/machines/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "ลบไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
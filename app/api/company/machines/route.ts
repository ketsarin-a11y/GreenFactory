import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

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

const scope = (companyId: number) => ({
  productionLine: {
    department: {
      building: {
        factory: {
          companyId,
        },
      },
    },
  },
});

export async function GET() {
  try {
    const authResult = await auth();

    if (!authResult) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;

    const [machines, hierarchy, machineTypes] = await Promise.all([
      prisma.machine.findMany({
        where: {
          ...scope(companyId),
          status: "ACTIVE",
        },
        orderBy: {
          machineName: "asc",
        },
        include: {
          machineType: true,
          productionLine: {
            include: {
              department: {
                include: {
                  building: {
                    include: {
                      factory: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              sensors: true,
              qrCodes: true,
              resourceUsages: true,
            },
          },
        },
      }),

      prisma.factory.findMany({
        where: {
          companyId,
          status: "ACTIVE",
        },
        orderBy: {
          factoryName: "asc",
        },
        include: {
          buildings: {
            where: {
              status: "ACTIVE",
            },
            orderBy: {
              buildingName: "asc",
            },
            include: {
              departments: {
                where: {
                  status: "ACTIVE",
                },
                orderBy: {
                  departmentName: "asc",
                },
                include: {
                  productionLines: {
                    where: {
                      status: "ACTIVE",
                    },
                    orderBy: {
                      lineName: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.machineType.findMany({
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          machineTypeName: "asc",
        },
      }),
    ]);

    const data = machines.map((machine) => {
      const department = machine.productionLine.department;
      const building = department.building;
      const factory = building.factory;

      const checks = [
        machine.machineCode,
        machine.machineName,
        machine.machineTypeId,
        machine.lineId,
        machine.manufacturer,
        machine.model,
        machine.serialNumber,
        machine.installationDate,
        machine.locationNote,
        machine._count.sensors > 0,
        machine._count.qrCodes > 0,
      ];

      return {
        id: machine.machineId,
        code: machine.machineCode,
        name: machine.machineName,
        manufacturer: machine.manufacturer,
        model: machine.model,
        serialNumber: machine.serialNumber,
        installationDate: machine.installationDate,
        locationNote: machine.locationNote,
        operationalStatus: machine.operationalStatus,
        status: machine.status,

        machineType: {
          id: machine.machineType.machineTypeId,
          code: machine.machineType.machineTypeCode,
          name: machine.machineType.machineTypeName,
        },

        factory: {
          id: factory.factoryId,
          code: factory.factoryCode,
          name: factory.factoryName,
        },

        building: {
          id: building.buildingId,
          code: building.buildingCode,
          name: building.buildingName,
        },

        department: {
          id: department.departmentId,
          code: department.departmentCode,
          name: department.departmentName,
        },

        productionLine: {
          id: machine.productionLine.lineId,
          code: machine.productionLine.lineCode,
          name: machine.productionLine.lineName,
        },

        sensors: machine._count.sensors,
        qrCodes: machine._count.qrCodes,
        resourceUsages: machine._count.resourceUsages,

        readiness: Math.round(
          (checks.filter(Boolean).length / checks.length) * 100,
        ),
      };
    });

    return NextResponse.json({
      success: true,
      data,
      hierarchy,
      machineTypes,
      summary: {
        total: data.length,
        active: data.length,
        maintenance: data.filter(
          (item) => item.operationalStatus === "MAINTENANCE",
        ).length,
        sensors: data.reduce(
          (sum, item) => sum + item.sensors,
          0,
        ),
        qrReady: data.filter(
          (item) => item.qrCodes > 0,
        ).length,
      },
    });
  } catch (error) {
    console.error("GET /api/company/machines failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "โหลดข้อมูลไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await auth();

    if (!authResult) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;
    const body = await request.json();

    const lineId = Number(body.lineId);
    const machineTypeId = Number(body.machineTypeId);
    const machineCode = String(body.machineCode ?? "")
      .trim()
      .toUpperCase();
    const machineName = String(body.machineName ?? "").trim();

    if (
      !Number.isInteger(lineId) ||
      lineId <= 0 ||
      !Number.isInteger(machineTypeId) ||
      machineTypeId <= 0 ||
      !machineCode ||
      !machineName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
        },
        { status: 400 },
      );
    }

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
        {
          success: false,
          message: "ไม่พบประเภทเครื่องจักร",
        },
        { status: 404 },
      );
    }

    const existing = await prisma.machine.findFirst({
      where: {
        lineId,
        machineCode,
      },
      select: {
        machineId: true,
        status: true,
      },
    });

    if (existing?.status === "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสเครื่องจักรนี้มีอยู่ในสายการผลิตแล้ว",
        },
        { status: 409 },
      );
    }

    const data = {
      lineId,
      machineTypeId,
      machineCode,
      machineName,
      manufacturer:
        String(body.manufacturer ?? "").trim() || null,
      model:
        String(body.model ?? "").trim() || null,
      serialNumber:
        String(body.serialNumber ?? "").trim() || null,
      installationDate: body.installationDate
        ? new Date(`${body.installationDate}T00:00:00`)
        : null,
      locationNote:
        String(body.locationNote ?? "").trim() || null,
      operationalStatus:
        String(body.operationalStatus ?? "NORMAL"),
      status:
        body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    };

    if (existing) {
      await prisma.machine.update({
        where: {
          machineId: existing.machineId,
        },
        data,
      });

      return NextResponse.json(
        {
          success: true,
          message: "นำเครื่องจักรเดิมกลับมาใช้งานเรียบร้อยแล้ว",
        },
        { status: 200 },
      );
    }

    await prisma.machine.create({
      data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มเครื่องจักรเรียบร้อยแล้ว",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/company/machines failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เพิ่มเครื่องจักรไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
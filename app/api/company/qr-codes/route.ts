import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function auth() {
  const session = await getSession();

  if (
    !session ||
    session.roleName !== "COMPANY_ADMIN" ||
    !session.companyId
  ) {
    return null;
  }

  return session;
}

function machineCompanyScope(companyId: number) {
  return {
    productionLine: {
      department: {
        building: {
          factory: {
            companyId,
          },
        },
      },
    },
  };
}

function checkpointCompanyScope(companyId: number) {
  return {
    productionLine: {
      department: {
        building: {
          factory: {
            companyId,
          },
        },
      },
    },
  };
}

/**
 * GET
 *
 * คืนค่า:
 * - QR Code ของบริษัทนี้เท่านั้น
 * - Machine จริงของบริษัท
 * - Checkpoint จริงของบริษัท
 * - Summary
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์เข้าถึงข้อมูล QR Code",
        },
        { status: 403 },
      );
    }

    const companyId = session.companyId;

    const [qrCodes, machines, checkpoints] =
      await Promise.all([
        prisma.qRCode.findMany({
          where: {
            OR: [
              {
                machine: machineCompanyScope(companyId),
              },
              {
                checkpoint:
                  checkpointCompanyScope(companyId),
              },
            ],
          },

          orderBy: {
            createdAt: "desc",
          },

          include: {
            machine: {
              include: {
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
              },
            },

            checkpoint: {
              include: {
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
              },
            },

            _count: {
              select: {
                scans: true,
              },
            },
          },
        }),

        prisma.machine.findMany({
          where: {
            status: "ACTIVE",
            ...machineCompanyScope(companyId),
          },

          orderBy: {
            machineName: "asc",
          },

          include: {
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
          },
        }),

        prisma.checkpoint.findMany({
          where: {
            status: "ACTIVE",
            ...checkpointCompanyScope(companyId),
          },

          orderBy: {
            checkpointName: "asc",
          },

          include: {
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
          },
        }),
      ]);

    /**
     * QR Code
     *
     * แปลง Prisma object
     * ให้เป็นรูปที่ Frontend ใช้ง่าย
     */
    const data = qrCodes.map((qr) => {
      if (qr.machine) {
        const line = qr.machine.productionLine;
        const department = line.department;
        const building = department.building;
        const factory = building.factory;

        return {
          id: qr.qrId.toString(),

          code: qr.qrCode,
          token: qr.qrToken,

          targetType: "MACHINE" as const,

          targetId: qr.machine.machineId,
          targetName: qr.machine.machineName,
          targetCode: qr.machine.machineCode,

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
            id: line.lineId,
            code: line.lineCode,
            name: line.lineName,
          },

          status: qr.qrStatus,

          imagePath: qr.qrImagePath,

          generatedAt: qr.generatedAt.toISOString(),

          revokedAt:
            qr.revokedAt?.toISOString() ?? null,

          createdAt: qr.createdAt.toISOString(),
          updatedAt: qr.updatedAt.toISOString(),

          scanCount: qr._count.scans,
        };
      }

      if (qr.checkpoint) {
        const line = qr.checkpoint.productionLine;
        const department = line.department;
        const building = department.building;
        const factory = building.factory;

        return {
          id: qr.qrId.toString(),

          code: qr.qrCode,
          token: qr.qrToken,

          targetType: "CHECKPOINT" as const,

          targetId: qr.checkpoint.checkpointId,
          targetName: qr.checkpoint.checkpointName,
          targetCode: qr.checkpoint.checkpointCode,

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
            id: line.lineId,
            code: line.lineCode,
            name: line.lineName,
          },

          status: qr.qrStatus,

          imagePath: qr.qrImagePath,

          generatedAt: qr.generatedAt.toISOString(),

          revokedAt:
            qr.revokedAt?.toISOString() ?? null,

          createdAt: qr.createdAt.toISOString(),
          updatedAt: qr.updatedAt.toISOString(),

          scanCount: qr._count.scans,
        };
      }

      return null;
    });

    /**
     * ตัด QR ที่ไม่มี target
     * เช่น machine ถูกลบในอนาคต
     */
    const cleanedData = data.filter(
      (item) => item !== null,
    );

    /**
     * Machine options จริง
     */
    const machineTargets = machines.map((machine) => {
      const line = machine.productionLine;
      const department = line.department;
      const building = department.building;
      const factory = building.factory;

      return {
        targetType: "MACHINE" as const,

        targetId: machine.machineId,

        targetCode: machine.machineCode,
        targetName: machine.machineName,

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
          id: line.lineId,
          code: line.lineCode,
          name: line.lineName,
        },
      };
    });

    /**
     * Checkpoint options จริง
     */
    const checkpointTargets = checkpoints.map(
      (checkpoint) => {
        const line = checkpoint.productionLine;
        const department = line.department;
        const building = department.building;
        const factory = building.factory;

        return {
          targetType: "CHECKPOINT" as const,

          targetId: checkpoint.checkpointId,

          targetCode: checkpoint.checkpointCode,
          targetName: checkpoint.checkpointName,

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
            id: line.lineId,
            code: line.lineCode,
            name: line.lineName,
          },
        };
      },
    );

    const targets = [
      ...machineTargets,
      ...checkpointTargets,
    ];

    return NextResponse.json({
      success: true,

      data: cleanedData,

      targets,

      summary: {
        total: cleanedData.length,

        active: cleanedData.filter(
          (item) => item?.status === "ACTIVE",
        ).length,

        suspended: cleanedData.filter(
          (item) => item?.status === "SUSPENDED",
        ).length,

        revoked: cleanedData.filter(
          (item) => item?.status === "REVOKED",
        ).length,

        scans: cleanedData.reduce(
          (sum, item) =>
            sum + (item?.scanCount ?? 0),
          0,
        ),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/company/qr-codes failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "โหลดข้อมูล QR Code ไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}

/**
 * POST
 *
 * สร้าง QR Code จริงลง Database
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์สร้าง QR Code",
        },
        { status: 403 },
      );
    }

    const companyId = session.companyId;

    const body = await request.json();

    const qrCode = String(
      body.qrCode ?? body.code ?? "",
    )
      .trim()
      .toUpperCase();

    const targetType = String(
      body.targetType ?? "",
    ).toUpperCase();

    const targetId = Number(body.targetId);

    const status =
      body.status === "SUSPENDED"
        ? "SUSPENDED"
        : body.status === "REVOKED"
          ? "REVOKED"
          : "ACTIVE";

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุรหัส QR Code",
        },
        { status: 400 },
      );
    }

    if (
      targetType !== "MACHINE" &&
      targetType !== "CHECKPOINT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ประเภทปลายทางต้องเป็น MACHINE หรือ CHECKPOINT",
        },
        { status: 400 },
      );
    }

    if (!targetId) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเลือกปลายทางของ QR Code",
        },
        { status: 400 },
      );
    }

    /**
     * ตรวจ duplicate QR code
     * เฉพาะในบริษัทเดียวกัน
     */
    const duplicate =
      await prisma.qRCode.findFirst({
        where: {
          qrCode,

          OR: [
            {
              machine:
                machineCompanyScope(companyId),
            },
            {
              checkpoint:
                checkpointCompanyScope(companyId),
            },
          ],
        },

        select: {
          qrId: true,
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัส QR Code นี้มีอยู่ในบริษัทแล้ว",
        },
        { status: 409 },
      );
    }

    let machineId: number | null = null;
    let checkpointId: number | null = null;

    /**
     * ตรวจ Machine
     */
    if (targetType === "MACHINE") {
      const machine =
        await prisma.machine.findFirst({
          where: {
            machineId: targetId,
            status: "ACTIVE",

            ...machineCompanyScope(companyId),
          },

          select: {
            machineId: true,
          },
        });

      if (!machine) {
        return NextResponse.json(
          {
            success: false,
            message:
              "ไม่พบเครื่องจักรที่เปิดใช้งานในบริษัทนี้",
          },
          { status: 404 },
        );
      }

      machineId = machine.machineId;
    }

    /**
     * ตรวจ Checkpoint
     */
    if (targetType === "CHECKPOINT") {
      const checkpoint =
        await prisma.checkpoint.findFirst({
          where: {
            checkpointId: targetId,
            status: "ACTIVE",

            ...checkpointCompanyScope(companyId),
          },

          select: {
            checkpointId: true,
          },
        });

      if (!checkpoint) {
        return NextResponse.json(
          {
            success: false,
            message:
              "ไม่พบจุดตรวจที่เปิดใช้งานในบริษัทนี้",
          },
          { status: 404 },
        );
      }

      checkpointId = checkpoint.checkpointId;
    }

    /**
     * Token จริง
     */
    const qrToken = randomUUID();

    const created =
      await prisma.qRCode.create({
        data: {
          machineId,
          checkpointId,

          qrCode,
          qrToken,

          qrStatus: status,

          revokedAt:
            status === "REVOKED"
              ? new Date()
              : null,
        },

        select: {
          qrId: true,
          qrCode: true,
          qrToken: true,
          qrStatus: true,
          generatedAt: true,
          revokedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,

        message: "สร้าง QR Code เรียบร้อยแล้ว",

        data: {
          id: created.qrId.toString(),

          code: created.qrCode,
          token: created.qrToken,

          status: created.qrStatus,

          generatedAt:
            created.generatedAt.toISOString(),

          revokedAt:
            created.revokedAt?.toISOString() ??
            null,

          createdAt:
            created.createdAt.toISOString(),

          updatedAt:
            created.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/company/qr-codes failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "สร้าง QR Code ไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
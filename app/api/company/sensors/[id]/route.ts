import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Context = {
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

async function ownedSensor(sensorId: number, companyId: number) {
  return prisma.sensor.findFirst({
    where: {
      sensorId,
      machine: {
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
    },
    select: {
      sensorId: true,
      machineId: true,
      sensorCode: true,
      _count: {
        select: {
          data: true,
        },
      },
    },
  });
}

export async function PATCH(request: Request, context: Context) {
  try {
    const authResult = await auth();

    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์แก้ไขเซนเซอร์",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;

    const { id } = await context.params;
    const sensorId = Number(id);

    if (!Number.isInteger(sensorId) || sensorId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Sensor ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await ownedSensor(sensorId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบเซนเซอร์ในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const machineId =
      body.machineId === undefined
        ? current.machineId
        : Number(body.machineId);

    if (!Number.isInteger(machineId) || machineId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Machine ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const sensorCode =
      body.sensorCode === undefined
        ? current.sensorCode
        : String(body.sensorCode).trim().toUpperCase();

    if (!sensorCode) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุรหัสเซนเซอร์",
        },
        { status: 400 },
      );
    }

    if (
      body.sensorName !== undefined &&
      !String(body.sensorName).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุชื่อเซนเซอร์",
        },
        { status: 400 },
      );
    }

    if (body.machineId !== undefined) {
      const machine = await prisma.machine.findFirst({
        where: {
          machineId,
          status: "ACTIVE",
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
    }

    if (body.sensorTypeId !== undefined) {
      const sensorTypeId = Number(body.sensorTypeId);

      if (
        !Number.isInteger(sensorTypeId) ||
        sensorTypeId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Sensor Type ไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      const sensorType = await prisma.sensorType.findFirst({
        where: {
          sensorTypeId,
          status: "ACTIVE",
        },
        select: {
          sensorTypeId: true,
        },
      });

      if (!sensorType) {
        return NextResponse.json(
          {
            success: false,
            message:
              "ไม่พบประเภทเซนเซอร์ใน Master Data ของแพลตฟอร์ม",
          },
          { status: 404 },
        );
      }
    }

    if (body.samplingIntervalSeconds !== undefined) {
      const samplingIntervalSeconds =
        body.samplingIntervalSeconds === "" ||
        body.samplingIntervalSeconds === null
          ? null
          : Number(body.samplingIntervalSeconds);

      if (
        samplingIntervalSeconds !== null &&
        (!Number.isInteger(samplingIntervalSeconds) ||
          samplingIntervalSeconds <= 0)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Sampling Interval ต้องเป็นจำนวนเต็มมากกว่า 0",
          },
          { status: 400 },
        );
      }
    }

    const duplicate = await prisma.sensor.findFirst({
      where: {
        machineId,
        sensorCode,
        NOT: {
          sensorId,
        },
      },
      select: {
        sensorId: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสเซนเซอร์นี้มีอยู่ในเครื่องจักรที่เลือกแล้ว",
        },
        { status: 409 },
      );
    }

    await prisma.sensor.update({
      where: {
        sensorId,
      },
      data: {
        ...(body.machineId !== undefined && {
          machineId,
        }),
        ...(body.sensorTypeId !== undefined && {
          sensorTypeId: Number(body.sensorTypeId),
        }),
        ...(body.sensorCode !== undefined && {
          sensorCode,
        }),
        ...(body.sensorName !== undefined && {
          sensorName: String(body.sensorName).trim(),
        }),
        ...(body.serialNumber !== undefined && {
          serialNumber:
            String(body.serialNumber).trim() || null,
        }),
        ...(body.manufacturer !== undefined && {
          manufacturer:
            String(body.manufacturer).trim() || null,
        }),
        ...(body.protocol !== undefined && {
          protocol: String(body.protocol).trim() || null,
        }),
        ...(body.connectionAddress !== undefined && {
          connectionAddress:
            String(body.connectionAddress).trim() || null,
        }),
        ...(body.dataTopic !== undefined && {
          dataTopic: String(body.dataTopic).trim() || null,
        }),
        ...(body.samplingIntervalSeconds !== undefined && {
          samplingIntervalSeconds:
            body.samplingIntervalSeconds === "" ||
            body.samplingIntervalSeconds === null
              ? null
              : Number(body.samplingIntervalSeconds),
        }),
        ...(body.installationDate !== undefined && {
          installationDate: body.installationDate
            ? new Date(`${body.installationDate}T00:00:00`)
            : null,
        }),
        ...(body.lastCalibrationDate !== undefined && {
          lastCalibrationDate: body.lastCalibrationDate
            ? new Date(
                `${body.lastCalibrationDate}T00:00:00`,
              )
            : null,
        }),
        ...(body.nextCalibrationDate !== undefined && {
          nextCalibrationDate: body.nextCalibrationDate
            ? new Date(
                `${body.nextCalibrationDate}T00:00:00`,
              )
            : null,
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
      message: "บันทึกข้อมูลเซนเซอร์เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "PATCH /api/company/sensors/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "แก้ไขเซนเซอร์ไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: Context,
) {
  try {
    const authResult = await auth();

    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์ลบเซนเซอร์",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;

    const { id } = await context.params;
    const sensorId = Number(id);

    if (!Number.isInteger(sensorId) || sensorId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Sensor ID ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await ownedSensor(sensorId, companyId);

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบเซนเซอร์ในบริษัทนี้",
        },
        { status: 404 },
      );
    }

    if (current._count.data > 0) {
      await prisma.sensor.update({
        where: {
          sensorId,
        },
        data: {
          status: "INACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "เซนเซอร์มีประวัติ Sensor Data ระบบจึงปิดใช้งานแทนการลบ",
      });
    }

    await prisma.sensor.delete({
      where: {
        sensorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบเซนเซอร์เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "DELETE /api/company/sensors/[id] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ลบเซนเซอร์ไม่สำเร็จ",
      },
      { status: 500 },
    );
  }
}
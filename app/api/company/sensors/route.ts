import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function auth() {
  const session = await getSession();
  if (!session || session.roleName !== "COMPANY_ADMIN" || !session.companyId) return null;
  return session;
}

const scope = (companyId: number) => ({
  machine: {
    productionLine: {
      department: {
        building: {
          factory: { companyId },
        },
      },
    },
  },
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูลเซนเซอร์" }, { status: 403 });
    }

    const [sensors, machines, sensorTypes] = await Promise.all([
      prisma.sensor.findMany({
        where: scope(session.companyId),
        orderBy: [{ status: "asc" }, { sensorName: "asc" }],
        include: {
          sensorType: true,
          machine: {
            include: {
              machineType: true,
              productionLine: {
                include: {
                  department: {
                    include: {
                      building: {
                        include: { factory: true },
                      },
                    },
                  },
                },
              },
            },
          },
          data: {
            orderBy: { measuredAt: "desc" },
            take: 1,
            include: { unit: true },
          },
        },
      }),

      prisma.machine.findMany({
        where: {
          productionLine: {
            department: {
              building: {
                factory: { companyId: session.companyId },
              },
            },
          },
          status: "ACTIVE",
        },
        orderBy: { machineName: "asc" },
        include: {
          machineType: true,
          productionLine: {
            include: {
              department: {
                include: {
                  building: {
                    include: { factory: true },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.sensorType.findMany({
        where: { status: "ACTIVE" },
        orderBy: { sensorTypeName: "asc" },
      }),
    ]);

    const data = sensors.map((sensor) => {
      const latest = sensor.data[0] ?? null;
      const line = sensor.machine.productionLine;
      const department = line.department;
      const building = department.building;
      const factory = building.factory;

      let connectionStatus: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "FAULT" = "OFFLINE";

      if (sensor.status === "INACTIVE") {
        connectionStatus = "MAINTENANCE";
      } else if (latest && latest.qualityStatus !== "VALID") {
        connectionStatus = "FAULT";
      } else if (sensor.lastConnectedAt) {
        const diffMs = Date.now() - new Date(sensor.lastConnectedAt).getTime();
        const thresholdSeconds =
          sensor.samplingIntervalSeconds && sensor.samplingIntervalSeconds > 0
            ? Math.max(sensor.samplingIntervalSeconds * 3, 300)
            : 900;
        connectionStatus = diffMs <= thresholdSeconds * 1000 ? "ONLINE" : "OFFLINE";
      }

      return {
        id: sensor.sensorId,
        code: sensor.sensorCode,
        name: sensor.sensorName,
        serialNumber: sensor.serialNumber,
        manufacturer: sensor.manufacturer,
        protocol: sensor.protocol,
        connectionAddress: sensor.connectionAddress,
        dataTopic: sensor.dataTopic,
        samplingIntervalSeconds: sensor.samplingIntervalSeconds,
        lastConnectedAt: sensor.lastConnectedAt,
        installationDate: sensor.installationDate,
        lastCalibrationDate: sensor.lastCalibrationDate,
        nextCalibrationDate: sensor.nextCalibrationDate,
        status: sensor.status,
        connectionStatus,

        type: {
          id: sensor.sensorType.sensorTypeId,
          code: sensor.sensorType.sensorTypeCode,
          name: sensor.sensorType.sensorTypeName,
        },

        machine: {
          id: sensor.machine.machineId,
          code: sensor.machine.machineCode,
          name: sensor.machine.machineName,
          type: sensor.machine.machineType.machineTypeName,
        },

        productionLine: {
          id: line.lineId,
          code: line.lineCode,
          name: line.lineName,
        },

        department: {
          id: department.departmentId,
          code: department.departmentCode,
          name: department.departmentName,
        },

        building: {
          id: building.buildingId,
          code: building.buildingCode,
          name: building.buildingName,
        },

        factory: {
          id: factory.factoryId,
          code: factory.factoryCode,
          name: factory.factoryName,
        },

        latestData: latest
          ? {
              id: latest.sensorDataId.toString(),
              rawValue: latest.rawValue.toString(),
              processedValue: latest.processedValue?.toString() ?? null,
              qualityStatus: latest.qualityStatus,
              measuredAt: latest.measuredAt,
              receivedAt: latest.receivedAt,
              unit: {
                id: latest.unit.unitId,
                code: latest.unit.unitCode,
                name: latest.unit.unitName,
                symbol: latest.unit.symbol,
              },
            }
          : null,
      };
    });

    const machineOptions = machines.map((machine) => {
      const line = machine.productionLine;
      const department = line.department;
      const building = department.building;
      const factory = building.factory;

      return {
        id: machine.machineId,
        code: machine.machineCode,
        name: machine.machineName,
        machineType: {
          id: machine.machineType.machineTypeId,
          code: machine.machineType.machineTypeCode,
          name: machine.machineType.machineTypeName,
        },
        productionLine: { id: line.lineId, code: line.lineCode, name: line.lineName },
        department: { id: department.departmentId, code: department.departmentCode, name: department.departmentName },
        building: { id: building.buildingId, code: building.buildingCode, name: building.buildingName },
        factory: { id: factory.factoryId, code: factory.factoryCode, name: factory.factoryName },
      };
    });

    const typeOptions = sensorTypes.map((type) => ({
      id: type.sensorTypeId,
      code: type.sensorTypeCode,
      name: type.sensorTypeName,
      description: type.description,
    }));

    return NextResponse.json({
      success: true,
      data,
      machines: machineOptions,
      sensorTypes: typeOptions,
      summary: {
        total: data.length,
        online: data.filter((sensor) => sensor.connectionStatus === "ONLINE").length,
        offline: data.filter((sensor) => sensor.connectionStatus === "OFFLINE").length,
        maintenance: data.filter((sensor) => sensor.connectionStatus === "MAINTENANCE").length,
        fault: data.filter((sensor) => sensor.connectionStatus === "FAULT").length,
      },
    });
  } catch (error) {
    console.error("GET /api/company/sensors failed:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลเซนเซอร์ได้" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "ไม่มีสิทธิ์เพิ่มเซนเซอร์" }, { status: 403 });
    }

    const body = await request.json();

    const machineId = Number(body.machineId);
    const sensorTypeId = Number(body.sensorTypeId);
    const sensorCode = String(body.sensorCode ?? "").trim().toUpperCase();
    const sensorName = String(body.sensorName ?? "").trim();

    if (!machineId || !sensorTypeId || !sensorCode || !sensorName) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุเครื่องจักร ประเภทเซนเซอร์ รหัส และชื่อเซนเซอร์" },
        { status: 400 },
      );
    }

    const machine = await prisma.machine.findFirst({
      where: {
        machineId,
        productionLine: {
          department: {
            building: {
              factory: { companyId: session.companyId },
            },
          },
        },
      },
      select: { machineId: true, status: true },
    });

    if (!machine) {
      return NextResponse.json({ success: false, message: "ไม่พบเครื่องจักรในบริษัทนี้" }, { status: 404 });
    }

    if (machine.status !== "ACTIVE") {
      return NextResponse.json({ success: false, message: "เครื่องจักรที่เลือกถูกปิดใช้งาน" }, { status: 400 });
    }

    const sensorType = await prisma.sensorType.findFirst({
      where: { sensorTypeId, status: "ACTIVE" },
      select: { sensorTypeId: true },
    });

    if (!sensorType) {
      return NextResponse.json(
        { success: false, message: "ไม่พบประเภทเซนเซอร์ใน Master Data ของแพลตฟอร์ม" },
        { status: 404 },
      );
    }

    const duplicate = await prisma.sensor.findFirst({
      where: { machineId, sensorCode },
      select: { sensorId: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "รหัสเซนเซอร์นี้มีอยู่ในเครื่องจักรที่เลือกแล้ว" },
        { status: 409 },
      );
    }

    const created = await prisma.sensor.create({
      data: {
        machineId,
        sensorTypeId,
        sensorCode,
        sensorName,
        serialNumber: String(body.serialNumber ?? "").trim() || null,
        manufacturer: String(body.manufacturer ?? "").trim() || null,
        protocol: String(body.protocol ?? "").trim() || null,
        connectionAddress: String(body.connectionAddress ?? "").trim() || null,
        dataTopic: String(body.dataTopic ?? "").trim() || null,
        samplingIntervalSeconds:
          body.samplingIntervalSeconds === "" ||
          body.samplingIntervalSeconds === null ||
          body.samplingIntervalSeconds === undefined
            ? null
            : Number(body.samplingIntervalSeconds),
        installationDate: body.installationDate ? new Date(`${body.installationDate}T00:00:00`) : null,
        lastCalibrationDate: body.lastCalibrationDate ? new Date(`${body.lastCalibrationDate}T00:00:00`) : null,
        nextCalibrationDate: body.nextCalibrationDate ? new Date(`${body.nextCalibrationDate}T00:00:00`) : null,
        status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      },
      select: { sensorId: true },
    });

    return NextResponse.json(
      { success: true, message: "เพิ่มเซนเซอร์เรียบร้อยแล้ว", data: { id: created.sensorId } },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/company/sensors failed:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "ไม่สามารถเพิ่มเซนเซอร์ได้" },
      { status: 500 },
    );
  }
}
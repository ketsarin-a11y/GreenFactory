import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type CreateFactoryBody = {
  factoryCode?: string;
  factoryName?: string;
  address?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  googleMapUrl?: string;
  mapZoom?: number | null;
  phone?: string;
  email?: string;
  timezone?: string;
};

async function requireCompanyAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      ),
    };
  }

  if (session.roleName !== "COMPANY_ADMIN" || !session.companyId) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์จัดการข้อมูลโรงงาน" },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, session };
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  try {
    const auth = await requireCompanyAdmin();
    if (!auth.ok) return auth.response;

    const companyId = auth.session.companyId;

    const factories = await prisma.factory.findMany({
      where: { companyId },
      orderBy: [{ status: "asc" }, { factoryName: "asc" }],
      select: {
        factoryId: true,
        factoryCode: true,
        factoryName: true,
        address: true,
        province: true,
        postalCode: true,
        country: true,
        latitude: true,
        longitude: true,
        googleMapUrl: true,
        mapZoom: true,
        layoutImagePath: true,
        phone: true,
        email: true,
        timezone: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            buildings: true,
            users: true,
          },
        },
        buildings: {
          select: {
            buildingId: true,
            departments: {
              select: {
                departmentId: true,
                productionLines: {
                  select: {
                    lineId: true,
                    machines: {
                      select: {
                        machineId: true,
                        sensors: { select: { sensorId: true } },
                        qrCodes: { select: { qrId: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const data = factories.map((factory) => {
      let departments = 0;
      let productionLines = 0;
      let machines = 0;
      let sensors = 0;
      let qrCodes = 0;

      for (const building of factory.buildings) {
        departments += building.departments.length;

        for (const department of building.departments) {
          productionLines += department.productionLines.length;

          for (const line of department.productionLines) {
            machines += line.machines.length;

            for (const machine of line.machines) {
              sensors += machine.sensors.length;
              qrCodes += machine.qrCodes.length;
            }
          }
        }
      }

      const hasLocation = factory.latitude !== null && factory.longitude !== null;

      const checks = [
        Boolean(factory.factoryCode?.trim()),
        Boolean(factory.factoryName?.trim()),
        Boolean(factory.address?.trim()),
        Boolean(factory.province?.trim()),
        Boolean(factory.phone || factory.email),
        hasLocation || Boolean(factory.googleMapUrl),
        factory._count.buildings > 0,
        departments > 0,
        productionLines > 0,
      ];

      const readiness = Math.round(
        (checks.filter(Boolean).length / checks.length) * 100,
      );

      return {
        id: factory.factoryId,
        code: factory.factoryCode,
        name: factory.factoryName,
        status: factory.status,
        address: factory.address,
        province: factory.province,
        postalCode: factory.postalCode,
        country: factory.country,
        latitude: factory.latitude === null ? null : Number(factory.latitude),
        longitude: factory.longitude === null ? null : Number(factory.longitude),
        googleMapUrl: factory.googleMapUrl,
        mapZoom: factory.mapZoom,
        layoutImagePath: factory.layoutImagePath,
        phone: factory.phone,
        email: factory.email,
        timezone: factory.timezone,
        createdAt: factory.createdAt,
        buildings: factory._count.buildings,
        users: factory._count.users,
        departments,
        productionLines,
        machines,
        sensors,
        qrCodes,
        hasLocation,
        structureReady:
          factory._count.buildings > 0 && departments > 0 && productionLines > 0,
        readiness,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      summary: {
        total: data.length,
        active: data.filter((factory) => factory.status === "ACTIVE").length,
        ready: data.filter((factory) => factory.readiness >= 75).length,
        users: data.reduce((sum, factory) => sum + factory.users, 0),
      },
    });
  } catch (error) {
    console.error("GET /api/company/factories failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลโรงงานได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireCompanyAdmin();
    if (!auth.ok) return auth.response;

    const companyId = auth.session.companyId;
    const body = (await request.json()) as CreateFactoryBody;

    const factoryCode = body.factoryCode?.trim().toUpperCase() ?? "";
    const factoryName = body.factoryName?.trim() ?? "";

    if (!factoryCode || !factoryName) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกรหัสโรงงานและชื่อโรงงาน" },
        { status: 400 },
      );
    }

    const duplicate = await prisma.factory.findFirst({
      where: { companyId, factoryCode },
      select: { factoryId: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "รหัสโรงงานนี้มีอยู่ในบริษัทแล้ว" },
        { status: 409 },
      );
    }

    const latitude = toNumber(body.latitude);
    const longitude = toNumber(body.longitude);

    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      return NextResponse.json(
        { success: false, message: "Latitude ต้องอยู่ระหว่าง -90 ถึง 90" },
        { status: 400 },
      );
    }

    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      return NextResponse.json(
        { success: false, message: "Longitude ต้องอยู่ระหว่าง -180 ถึง 180" },
        { status: 400 },
      );
    }

    const created = await prisma.factory.create({
      data: {
        companyId,
        factoryCode,
        factoryName,
        address: body.address?.trim() || null,
        province: body.province?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
        country: body.country?.trim() || "Thailand",
        latitude,
        longitude,
        googleMapUrl: body.googleMapUrl?.trim() || null,
        mapZoom: body.mapZoom ?? 16,
        phone: body.phone?.trim() || null,
        email: body.email?.trim().toLowerCase() || null,
        timezone: body.timezone?.trim() || "Asia/Bangkok",
        status: "ACTIVE",
      },
      select: { factoryId: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มโรงงานเรียบร้อยแล้ว",
        data: { id: created.factoryId },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/company/factories failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "ไม่สามารถเพิ่มโรงงานได้",
      },
      { status: 500 },
    );
  }
}

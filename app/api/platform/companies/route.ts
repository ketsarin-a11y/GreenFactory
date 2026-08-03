import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["ACTIVE", "PENDING", "SUSPENDED"] as const;
const ALLOWED_PLANS = ["TRIAL", "STANDARD", "ENTERPRISE"] as const;

function normalizeStatus(value: string | null | undefined) {
  return ALLOWED_STATUSES.includes(value as (typeof ALLOWED_STATUSES)[number])
    ? (value as (typeof ALLOWED_STATUSES)[number])
    : "ACTIVE";
}

function normalizePlan(value: string | null | undefined) {
  return ALLOWED_PLANS.includes(value as (typeof ALLOWED_PLANS)[number])
    ? (value as (typeof ALLOWED_PLANS)[number])
    : "TRIAL";
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "ALL";
    const industry = searchParams.get("industry")?.trim() ?? "ALL";

    const requestedPage = Number(searchParams.get("page") ?? "1");
    const requestedPageSize = Number(searchParams.get("pageSize") ?? "8");

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const pageSize =
      Number.isInteger(requestedPageSize) &&
      requestedPageSize > 0 &&
      requestedPageSize <= 100
        ? requestedPageSize
        : 8;

    const where = {
      AND: [
        search
          ? {
              OR: [
                {
                  companyCode: {
                    contains: search,
                  },
                },
                {
                  companyName: {
                    contains: search,
                  },
                },
                {
                  email: {
                    contains: search,
                  },
                },
                {
                  phone: {
                    contains: search,
                  },
                },
                {
                  province: {
                    contains: search,
                  },
                },
                {
                  industryType: {
                    contains: search,
                  },
                },
                {
                  users: {
                    some: {
                      OR: [
                        {
                          firstName: {
                            contains: search,
                          },
                        },
                        {
                          lastName: {
                            contains: search,
                          },
                        },
                        {
                          email: {
                            contains: search,
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }
          : {},
        status !== "ALL"
          ? {
              status,
            }
          : {},
        industry !== "ALL"
          ? {
              industryType: industry,
            }
          : {},
      ],
    };

    const [
      companies,
      totalItems,
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      suspendedCompanies,
      totalFactories,
      totalUsers,
      totalMachines,
      totalSensors,
    ] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          companyId: true,
          companyCode: true,
          companyName: true,
          industryType: true,
          province: true,
          phone: true,
          email: true,
          logoPath: true,
          subscriptionPlan: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          users: {
            orderBy: [{ lastLogin: "desc" }, { createdAt: "asc" }],
            take: 1,
            select: {
              firstName: true,
              lastName: true,
              lastLogin: true,
            },
          },

          _count: {
            select: {
              factories: true,
              users: true,
            },
          },
        },
      }),

      prisma.company.count({ where }),
      prisma.company.count(),
      prisma.company.count({ where: { status: "ACTIVE" } }),
      prisma.company.count({ where: { status: "PENDING" } }),
      prisma.company.count({ where: { status: "SUSPENDED" } }),
      prisma.factory.count(),
      prisma.user.count({ where: { companyId: { not: null } } }),
      prisma.machine.count(),
      prisma.sensor.count(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    return NextResponse.json({
      success: true,
      data: companies.map((company) => {
        const primaryUser = company.users[0];

        return {
          id: company.companyId,
          code: company.companyCode,
          name: company.companyName,
          email: company.email ?? "",
          phone: company.phone ?? "",
          province: company.province ?? "",
          industry: company.industryType ?? "ไม่ระบุ",
          contactName: primaryUser
            ? `${primaryUser.firstName} ${primaryUser.lastName}`.trim()
            : "ยังไม่ได้กำหนด",
          status: normalizeStatus(company.status),
          plan: normalizePlan(company.subscriptionPlan),
          factories: company._count.factories,
          users: company._count.users,

          // ตอนนี้ schema ไม่มี direct relation Company -> Machine/Sensor
          // จะแสดง 0 ต่อบริษัทก่อน และใช้ยอดรวมจริงใน Summary
          machines: 0,
          sensors: 0,

          alerts: 0,
          storageUsedGb: 0,
          storageLimitGb: 0,

          registeredAt: formatDateTime(company.createdAt),
          lastActivityAt: formatDateTime(
            primaryUser?.lastLogin ?? company.updatedAt,
          ),
          logoUrl: company.logoPath,
        };
      }),
      summary: {
        totalCompanies,
        activeCompanies,
        pendingCompanies,
        suspendedCompanies,
        totalFactories,
        totalUsers,
        totalMachines,
        totalSensors,

        // ยังไม่มี Alert model ใน schema ที่ส่งมา
        unresolvedAlerts: 0,
      },
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get companies error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลบริษัทได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const companyCode =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : "";

    const companyName =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const province =
      typeof body.province === "string"
        ? body.province.trim()
        : "";

    const industryType =
      typeof body.industry === "string"
        ? body.industry.trim()
        : "";

    const subscriptionPlan = normalizePlan(
      typeof body.plan === "string" ? body.plan : null,
    );

    if (!companyCode || !companyName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัส ชื่อบริษัท และอีเมลให้ครบ",
        },
        { status: 400 },
      );
    }

    const duplicate = await prisma.company.findFirst({
      where: {
        OR: [
          {
            companyCode,
          },
          {
            email,
          },
        ],
      },
      select: {
        companyId: true,
        companyCode: true,
        email: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            duplicate.companyCode === companyCode
              ? "รหัสบริษัทนี้มีอยู่แล้ว"
              : "อีเมลบริษัทนี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const company = await prisma.company.create({
      data: {
        companyCode,
        companyName,
        email,
        phone: phone || null,
        province: province || null,
        industryType: industryType || null,
        subscriptionPlan,

        country: "Thailand",
        timezone: "Asia/Bangkok",
        currency: "THB",
        language: "th",
        carbonStandard: "TGO",
        status: "ACTIVE",
      },
      select: {
        companyId: true,
        companyCode: true,
        companyName: true,
        email: true,
        phone: true,
        province: true,
        industryType: true,
        subscriptionPlan: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มบริษัทเรียบร้อยแล้ว",
        data: {
          id: company.companyId,
          code: company.companyCode,
          name: company.companyName,
          email: company.email ?? "",
          phone: company.phone ?? "",
          province: company.province ?? "",
          industry: company.industryType ?? "ไม่ระบุ",
          contactName:
            typeof body.contactName === "string" &&
            body.contactName.trim()
              ? body.contactName.trim()
              : "ยังไม่ได้กำหนด",
          status: normalizeStatus(company.status),
          plan: normalizePlan(company.subscriptionPlan),
          factories: 0,
          users: 0,
          machines: 0,
          sensors: 0,
          alerts: 0,
          storageUsedGb: 0,
          storageLimitGb: 0,
          registeredAt: formatDateTime(company.createdAt),
          lastActivityAt: formatDateTime(company.createdAt),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create company error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มบริษัทได้",
      },
      { status: 500 },
    );
  }
}

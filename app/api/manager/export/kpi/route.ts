import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function isValidDateInput(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00`))
  );
}

function formatDate(value: Date | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบ",
        },
        { status: 401 }
      );
    }

    if (session.roleName !== "MANAGER") {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
        },
        { status: 403 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลบริษัทของผู้ใช้งาน",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const today = new Date().toISOString().slice(0, 10);

    const from = searchParams.get("from") ?? today;
    const to = searchParams.get("to") ?? today;

    if (!isValidDateInput(from) || !isValidDateInput(to)) {
      return NextResponse.json(
        {
          success: false,
          message: "รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD",
        },
        { status: 400 }
      );
    }

    if (from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด",
        },
        { status: 400 }
      );
    }

    const startDate = new Date(`${from}T00:00:00`);
    const endDate = new Date(`${to}T23:59:59.999`);

    const kpis = await prisma.kPI.findMany({
      where: {
        companyId: session.companyId,
        status: "ACTIVE",
        effectiveFrom: {
          lte: endDate,
        },
        OR: [
          {
            effectiveTo: null,
          },
          {
            effectiveTo: {
              gte: startDate,
            },
          },
        ],
      },
      include: {
        factory: {
          select: {
            factoryName: true,
          },
        },
        building: {
          select: {
            buildingName: true,
          },
        },
        department: {
          select: {
            departmentName: true,
          },
        },
        productionLine: {
          select: {
            lineName: true,
          },
        },
        machine: {
          select: {
            machineName: true,
            machineCode: true,
          },
        },
        resourceType: {
          select: {
            resourceName: true,
            resourceCode: true,
          },
        },
        unit: {
          select: {
            symbol: true,
            unitName: true,
          },
        },
        results: {
          where: {
            periodStart: {
              lte: endDate,
            },
            periodEnd: {
              gte: startDate,
            },
          },
          orderBy: [
            {
              periodStart: "desc",
            },
            {
              periodEnd: "desc",
            },
          ],
        },
      },
      orderBy: [
        {
          kpiType: "asc",
        },
        {
          kpiName: "asc",
        },
      ],
    });

    const headers = [
      "รหัส KPI",
      "ชื่อ KPI",
      "ประเภท KPI",
      "ขอบเขต",
      "โรงงาน",
      "อาคาร",
      "แผนก",
      "ไลน์การผลิต",
      "เครื่องจักร",
      "รหัสเครื่อง",
      "ประเภททรัพยากร",
      "เป้าหมาย",
      "เงื่อนไขเป้าหมาย",
      "หน่วย",
      "รอบการประเมิน",
      "วันที่เริ่มใช้ KPI",
      "วันที่สิ้นสุด KPI",
      "ช่วงผลลัพธ์เริ่มต้น",
      "ช่วงผลลัพธ์สิ้นสุด",
      "ค่าจริง",
      "ค่าความแปรปรวน",
      "ผลสำเร็จ (%)",
      "สถานะผลลัพธ์",
    ];

    const rows: string[][] = [];

    for (const kpi of kpis) {
      const baseColumns = [
        kpi.kpiCode,
        kpi.kpiName,
        kpi.kpiType,
        kpi.scopeType,
        kpi.factory?.factoryName ?? "",
        kpi.building?.buildingName ?? "",
        kpi.department?.departmentName ?? "",
        kpi.productionLine?.lineName ?? "",
        kpi.machine?.machineName ?? "",
        kpi.machine?.machineCode ?? "",
        kpi.resourceType?.resourceName ?? "",
        String(kpi.targetValue),
        kpi.targetOperator,
        kpi.unit.symbol || kpi.unit.unitName,
        kpi.periodType,
        formatDate(kpi.effectiveFrom),
        formatDate(kpi.effectiveTo),
      ];

      if (kpi.results.length === 0) {
        rows.push([
          ...baseColumns,
          "",
          "",
          "",
          "",
          "",
          "ยังไม่มีผลลัพธ์ในช่วงเวลาที่เลือก",
        ]);

        continue;
      }

      for (const result of kpi.results) {
        rows.push([
          ...baseColumns,
          formatDate(result.periodStart),
          formatDate(result.periodEnd),
          String(result.actualValue),
          String(result.varianceValue),
          String(result.achievementPercent),
          result.resultStatus,
        ]);
      }
    }

    const title = [`รายงาน KPI ${from} ถึง ${to}`];

    const summary = [
      ["จำนวน KPI ที่พบ", String(kpis.length)],
      ["จำนวนผลลัพธ์ KPI", String(kpis.reduce((sum, kpi) => sum + kpi.results.length, 0))],
    ];

    const noDataRow =
      rows.length === 0
        ? [["ไม่พบข้อมูล KPI ในช่วงเวลาที่เลือก"]]
        : [];

    const csv =
      "\uFEFF" +
      [
        title,
        [],
        ...summary,
        [],
        headers,
        ...rows,
        ...noDataRow,
      ]
        .map((row) =>
          row.map((cell) => csvEscape(String(cell))).join(",")
        )
        .join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="greenfactory-kpi-${from}-${to}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("KPI export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถสร้างรายงาน KPI ได้",
      },
      { status: 500 }
    );
  }
}

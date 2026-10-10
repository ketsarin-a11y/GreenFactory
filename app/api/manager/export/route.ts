import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getAllHistoryRecords } from "@/lib/History queries";
import { ENERGY_TYPES, WATER_TYPES } from "@/lib/manager queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["energy", "water", "waste", "all"] as const;
type ExportType = (typeof VALID_TYPES)[number];

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
          message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
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

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const rawType = searchParams.get("type") ?? "all";

    if (
      from &&
      (!isValidDateInput(from) || (to && isValidDateInput(to) && from > to))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ช่วงวันที่ไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    if (to && !isValidDateInput(to)) {
      return NextResponse.json(
        {
          success: false,
          message: "รูปแบบวันที่สิ้นสุดไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(rawType as ExportType)) {
      return NextResponse.json(
        {
          success: false,
          message: "ประเภทรายงานไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    const type = rawType as ExportType;

    /*
     * Waste ไม่ hardcode resource code รายตัว
     * แต่ดึง Resource Type ทั้งหมดที่อยู่ใน Master Data category = WASTE
     * เพื่อให้ Waste ประเภทใหม่ในอนาคตถูกนำเข้า report อัตโนมัติ
     */
    const wasteResourceTypes =
      type === "waste"
        ? await prisma.resourceTypeMaster.findMany({
            where: {
              status: "ACTIVE",
              category: {
                categoryCode: "WASTE",
                status: "ACTIVE",
              },
            },
            select: {
              resourceCode: true,
            },
          })
        : [];

    const wasteCodes = new Set(
      wasteResourceTypes.map((resource) => resource.resourceCode)
    );

    const records = await getAllHistoryRecords(session.companyId);

    const filtered = records.filter((record) => {
      const day = record.recordedAt.slice(0, 10);

      if (from && day < from) {
        return false;
      }

      if (to && day > to) {
        return false;
      }

      if (
        type === "energy" &&
        !ENERGY_TYPES.includes(
          record.resourceType as (typeof ENERGY_TYPES)[number]
        )
      ) {
        return false;
      }

      if (
        type === "water" &&
        !WATER_TYPES.includes(
          record.resourceType as (typeof WATER_TYPES)[number]
        )
      ) {
        return false;
      }

      if (type === "waste" && !wasteCodes.has(record.resourceType)) {
        return false;
      }

      return true;
    });

    const headers = [
      "วันที่และเวลา",
      "เครื่องจักร",
      "รหัสเครื่อง",
      "ประเภทเครื่องจักร",
      "ไลน์การผลิต",
      "แผนก",
      "ประเภททรัพยากร",
      "หน่วยวัด",
      "ปริมาณที่ใช้",
      "ผู้บันทึก",
      "สถานะ",
      "หมายเหตุ",
    ];

    const rows = filtered.map((record) => [
      new Date(record.recordedAt).toLocaleString("th-TH"),
      record.equipmentName,
      record.equipmentCode ?? "",
      record.equipmentType ?? "",
      record.productionLine ?? "",
      record.department ?? "",
      record.resourceLabel,
      record.unit,
      String(record.value),
      record.recordedByName,
      record.status === "RECORDED" ? "บันทึกแล้ว" : "รออนุมัติ",
      record.note ?? "",
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
        .join("\n");

    const typeName: Record<ExportType, string> = {
      energy: "energy",
      water: "water",
      waste: "waste",
      all: "all-resources",
    };

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="greenfactory-${typeName[type]}-${from ?? "all"}-${to ?? "all"}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Manager CSV export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถส่งออกรายงานได้",
      },
      { status: 500 }
    );
  }
}

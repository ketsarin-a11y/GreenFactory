import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getAllHistoryRecords } from "@/lib/History queries";
import { ENERGY_TYPES, WATER_TYPES } from "@/lib/manager queries";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export async function GET(request: NextRequest) {
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
  const type = searchParams.get("type") ?? "all";

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

  // เติม BOM เพื่อให้ Excel แสดงภาษาไทยถูกต้อง
  const csv =
    "\uFEFF" +
    [headers, ...rows]
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="greenfactory-records-${from ?? "all"}-${to ?? "all"}.csv"`,
    },
  });
}
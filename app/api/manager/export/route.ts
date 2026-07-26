import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type") ?? "all"; // "energy" | "water" | "all"

  const records = await getAllHistoryRecords(user.companyId);
  const filtered = records.filter((r) => {
    const day = r.recordedAt.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (type === "energy" && !ENERGY_TYPES.includes(r.resourceType as (typeof ENERGY_TYPES)[number])) return false;
    if (type === "water" && !WATER_TYPES.includes(r.resourceType as (typeof WATER_TYPES)[number])) return false;
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

  const rows = filtered.map((r) => [
    new Date(r.recordedAt).toLocaleString("th-TH"),
    r.equipmentName,
    r.equipmentCode ?? "",
    r.equipmentType ?? "",
    r.productionLine ?? "",
    r.department ?? "",
    r.resourceLabel,
    r.unit,
    String(r.value),
    r.recordedByName,
    r.status === "RECORDED" ? "บันทึกแล้ว" : "รออนุมัติ",
    r.note ?? "",
  ]);

  // เติม BOM ให้ Excel เปิดภาษาไทยไม่เพี้ยน
  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="greenfactory-records-${from ?? "all"}-${to ?? "all"}.csv"`,
    },
  });
}
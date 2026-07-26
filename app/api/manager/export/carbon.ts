import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCarbonFootprint } from "@/lib/manager queries";
import { RESOURCE_META } from "@/lib/resource-meta";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? new Date().toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);

  const data = await getCarbonFootprint(user.companyId, new Date(`${from}T00:00:00`), new Date(`${to}T00:00:00`));

  const noteLine = [
    "หมายเหตุ: ตัวคูณการปล่อยคาร์บอนเป็นค่าประมาณการทั่วไป ไม่ใช่ค่าที่บริษัทยืนยันอย่างเป็นทางการ ห้ามใช้อ้างอิงในรายงาน audit จริง",
  ];
  const headers = ["ประเภททรัพยากร", "Scope", "ปริมาณการใช้", "หน่วย", "Carbon (kgCO2e)", "สัดส่วน (%)"];
  const rows = data.breakdown.map((item) => [
    RESOURCE_META[item.resourceType]?.label ?? item.resourceType,
    item.scope,
    String(item.usageValue),
    item.unit,
    String(item.carbonKg),
    String(item.percent),
  ]);
  const totalRow = ["รวมทั้งหมด", "", "", "", String(data.totalKgCO2e), "100"];

  const csv =
    "\uFEFF" +
    [noteLine, [], headers, ...rows, [], totalRow].map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="greenfactory-carbon-${from}-${to}.csv"`,
    },
  });
}
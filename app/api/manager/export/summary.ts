import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { computeResourceMetrics, getCarbonFootprint, ENERGY_TYPES, WATER_TYPES } from "@/lib/manager queries";

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
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  const [energy, water, carbon] = await Promise.all([
    computeResourceMetrics(user.companyId, ENERGY_TYPES, start, end, "kWh"),
    computeResourceMetrics(user.companyId, WATER_TYPES, start, end, "m³"),
    getCarbonFootprint(user.companyId, start, end),
  ]);

  const headers = ["ตัวชี้วัด", "ยอดรวม", "หน่วย", "% เปลี่ยนแปลงจากช่วงก่อนหน้า"];
  const rows = [
    ["การใช้พลังงานรวม", String(energy.total), energy.unit, `${energy.changePct}%`],
    ["การใช้น้ำรวม", String(water.total), water.unit, `${water.changePct}%`],
    ["Carbon Footprint (ประมาณการ)", String(carbon.totalKgCO2e), "kgCO2e", `${carbon.changePct}%`],
  ];

  const deptHeaders = ["แผนก", "พลังงาน (kWh)", "สัดส่วน (%)"];
  const deptRows = energy.breakdown.map((d) => [d.department, String(d.value), String(d.percent)]);

  const csv =
    "\uFEFF" +
    [
      [`รายงานสรุปผู้บริหาร ${from} ถึง ${to}`],
      [],
      headers,
      ...rows,
      [],
      ["การใช้พลังงานแยกตามแผนก"],
      deptHeaders,
      ...deptRows,
    ]
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="greenfactory-executive-summary-${from}-${to}.csv"`,
    },
  });
}
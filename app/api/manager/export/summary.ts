import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { computeResourceMetrics, getCarbonFootprint, ENERGY_TYPES, WATER_TYPES } from "@/lib/manager queries";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "เธเธฃเธธเธ“เธฒเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? new Date().toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  const [energy, water, carbon] = await Promise.all([
    computeResourceMetrics(session.companyId!, ENERGY_TYPES, start, end, "kWh"),
    computeResourceMetrics(session.companyId!, WATER_TYPES, start, end, "m³"),
    getCarbonFootprint(session.companyId!, start, end),
  ]);

  const headers = ["เธ•เธฑเธงเธเธตเนเธงเธฑเธ”", "เธขเธญเธ”เธฃเธงเธก", "เธซเธเนเธงเธข", "% เน€เธเธฅเธตเนเธขเธเนเธเธฅเธเธเธฒเธเธเนเธงเธเธเนเธญเธเธซเธเนเธฒ"];
  const rows = [
    ["เธเธฒเธฃเนเธเนเธเธฅเธฑเธเธเธฒเธเธฃเธงเธก", String(energy.total), energy.unit, `${energy.changePct}%`],
    ["เธเธฒเธฃเนเธเนเธเนเธณเธฃเธงเธก", String(water.total), water.unit, `${water.changePct}%`],
    ["Carbon Footprint (เธเธฃเธฐเธกเธฒเธ“เธเธฒเธฃ)", String(carbon.totalKgCO2e), "kgCO2e", `${carbon.changePct}%`],
  ];

  const deptHeaders = ["เนเธเธเธ", "เธเธฅเธฑเธเธเธฒเธ (kWh)", "เธชเธฑเธ”เธชเนเธงเธ (%)"];
  const deptRows = energy.breakdown.map((d) => [d.department, String(d.value), String(d.percent)]);

  const csv =
    "\uFEFF" +
    [
      [`เธฃเธฒเธขเธเธฒเธเธชเธฃเธธเธเธเธนเนเธเธฃเธดเธซเธฒเธฃ ${from} เธ–เธถเธ ${to}`],
      [],
      headers,
      ...rows,
      [],
      ["เธเธฒเธฃเนเธเนเธเธฅเธฑเธเธเธฒเธเนเธขเธเธ•เธฒเธกเนเธเธเธ"],
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



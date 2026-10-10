import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  computeResourceMetrics,
  getCarbonFootprint,
  ENERGY_TYPES,
  WATER_TYPES,
} from "@/lib/manager queries";
import { getAllHistoryRecords } from "@/lib/History queries";
import { RESOURCE_META } from "@/lib/resource-meta";
export const dynamic = "force-dynamic";
function isValidDateInput(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
   !Number.isNaN(Date.parse(`${value}T00:00:00`))
  );
}
function formatDate(value: Date | null | undefined): string {
  if (!value) return "";
  return value.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
function styleTitle(
  sheet: ExcelJS.Worksheet,
  title: string,
  lastColumn: number
) {
  sheet.mergeCells(1, 1, 1, lastColumn);
  const cell = sheet.getCell(1, 1);
  cell.value = title;
  cell.font = {
    bold: true,
    size: 16,
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };
  sheet.getRow(1).height = 28;
}
function styleHeader(row: ExcelJS.Row) {
  row.font = {
    bold: true,
  };
  row.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  row.height = 24;
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
}
function styleDataRows(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number
) {
  if (endRow < startRow) return;
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    row.alignment = {
      vertical: "top",
      wrapText: true,
    };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }
}
function addSectionTitle(
  sheet: ExcelJS.Worksheet,
  rowNumber: number,
  title: string,
  lastColumn: number
) {
  sheet.mergeCells(rowNumber, 1, rowNumber, lastColumn);
  const cell = sheet.getCell(rowNumber, 1);
  cell.value = title;
  cell.font = {
    bold: true,
    size: 12,
  };
}
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "เธเธฃเธธเธ“เธฒเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ",
        },
        { status: 401 }
      );
    }
    if (session.roleName !== "MANAGER") {
      return NextResponse.json(
        {
          success: false,
          message: "เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเน€เธเนเธฒเธ–เธถเธเธเนเธญเธกเธนเธฅเธเธตเน",
        },
        { status: 403 }
      );
    }
    if (!session.companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฃเธดเธฉเธฑเธ—เธเธญเธเธเธนเนเนเธเนเธเธฒเธ",
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
          message: "เธฃเธนเธเนเธเธเธงเธฑเธเธ—เธตเนเนเธกเนเธ–เธนเธเธ•เนเธญเธ เธเธฃเธธเธ“เธฒเนเธเนเธฃเธนเธเนเธเธ YYYY-MM-DD",
        },
        { status: 400 }
      );
    }
    if (from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "เธงเธฑเธเธ—เธตเนเน€เธฃเธดเนเธกเธ•เนเธเธ•เนเธญเธเนเธกเนเธกเธฒเธเธเธงเนเธฒเธงเธฑเธเธ—เธตเนเธชเธดเนเธเธชเธธเธ”",
        },
        { status: 400 }
      );
    }
    const startDate = new Date(`${from}T00:00:00`);
    const endDate = new Date(`${to}T23:59:59.999`);
    const [
      company,
      energy,
      water,
      carbon,
      historyRecords,
      kpis,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: {
          companyId: session.companyId,
        },
        select: {
          companyName: true,
          companyCode: true,
        },
      }),
      computeResourceMetrics(
        session.companyId,
        ENERGY_TYPES,
        startDate,
        endDate,
        "kWh"
      ),
      computeResourceMetrics(
        session.companyId,
        WATER_TYPES,
        startDate,
        endDate,
        "mยณ"
      ),
      getCarbonFootprint(
        session.companyId,
        startDate,
        endDate
      ),
      getAllHistoryRecords(session.companyId),
      prisma.kPI.findMany({
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
      }),
    ]);
    const wasteResourceTypes = await prisma.resourceTypeMaster.findMany({
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
    });

    const wasteCodes = new Set(
      wasteResourceTypes.map((resource) => resource.resourceCode)
    );

    const records = historyRecords.filter((record) => {
      const day = record.recordedAt.slice(0, 10);
      return day >= from && day <= to;
    });
    const energyRecords = records.filter((record) =>
      ENERGY_TYPES.includes(
        record.resourceType as (typeof ENERGY_TYPES)[number]
      )
    );
    const waterRecords = records.filter((record) =>
      WATER_TYPES.includes(
        record.resourceType as (typeof WATER_TYPES)[number]
      )
    );
    const wasteRecords = records.filter((record) =>
      wasteCodes.has(record.resourceType)
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "GreenFactory Insight";
    workbook.company = company?.companyName ?? "GreenFactory Insight";
    workbook.subject = `Sustainability report ${from} - ${to}`;
    workbook.title = `GreenFactory Insight Report ${from} - ${to}`;
    workbook.created = new Date();
    workbook.modified = new Date();
    // ---------------------------------------------------------------------
    // Executive Summary
    // ---------------------------------------------------------------------
    const summarySheet = workbook.addWorksheet("Executive Summary", {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    summarySheet.columns = [
      { width: 30 },
      { width: 20 },
      { width: 18 },
      { width: 28 },
      { width: 20 },
      { width: 20 },
    ];
    styleTitle(
      summarySheet,
      `เธฃเธฒเธขเธเธฒเธเธชเธฃเธธเธเธเธนเนเธเธฃเธดเธซเธฒเธฃ ${from} เธ–เธถเธ ${to}`,
      6
    );
    summarySheet.getCell("A2").value = "เธเธฃเธดเธฉเธฑเธ—";
    summarySheet.getCell("B2").value =
      company?.companyName ?? `Company ID ${session.companyId}`;
    summarySheet.getCell("D2").value = "เธเนเธงเธเธเนเธญเธกเธนเธฅ";
    summarySheet.getCell("E2").value = `${from} เธ–เธถเธ ${to}`;
    const summaryHeaderRow = summarySheet.getRow(4);
    summaryHeaderRow.values = [
      "เธ•เธฑเธงเธเธตเนเธงเธฑเธ”",
      "เธขเธญเธ”เธฃเธงเธก",
      "เธซเธเนเธงเธข",
      "% เน€เธเธฅเธตเนเธขเธเนเธเธฅเธเธเธฒเธเธเนเธงเธเธเนเธญเธเธซเธเนเธฒ",
    ];
    styleHeader(summaryHeaderRow);
    summarySheet.addRow([
      "เธเธฒเธฃเนเธเนเธเธฅเธฑเธเธเธฒเธเธฃเธงเธก",
      energy.total,
      energy.unit,
      energy.changePct,
    ]);
    summarySheet.addRow([
      "เธเธฒเธฃเนเธเนเธเนเธณเธฃเธงเธก",
      water.total,
      water.unit,
      water.changePct,
    ]);
    summarySheet.addRow([
      "Carbon Footprint",
      carbon.totalKgCO2e,
      "kgCO2e",
      carbon.changePct,
    ]);
    styleDataRows(summarySheet, 5, 7);
    summarySheet.getColumn(2).numFmt = "#,##0.00";
    summarySheet.getColumn(4).numFmt = '0.00"%"';
    addSectionTitle(
      summarySheet,
      9,
      "เธเธฒเธฃเนเธเนเธเธฅเธฑเธเธเธฒเธเนเธขเธเธ•เธฒเธกเนเธเธเธ",
      3
    );
    const departmentHeaderRow = summarySheet.getRow(10);
    departmentHeaderRow.values = [
      "เนเธเธเธ",
      "เธเธฅเธฑเธเธเธฒเธ (kWh)",
      "เธชเธฑเธ”เธชเนเธงเธ (%)",
    ];
    styleHeader(departmentHeaderRow);
    energy.breakdown.forEach((item) => {
      summarySheet.addRow([
        item.department,
        item.value,
        item.percent,
      ]);
    });
    const departmentEndRow =
      10 + energy.breakdown.length;
    styleDataRows(
      summarySheet,
      11,
      departmentEndRow
    );
    const carbonSectionRow =
      Math.max(departmentEndRow + 2, 13);
    addSectionTitle(
      summarySheet,
      carbonSectionRow,
      "Carbon Footprint เนเธขเธเธ•เธฒเธกเธเธฃเธฐเน€เธ เธ—เธ—เธฃเธฑเธเธขเธฒเธเธฃ",
      6
    );
    const carbonHeaderRow =
      summarySheet.getRow(carbonSectionRow + 1);
    carbonHeaderRow.values = [
      "เธเธฃเธฐเน€เธ เธ—เธ—เธฃเธฑเธเธขเธฒเธเธฃ",
      "Scope",
      "เธเธฃเธดเธกเธฒเธ“เธเธฒเธฃเนเธเน",
      "เธซเธเนเธงเธข",
      "Carbon (kgCO2e)",
      "เธชเธฑเธ”เธชเนเธงเธ (%)",
    ];
    styleHeader(carbonHeaderRow);
    carbon.breakdown.forEach((item) => {
      summarySheet.addRow([
        RESOURCE_META[item.resourceType]?.label ??
          item.resourceType,
        item.scope,
        item.usageValue,
        item.unit,
        item.carbonKg,
        item.percent,
      ]);
    });
    const carbonEndRow =
      carbonSectionRow + 1 + carbon.breakdown.length;
    styleDataRows(
      summarySheet,
      carbonSectionRow + 2,
      carbonEndRow
    );
    const noteRow = carbonEndRow + 2;
    summarySheet.mergeCells(
      noteRow,
      1,
      noteRow,
      6
    );
    summarySheet.getCell(noteRow, 1).value =
      "เธซเธกเธฒเธขเน€เธซเธ•เธธ: เธ•เธฑเธงเธเธนเธ“เธเธฒเธฃเธเธฅเนเธญเธขเธเธฒเธฃเนเธเธญเธเน€เธเนเธเธเนเธฒเธเธฃเธฐเธกเธฒเธ“เธเธฒเธฃเธ—เธฑเนเธงเนเธ เนเธกเนเนเธเนเธเนเธฒเธ—เธตเนเธเธฃเธดเธฉเธฑเธ—เธขเธทเธเธขเธฑเธเธญเธขเนเธฒเธเน€เธเนเธเธ—เธฒเธเธเธฒเธฃ เธซเนเธฒเธกเนเธเนเธญเนเธฒเธเธญเธดเธเนเธเธฃเธฒเธขเธเธฒเธ audit เธเธฃเธดเธ";
    summarySheet.getCell(noteRow, 1).alignment = {
      wrapText: true,
      vertical: "top",
    };
    summarySheet.getCell(noteRow, 1).font = {
      italic: true,
    };
    // ---------------------------------------------------------------------
    // Energy
    // ---------------------------------------------------------------------
    const energySheet = workbook.addWorksheet("Energy", {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    energySheet.columns = [
      { width: 22 },
      { width: 28 },
      { width: 18 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 16 },
      { width: 18 },
      { width: 24 },
      { width: 18 },
      { width: 35 },
    ];
    styleTitle(
      energySheet,
      `เธเนเธญเธกเธนเธฅเธเธฅเธฑเธเธเธฒเธ ${from} เธ–เธถเธ ${to}`,
      12
    );
    energySheet.getCell("A2").value = "เธเธฅเธฑเธเธเธฒเธเธฃเธงเธก";
    energySheet.getCell("B2").value = energy.total;
    energySheet.getCell("C2").value = energy.unit;
    const energyHeader = energySheet.getRow(4);
    energyHeader.values = [
      "เธงเธฑเธเธ—เธตเนเนเธฅเธฐเน€เธงเธฅเธฒ",
      "เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เธฃเธซเธฑเธชเน€เธเธฃเธทเนเธญเธ",
      "เธเธฃเธฐเน€เธ เธ—เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เนเธฅเธเนเธเธฒเธฃเธเธฅเธดเธ•",
      "เนเธเธเธ",
      "เธเธฃเธฐเน€เธ เธ—เธ—เธฃเธฑเธเธขเธฒเธเธฃ",
      "เธซเธเนเธงเธขเธงเธฑเธ”",
      "เธเธฃเธดเธกเธฒเธ“เธ—เธตเนเนเธเน",
      "เธเธนเนเธเธฑเธเธ—เธถเธ",
      "เธชเธ–เธฒเธเธฐ",
      "เธซเธกเธฒเธขเน€เธซเธ•เธธ",
    ];
    styleHeader(energyHeader);
    energyRecords.forEach((record) => {
      energySheet.addRow([
        new Date(record.recordedAt),
        record.equipmentName,
        record.equipmentCode ?? "",
        record.equipmentType ?? "",
        record.productionLine ?? "",
        record.department ?? "",
        record.resourceLabel,
        record.unit,
        record.value,
        record.recordedByName,
        record.status === "RECORDED"
          ? "เธเธฑเธเธ—เธถเธเนเธฅเนเธง"
          : "เธฃเธญเธญเธเธธเธกเธฑเธ•เธด",
        record.note ?? "",
      ]);
    });
    if (energyRecords.length === 0) {
      energySheet.addRow([
        "เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฅเธฑเธเธเธฒเธเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ",
      ]);
    }
    styleDataRows(
      energySheet,
      5,
      Math.max(5, 4 + energyRecords.length)
    );
    energySheet.getColumn(1).numFmt =
      "dd/mm/yyyy hh:mm";
    energySheet.getColumn(9).numFmt =
      "#,##0.000";
    // ---------------------------------------------------------------------
    // Water
    // ---------------------------------------------------------------------
    const waterSheet = workbook.addWorksheet("Water", {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    waterSheet.columns = [
      { width: 22 },
      { width: 28 },
      { width: 18 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 16 },
      { width: 18 },
      { width: 24 },
      { width: 18 },
      { width: 35 },
    ];
    styleTitle(
      waterSheet,
      `เธเนเธญเธกเธนเธฅเธเนเธณ ${from} เธ–เธถเธ ${to}`,
      12
    );
    waterSheet.getCell("A2").value = "เธเธฒเธฃเนเธเนเธเนเธณเธฃเธงเธก";
    waterSheet.getCell("B2").value = water.total;
    waterSheet.getCell("C2").value = water.unit;
    const waterHeader = waterSheet.getRow(4);
    waterHeader.values = [
      "เธงเธฑเธเธ—เธตเนเนเธฅเธฐเน€เธงเธฅเธฒ",
      "เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เธฃเธซเธฑเธชเน€เธเธฃเธทเนเธญเธ",
      "เธเธฃเธฐเน€เธ เธ—เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เนเธฅเธเนเธเธฒเธฃเธเธฅเธดเธ•",
      "เนเธเธเธ",
      "เธเธฃเธฐเน€เธ เธ—เธ—เธฃเธฑเธเธขเธฒเธเธฃ",
      "เธซเธเนเธงเธขเธงเธฑเธ”",
      "เธเธฃเธดเธกเธฒเธ“เธ—เธตเนเนเธเน",
      "เธเธนเนเธเธฑเธเธ—เธถเธ",
      "เธชเธ–เธฒเธเธฐ",
      "เธซเธกเธฒเธขเน€เธซเธ•เธธ",
    ];
    styleHeader(waterHeader);
    waterRecords.forEach((record) => {
      waterSheet.addRow([
        new Date(record.recordedAt),
        record.equipmentName,
        record.equipmentCode ?? "",
        record.equipmentType ?? "",
        record.productionLine ?? "",
        record.department ?? "",
        record.resourceLabel,
        record.unit,
        record.value,
        record.recordedByName,
        record.status === "RECORDED"
          ? "เธเธฑเธเธ—เธถเธเนเธฅเนเธง"
          : "เธฃเธญเธญเธเธธเธกเธฑเธ•เธด",
        record.note ?? "",
      ]);
    });
    if (waterRecords.length === 0) {
      waterSheet.addRow([
        "เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเนเธณเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ",
      ]);
    }
    styleDataRows(
      waterSheet,
      5,
      Math.max(5, 4 + waterRecords.length)
    );
    waterSheet.getColumn(1).numFmt =
      "dd/mm/yyyy hh:mm";
    waterSheet.getColumn(9).numFmt =
      "#,##0.000";
    // ---------------------------------------------------------------------
    // Waste
    // ---------------------------------------------------------------------
    const wasteSheet = workbook.addWorksheet("Waste", {
      views: [{ state: "frozen", ySplit: 3 }],
    });

    wasteSheet.columns = [
      { width: 22 },
      { width: 28 },
      { width: 18 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 16 },
      { width: 18 },
      { width: 24 },
      { width: 18 },
      { width: 35 },
    ];

    styleTitle(wasteSheet, `เธเนเธญเธกเธนเธฅเธเธญเธเน€เธชเธตเธข ${from} เธ–เธถเธ ${to}`, 12);

    wasteSheet.getCell("A2").value = "เธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃเธเธญเธเน€เธชเธตเธข";
    wasteSheet.getCell("B2").value = wasteRecords.length;

    const wasteHeader = wasteSheet.getRow(4);
    wasteHeader.values = [
      "เธงเธฑเธเธ—เธตเนเนเธฅเธฐเน€เธงเธฅเธฒ",
      "เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เธฃเธซเธฑเธชเน€เธเธฃเธทเนเธญเธ",
      "เธเธฃเธฐเน€เธ เธ—เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เนเธฅเธเนเธเธฒเธฃเธเธฅเธดเธ•",
      "เนเธเธเธ",
      "เธเธฃเธฐเน€เธ เธ—เธเธญเธเน€เธชเธตเธข",
      "เธซเธเนเธงเธขเธงเธฑเธ”",
      "เธเธฃเธดเธกเธฒเธ“",
      "เธเธนเนเธเธฑเธเธ—เธถเธ",
      "เธชเธ–เธฒเธเธฐ",
      "เธซเธกเธฒเธขเน€เธซเธ•เธธ",
    ];
    styleHeader(wasteHeader);

    wasteRecords.forEach((record) => {
      wasteSheet.addRow([
        new Date(record.recordedAt),
        record.equipmentName,
        record.equipmentCode ?? "",
        record.equipmentType ?? "",
        record.productionLine ?? "",
        record.department ?? "",
        record.resourceLabel,
        record.unit,
        record.value,
        record.recordedByName,
        record.status === "RECORDED" ? "เธเธฑเธเธ—เธถเธเนเธฅเนเธง" : "เธฃเธญเธญเธเธธเธกเธฑเธ•เธด",
        record.note ?? "",
      ]);
    });

    if (wasteRecords.length === 0) {
      wasteSheet.addRow(["เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธญเธเน€เธชเธตเธขเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ"]);
    }

    styleDataRows(wasteSheet, 5, Math.max(5, 4 + wasteRecords.length));
    wasteSheet.getColumn(1).numFmt = "dd/mm/yyyy hh:mm";
    wasteSheet.getColumn(9).numFmt = "#,##0.000";

    // ---------------------------------------------------------------------
    // Carbon
    // ---------------------------------------------------------------------
    const carbonSheet = workbook.addWorksheet("Carbon", {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    carbonSheet.columns = [
      { width: 30 },
      { width: 16 },
      { width: 20 },
      { width: 16 },
      { width: 22 },
      { width: 18 },
    ];
    styleTitle(
      carbonSheet,
      `Carbon Footprint ${from} เธ–เธถเธ ${to}`,
      6
    );
    carbonSheet.getCell("A2").value =
      "Carbon Footprint เธฃเธงเธก";
    carbonSheet.getCell("B2").value =
      carbon.totalKgCO2e;
    carbonSheet.getCell("C2").value =
      "kgCO2e";
    const carbonSheetHeader = carbonSheet.getRow(4);
    carbonSheetHeader.values = [
      "เธเธฃเธฐเน€เธ เธ—เธ—เธฃเธฑเธเธขเธฒเธเธฃ",
      "Scope",
      "เธเธฃเธดเธกเธฒเธ“เธเธฒเธฃเนเธเน",
      "เธซเธเนเธงเธข",
      "Carbon (kgCO2e)",
      "เธชเธฑเธ”เธชเนเธงเธ (%)",
    ];
    styleHeader(carbonSheetHeader);
    carbon.breakdown.forEach((item) => {
      carbonSheet.addRow([
        RESOURCE_META[item.resourceType]?.label ??
          item.resourceType,
        item.scope,
        item.usageValue,
        item.unit,
        item.carbonKg,
        item.percent,
      ]);
    });
    if (carbon.breakdown.length === 0) {
      carbonSheet.addRow([
        "เนเธกเนเธเธเธเนเธญเธกเธนเธฅ Carbon เนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ",
      ]);
    }
    styleDataRows(
      carbonSheet,
      5,
      Math.max(5, 4 + carbon.breakdown.length)
    );
    const carbonNoteRow =
      Math.max(6, 5 + carbon.breakdown.length);
    carbonSheet.mergeCells(
      carbonNoteRow,
      1,
      carbonNoteRow,
      6
    );
    carbonSheet.getCell(carbonNoteRow, 1).value =
      "เธซเธกเธฒเธขเน€เธซเธ•เธธ: เธ•เธฑเธงเธเธนเธ“เธเธฒเธฃเธเธฅเนเธญเธขเธเธฒเธฃเนเธเธญเธเน€เธเนเธเธเนเธฒเธเธฃเธฐเธกเธฒเธ“เธเธฒเธฃเธ—เธฑเนเธงเนเธ เนเธกเนเนเธเนเธเนเธฒเธ—เธตเนเธเธฃเธดเธฉเธฑเธ—เธขเธทเธเธขเธฑเธเธญเธขเนเธฒเธเน€เธเนเธเธ—เธฒเธเธเธฒเธฃ เธซเนเธฒเธกเนเธเนเธญเนเธฒเธเธญเธดเธเนเธเธฃเธฒเธขเธเธฒเธ audit เธเธฃเธดเธ";
    carbonSheet.getCell(carbonNoteRow, 1).alignment = {
      wrapText: true,
    };
    // ---------------------------------------------------------------------
    // KPI
    // ---------------------------------------------------------------------
    const kpiSheet = workbook.addWorksheet("KPI", {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    kpiSheet.columns = [
      { width: 18 },
      { width: 30 },
      { width: 20 },
      { width: 18 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 28 },
      { width: 18 },
      { width: 24 },
      { width: 18 },
      { width: 20 },
      { width: 14 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 24 },
    ];
    styleTitle(
      kpiSheet,
      `เธฃเธฒเธขเธเธฒเธ KPI ${from} เธ–เธถเธ ${to}`,
      23
    );
    kpiSheet.getCell("A2").value = "เธเธณเธเธงเธ KPI";
    kpiSheet.getCell("B2").value = kpis.length;
    kpiSheet.getCell("D2").value =
      "เธเธณเธเธงเธเธเธฅเธฅเธฑเธเธเน KPI";
    kpiSheet.getCell("E2").value =
      kpis.reduce(
        (sum, kpi) => sum + kpi.results.length,
        0
      );
    const kpiHeader = kpiSheet.getRow(4);
    kpiHeader.values = [
      "เธฃเธซเธฑเธช KPI",
      "เธเธทเนเธญ KPI",
      "เธเธฃเธฐเน€เธ เธ— KPI",
      "เธเธญเธเน€เธเธ•",
      "เนเธฃเธเธเธฒเธ",
      "เธญเธฒเธเธฒเธฃ",
      "เนเธเธเธ",
      "เนเธฅเธเนเธเธฒเธฃเธเธฅเธดเธ•",
      "เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เธฃเธซเธฑเธชเน€เธเธฃเธทเนเธญเธ",
      "เธเธฃเธฐเน€เธ เธ—เธ—เธฃเธฑเธเธขเธฒเธเธฃ",
      "เน€เธเนเธฒเธซเธกเธฒเธข",
      "เน€เธเธทเนเธญเธเนเธเน€เธเนเธฒเธซเธกเธฒเธข",
      "เธซเธเนเธงเธข",
      "เธฃเธญเธเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธ",
      "เธงเธฑเธเธ—เธตเนเน€เธฃเธดเนเธกเนเธเน KPI",
      "เธงเธฑเธเธ—เธตเนเธชเธดเนเธเธชเธธเธ” KPI",
      "เธเนเธงเธเธเธฅเธฅเธฑเธเธเนเน€เธฃเธดเนเธกเธ•เนเธ",
      "เธเนเธงเธเธเธฅเธฅเธฑเธเธเนเธชเธดเนเธเธชเธธเธ”",
      "เธเนเธฒเธเธฃเธดเธ",
      "เธเนเธฒเธเธงเธฒเธกเนเธเธฃเธเธฃเธงเธ",
      "เธเธฅเธชเธณเน€เธฃเนเธ (%)",
      "เธชเธ–เธฒเธเธฐเธเธฅเธฅเธฑเธเธเน",
    ];
    styleHeader(kpiHeader);
    let kpiRowCount = 0;
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
        Number(kpi.targetValue),
        kpi.targetOperator,
        kpi.unit.symbol || kpi.unit.unitName,
        kpi.periodType,
        formatDate(kpi.effectiveFrom),
        formatDate(kpi.effectiveTo),
      ];
      if (kpi.results.length === 0) {
        kpiSheet.addRow([
          ...baseColumns,
          "",
          "",
          "",
          "",
          "",
          "เธขเธฑเธเนเธกเนเธกเธตเธเธฅเธฅเธฑเธเธเนเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ",
        ]);
        kpiRowCount += 1;
        continue;
      }
      for (const result of kpi.results) {
        kpiSheet.addRow([
          ...baseColumns,
          formatDate(result.periodStart),
          formatDate(result.periodEnd),
          Number(result.actualValue),
          Number(result.varianceValue),
          Number(result.achievementPercent),
          result.resultStatus,
        ]);
        kpiRowCount += 1;
      }
    }
    if (kpiRowCount === 0) {
      kpiSheet.addRow([
        "เนเธกเนเธเธเธเนเธญเธกเธนเธฅ KPI เนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ",
      ]);
      kpiRowCount = 1;
    }
    styleDataRows(
      kpiSheet,
      5,
      4 + kpiRowCount
    );
    // ---------------------------------------------------------------------
    // All Resource Records
    // ---------------------------------------------------------------------
    const allSheet = workbook.addWorksheet("All Resources", {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    allSheet.columns = [
      { width: 22 },
      { width: 28 },
      { width: 18 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 24 },
      { width: 16 },
      { width: 18 },
      { width: 24 },
      { width: 18 },
      { width: 35 },
    ];
    styleTitle(
      allSheet,
      `เธเนเธญเธกเธนเธฅเธ—เธฃเธฑเธเธขเธฒเธเธฃเธ—เธฑเนเธเธซเธกเธ” ${from} เธ–เธถเธ ${to}`,
      12
    );
    allSheet.getCell("A2").value = "เธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃ";
    allSheet.getCell("B2").value = records.length;
    const allHeader = allSheet.getRow(4);
    allHeader.values = [
      "เธงเธฑเธเธ—เธตเนเนเธฅเธฐเน€เธงเธฅเธฒ",
      "เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เธฃเธซเธฑเธชเน€เธเธฃเธทเนเธญเธ",
      "เธเธฃเธฐเน€เธ เธ—เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ",
      "เนเธฅเธเนเธเธฒเธฃเธเธฅเธดเธ•",
      "เนเธเธเธ",
      "เธเธฃเธฐเน€เธ เธ—เธ—เธฃเธฑเธเธขเธฒเธเธฃ",
      "เธซเธเนเธงเธขเธงเธฑเธ”",
      "เธเธฃเธดเธกเธฒเธ“เธ—เธตเนเนเธเน",
      "เธเธนเนเธเธฑเธเธ—เธถเธ",
      "เธชเธ–เธฒเธเธฐ",
      "เธซเธกเธฒเธขเน€เธซเธ•เธธ",
    ];
    styleHeader(allHeader);
    records.forEach((record) => {
      allSheet.addRow([
        new Date(record.recordedAt),
        record.equipmentName,
        record.equipmentCode ?? "",
        record.equipmentType ?? "",
        record.productionLine ?? "",
        record.department ?? "",
        record.resourceLabel,
        record.unit,
        record.value,
        record.recordedByName,
        record.status === "RECORDED"
          ? "เธเธฑเธเธ—เธถเธเนเธฅเนเธง"
          : "เธฃเธญเธญเธเธธเธกเธฑเธ•เธด",
        record.note ?? "",
      ]);
    });
    if (records.length === 0) {
      allSheet.addRow([
        "เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธ—เธฃเธฑเธเธขเธฒเธเธฃเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ",
      ]);
    }
    styleDataRows(
      allSheet,
      5,
      Math.max(5, 4 + records.length)
    );
    allSheet.getColumn(1).numFmt =
      "dd/mm/yyyy hh:mm";
    allSheet.getColumn(9).numFmt =
      "#,##0.000";
    // ---------------------------------------------------------------------
    // Download
    // ---------------------------------------------------------------------
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          `attachment; filename="greenfactory-report-${from}-${to}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธชเธฃเนเธฒเธเนเธเธฅเน Excel เนเธ”เน",
      },
      { status: 500 }
    );
  }
}


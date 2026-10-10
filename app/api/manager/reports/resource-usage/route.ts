import { existsSync } from "node:fs";

import { NextRequest } from "next/server";

import ExcelJS from "exceljs";

import PDFDocument from "pdfkit";

import { prisma } from "@/lib/prisma";

import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

type ReportFormat = "CSV" | "XLSX" | "PDF" | "JSON";

type FilterScope = {

  from: string;

  to: string;

  format: ReportFormat;

};

type UsageRow = {

  usageReference: string;

  usageAt: Date;

  quantity: unknown;

  sourceType: string;

  processingStatus: string;

  remark: string | null;

  machine: { machineCode: string; machineName: string } | null;

  building: { buildingName: string } | null;

  department: { departmentName: string } | null;

  productionLine: { lineName: string } | null;

  resourceType: { resourceCode: string; resourceName: string };

  unit: { symbol: string };

};

function isValidDateKey(value: string | null): value is string {

  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

}

function isValidFormat(value: unknown): value is ReportFormat {

  return (

    value === "CSV" ||

    value === "XLSX" ||

    value === "PDF" ||

    value === "JSON"

  );

}

function startOfBangkokDate(dateKey: string) {

  return new Date(`${dateKey}T00:00:00+07:00`);

}

function endOfBangkokDate(dateKey: string) {

  return new Date(`${dateKey}T23:59:59.999+07:00`);

}

function csvEscape(value: unknown) {

  const text = value === null || value === undefined ? "" : String(value);

  return `"${text.replace(/"/g, '""')}"`;

}

function formatBangkokDateTime(value: Date) {

  return new Intl.DateTimeFormat("th-TH", {

    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

    timeZone: "Asia/Bangkok",

    hour12: false,

  }).format(value);

}

function normalizedRows(rows: UsageRow[]) {

  return rows.map((row) => ({

    reference: row.usageReference,

    dateTime: formatBangkokDateTime(row.usageAt),

    resourceCode: row.resourceType.resourceCode,

    resourceName: row.resourceType.resourceName,

    quantity: Number(row.quantity),

    unit: row.unit.symbol,

    machineCode: row.machine?.machineCode ?? "",

    machineName: row.machine?.machineName ?? "",

    building: row.building?.buildingName ?? "",

    department: row.department?.departmentName ?? "",

    productionLine: row.productionLine?.lineName ?? "",

    source: row.sourceType,

    processingStatus: row.processingStatus,

    remark: row.remark ?? "",

  }));

}

type SummaryItem = {

  key: string;

  name: string;

  unit: string;

  total: number;

  count: number;

};

type MachineSummaryItem = {

  key: string;

  name: string;

  total: number;

  count: number;

};

type DailySummaryItem = {

  date: string;

  total: number;

  count: number;

};

function buildReportSummary(rows: UsageRow[]) {

  const data = normalizedRows(rows);

  const resourceMap = new Map<string, SummaryItem>();

  const machineMap = new Map<string, MachineSummaryItem>();

  const dailyMap = new Map<string, DailySummaryItem>();

  for (const row of data) {

    const resourceKey = `${row.resourceCode}|${row.unit}`;

    const resource = resourceMap.get(resourceKey);

    resourceMap.set(resourceKey, {

      key: resourceKey,

      name: row.resourceName || row.resourceCode,

      unit: row.unit,

      total: (resource?.total ?? 0) + row.quantity,

      count: (resource?.count ?? 0) + 1,

    });

    const machineName = row.machineName || row.machineCode || "Unassigned";

    const machineKey = machineName;

    const machine = machineMap.get(machineKey);

    machineMap.set(machineKey, {

      key: machineKey,

      name: machineName,

      total: (machine?.total ?? 0) + row.quantity,

      count: (machine?.count ?? 0) + 1,

    });

    const dateKey = row.dateTime.slice(0, 10);

    const daily = dailyMap.get(dateKey);

    dailyMap.set(dateKey, {

      date: dateKey,

      total: (daily?.total ?? 0) + row.quantity,

      count: (daily?.count ?? 0) + 1,

    });

  }

  const resources = Array.from(resourceMap.values()).sort(

    (a, b) => b.total - a.total,

  );

  const machines = Array.from(machineMap.values()).sort(

    (a, b) => b.total - a.total,

  );

  const daily = Array.from(dailyMap.values()).sort((a, b) =>

    a.date.localeCompare(b.date),

  );

  const qrCount = data.filter((row) => row.source.toUpperCase() === "QR").length;

  const manualCount = data.filter(

    (row) => row.source.toUpperCase() === "MANUAL",

  ).length;

  return {

    data,

    resources,

    machines,

    daily,

    qrCount,

    manualCount,

    uniqueMachines: machineMap.size,

    uniqueResources: resourceMap.size,

  };

}

function safeSheetName(value: string) {

  return value.replace(/[\\\\\\\\/*?:[\\\\]]/g, "_").slice(0, 31) || "Sheet";

}

function excelHeaderStyle(row: ExcelJS.Row) {

  row.height = 24;

  row.font = { bold: true, color: { argb: "FFFFFFFF" } };

  row.fill = {

    type: "pattern",

    pattern: "solid",

    fgColor: { argb: "FF0F172A" },

  };

  row.alignment = { vertical: "middle" };

}

function excelSectionTitle(

  sheet: ExcelJS.Worksheet,

  cell: string,

  text: string,

) {

  const target = sheet.getCell(cell);

  target.value = text;

  target.font = { size: 14, bold: true, color: { argb: "FF0F172A" } };

}

function excelKpiCard(

  sheet: ExcelJS.Worksheet,

  range: string,

  label: string,

  value: string | number,

  accent: string,

) {

  sheet.mergeCells(range);

  const cell = sheet.getCell(range.split(":")[0]);

  cell.value = `${label}\n${value}`;

  cell.alignment = {

    vertical: "middle",

    horizontal: "left",

    wrapText: true,

  };

  cell.font = {

    size: 12,

    bold: true,

    color: { argb: "FF0F172A" },

  };

  cell.fill = {

    type: "pattern",

    pattern: "solid",

    fgColor: { argb: accent },

  };

  cell.border = {

    top: { style: "thin", color: { argb: "FFE2E8F0" } },

    left: { style: "thin", color: { argb: "FFE2E8F0" } },

    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },

    right: { style: "thin", color: { argb: "FFE2E8F0" } },

  };

}

function buildCsv(rows: UsageRow[]) {

  const header = [

    "Reference",

    "Date Time",

    "Resource Code",

    "Resource Name",

    "Quantity",

    "Unit",

    "Machine Code",

    "Machine Name",

    "Building",

    "Department",

    "Production Line",

    "Source",

    "Processing Status",

    "Remark",

  ];

  const data = normalizedRows(rows);

  const lines = [

    header.map(csvEscape).join(","),

    ...data.map((row) =>

      [

        row.reference,

        row.dateTime,

        row.resourceCode,

        row.resourceName,

        row.quantity,

        row.unit,

        row.machineCode,

        row.machineName,

        row.building,

        row.department,

        row.productionLine,

        row.source,

        row.processingStatus,

        row.remark,

      ]

        .map(csvEscape)

        .join(","),

    ),

  ];

  return "\uFEFF" + lines.join("\r\n");

}

async function buildXlsx(

  rows: UsageRow[],

  reportName: string,

  from: string,

  to: string,

) {

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "GreenFactory Insight";

  workbook.created = new Date();

  workbook.modified = new Date();

  workbook.subject = "Resource Intelligence Report";

  workbook.title = reportName;

  const summary = buildReportSummary(rows);

  // ============================================================

  // 01 EXECUTIVE SUMMARY

  // ============================================================

  const executive = workbook.addWorksheet("01 Executive Summary", {

    views: [{ state: "frozen", ySplit: 3 }],

    properties: { defaultRowHeight: 20 },

  });

  executive.columns = [

    { width: 4 },

    { width: 20 },

    { width: 20 },

    { width: 20 },

    { width: 20 },

    { width: 20 },

    { width: 20 },

    { width: 4 },

  ];

  executive.mergeCells("B2:G2");

  executive.getCell("B2").value = "GREENFACTORY INSIGHT";

  executive.getCell("B2").font = {

    size: 20,

    bold: true,

    color: { argb: "FF0F172A" },

  };

  executive.mergeCells("B3:G3");

  executive.getCell("B3").value = "RESOURCE INTELLIGENCE REPORT";

  executive.getCell("B3").font = {

    size: 11,

    bold: true,

    color: { argb: "FF059669" },

  };

  executive.mergeCells("B4:G4");

  executive.getCell("B4").value =

    `Reporting period: ${from} - ${to}  |  Generated: ${formatBangkokDateTime(new Date())}`;

  executive.getCell("B4").font = {

    size: 9,

    color: { argb: "FF64748B" },

  };

  executiveKpi:

  {

    excelKpiCard(executive, "B6:C8", "TOTAL RECORDS", summary.data.length, "FFF0FDF4");

    excelKpiCard(

      executive,

      "D6:E8",

      "MACHINES WITH DATA",

      summary.uniqueMachines,

      "FFEFF6FF",

    );

    excelKpiCard(

      executive,

      "F6:G8",

      "RESOURCE TYPES",

      summary.uniqueResources,

      "FFF5F3FF",

    );

    excelKpiCard(

      executive,

      "B10:C12",

      "QR INPUT",

      `${summary.qrCount} records`,

      "FFECFDF5",

    );

    excelKpiCard(

      executive,

      "D10:E12",

      "MANUAL INPUT",

      `${summary.manualCount} records`,

      "FFFFF7ED",

    );

    const topResource = summary.resources[0];

    excelKpiCard(

      executive,

      "F10:G12",

      "TOP RESOURCE",

      topResource

        ? `${topResource.name}

${topResource.total.toLocaleString("en-US", {

            maximumFractionDigits: 2,

          })} ${topResource.unit}`

        : "No data",

      "FFFFF1F2",

    );

  }

  excelSectionTitle(executive, "B15", "Top Resource Consumers");

  executive.mergeCells("B15:G15");

  const topResourceStart = 17;

  executive.getCell(`B${topResourceStart}`).value = "Resource";

  executive.getCell(`C${topResourceStart}`).value = "Unit";

  executive.getCell(`D${topResourceStart}`).value = "Total";

  executive.getCell(`E${topResourceStart}`).value = "Records";

  executive.getCell(`F${topResourceStart}`).value = "Share";

  executive.getCell(`G${topResourceStart}`).value = "Visual";

  excelHeaderStyle(executive.getRow(topResourceStart));

  const topResources = summary.resources.slice(0, 8);

  const grandComparable = topResources.reduce((sum, item) => sum + item.total, 0);

  topResources.forEach((item, index) => {

    const rowNo = topResourceStart + 1 + index;

    const share = grandComparable > 0 ? item.total / grandComparable : 0;

    executive.getCell(`B${rowNo}`).value = item.name;

    executive.getCell(`C${rowNo}`).value = item.unit;

    executive.getCell(`D${rowNo}`).value = item.total;

    executive.getCell(`D${rowNo}`).numFmt = "#,##0.00";

    executive.getCell(`E${rowNo}`).value = item.count;

    executive.getCell(`F${rowNo}`).value = share;

    executive.getCell(`F${rowNo}`).numFmt = "0.0%";

    executive.getCell(`G${rowNo}`).value = share;

    executive.getCell(`G${rowNo}`).numFmt = "0.0%";

  });

  if (topResources.length > 0) {

    executive.addConditionalFormatting({

      ref: `G${topResourceStart + 1}:G${topResourceStart + topResources.length}`,

      rules: [

        {

          type: "dataBar",
            priority: 1,

          cfvo: [

            { type: "min" },

            { type: "max" },

          ],

          showValue: false,

        },

      ],

    });

  }

  const machineTitleRow = topResourceStart + 11;

  executive.mergeCells(`B${machineTitleRow}:G${machineTitleRow}`);

  excelSectionTitle(executive, `B${machineTitleRow}`, "Top Machines by Recorded Usage");

  const machineHeader = machineTitleRow + 2;

  ["Machine", "Records", "Total (mixed units)", "Share", "Visual", ""].forEach(

    (label, i) => {

      executive.getCell(machineHeader, 2 + i).value = label;

    },

  );

  excelHeaderStyle(executive.getRow(machineHeader));

  const topMachines = summary.machines.slice(0, 8);

  const machineTotal = topMachines.reduce((sum, item) => sum + item.total, 0);

  topMachines.forEach((item, index) => {

    const rowNo = machineHeader + 1 + index;

    const share = machineTotal > 0 ? item.total / machineTotal : 0;

    executive.getCell(`B${rowNo}`).value = item.name;

    executive.getCell(`C${rowNo}`).value = item.count;

    executive.getCell(`D${rowNo}`).value = item.total;

    executive.getCell(`D${rowNo}`).numFmt = "#,##0.00";

    executive.getCell(`E${rowNo}`).value = share;

    executive.getCell(`E${rowNo}`).numFmt = "0.0%";

    executive.getCell(`F${rowNo}`).value = share;

    executive.getCell(`F${rowNo}`).numFmt = "0.0%";

  });

  if (topMachines.length > 0) {

    executive.addConditionalFormatting({

      ref: `F${machineHeader + 1}:F${machineHeader + topMachines.length}`,

      rules: [

        {

          type: "dataBar",
            priority: 1,

          cfvo: [

            { type: "min" },

            { type: "max" },

          ],

          showValue: false,

        },

      ],

    });

  }

  executive.pageSetup = {

    orientation: "landscape",

    fitToPage: true,

    fitToWidth: 1,

    fitToHeight: 0,

    paperSize: 9,

    margins: {

      left: 0.25,

      right: 0.25,

      top: 0.4,

      bottom: 0.4,

      header: 0.2,

      footer: 0.2,

    },

  };

  // ============================================================

  // 02 RESOURCE SUMMARY

  // ============================================================

  const resourceSheet = workbook.addWorksheet("02 Resource Summary", {

    views: [{ state: "frozen", ySplit: 1 }],

  });

  resourceSheet.columns = [

    { header: "Resource", key: "name", width: 28 },

    { header: "Unit", key: "unit", width: 12 },

    { header: "Total", key: "total", width: 18 },

    { header: "Records", key: "count", width: 12 },

    { header: "Average / Record", key: "average", width: 20 },

  ];

  summary.resources.forEach((item) => {

    resourceSheet.addRow({

      name: item.name,

      unit: item.unit,

      total: item.total,

      count: item.count,

      average: item.count > 0 ? item.total / item.count : 0,

    });

  });

  excelHeaderStyle(resourceSheet.getRow(1));

  resourceSheet.autoFilter = { from: "A1", to: "E1" };

  resourceSheet.getColumn("total").numFmt = "#,##0.00";

  resourceSheet.getColumn("average").numFmt = "#,##0.00";

  if (summary.resources.length > 0) {

    resourceSheet.addConditionalFormatting({

      ref: `C2:C${summary.resources.length + 1}`,

      rules: [

        {

          type: "dataBar",
            priority: 1,

          cfvo: [

            { type: "min" },

            { type: "max" },

          ],

        },

      ],

    });

  }

  // ============================================================

  // 03 MACHINE SUMMARY

  // ============================================================

  const machineSheet = workbook.addWorksheet("03 Machine Summary", {

    views: [{ state: "frozen", ySplit: 1 }],

  });

  machineSheet.columns = [

    { header: "Machine", key: "name", width: 34 },

    { header: "Records", key: "count", width: 12 },

    { header: "Recorded Quantity (mixed units)", key: "total", width: 28 },

  ];

  summary.machines.forEach((item) =>

    machineSheet.addRow({

      name: item.name,

      count: item.count,

      total: item.total,

    }),

  );

  excelHeaderStyle(machineSheet.getRow(1));

  machineSheet.autoFilter = { from: "A1", to: "C1" };

  machineSheet.getColumn("total").numFmt = "#,##0.00";

  if (summary.machines.length > 0) {

    machineSheet.addConditionalFormatting({

      ref: `C2:C${summary.machines.length + 1}`,

      rules: [

        {

          type: "dataBar",
            priority: 1,

          cfvo: [

            { type: "min" },

            { type: "max" },

          ],

        },

      ],

    });

  }

  // ============================================================

  // 04 RAW DATA

  // ============================================================

  const raw = workbook.addWorksheet("04 Raw Data", {

    views: [{ state: "frozen", ySplit: 1 }],

  });

  raw.columns = [

    { header: "Reference", key: "reference", width: 28 },

    { header: "Date Time", key: "dateTime", width: 22 },

    { header: "Resource Code", key: "resourceCode", width: 18 },

    { header: "Resource Name", key: "resourceName", width: 24 },

    { header: "Quantity", key: "quantity", width: 14 },

    { header: "Unit", key: "unit", width: 10 },

    { header: "Machine Code", key: "machineCode", width: 18 },

    { header: "Machine Name", key: "machineName", width: 30 },

    { header: "Building", key: "building", width: 22 },

    { header: "Department", key: "department", width: 24 },

    { header: "Production Line", key: "productionLine", width: 24 },

    { header: "Source", key: "source", width: 12 },

    { header: "Processing Status", key: "processingStatus", width: 18 },

    { header: "Remark", key: "remark", width: 30 },

  ];

  summary.data.forEach((row) => raw.addRow(row));

  excelHeaderStyle(raw.getRow(1));

  raw.autoFilter = { from: "A1", to: "N1" };

  raw.getColumn("quantity").numFmt = "#,##0.00";

  raw.getColumn("source").eachCell((cell, rowNumber) => {

    if (rowNumber === 1) return;

    const value = String(cell.value ?? "").toUpperCase();

    if (value === "QR") {

      cell.fill = {

        type: "pattern",

        pattern: "solid",

        fgColor: { argb: "FFECFDF5" },

      };

      cell.font = { color: { argb: "FF047857" }, bold: true };

    } else if (value === "MANUAL") {

      cell.fill = {

        type: "pattern",

        pattern: "solid",

        fgColor: { argb: "FFFFF7ED" },

      };

      cell.font = { color: { argb: "FFC2410C" }, bold: true };

    }

  });

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);

}

function resolvePdfFont() {

  const candidates = [

    "C:/Windows/Fonts/tahoma.ttf",

    "C:/Windows/Fonts/THSarabunNew.ttf",

    "C:/Windows/Fonts/LeelawUI.ttf",

  ];

  return candidates.find((path) => existsSync(path)) ?? null;

}

function buildPdf(

  rows: UsageRow[],

  reportName: string,

  from: string,

  to: string,

) {

  return new Promise<Buffer>((resolve, reject) => {

    const doc = new PDFDocument({

      size: "A4",

      layout: "landscape",

      bufferPages: true,

      margins: { top: 34, bottom: 34, left: 34, right: 34 },

      info: {

        Title: reportName,

        Author: "GreenFactory Insight",

        Subject: "Resource Intelligence Report",

      },

    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.on("error", reject);

    const fontPath = resolvePdfFont();

    if (fontPath) doc.font(fontPath);

    else doc.font("Helvetica");

    const summary = buildReportSummary(rows);

    const pageWidth = 841.89;

    const pageHeight = 595.28;

    const margin = 34;

    const contentWidth = pageWidth - margin * 2;

    const drawBrand = () => {

      doc

        .roundedRect(margin, 24, contentWidth, 4, 2)

        .fill("#10b981");

      doc

        .fontSize(7)

        .fillColor("#64748b")

        .text(

          "GREENFACTORY INSIGHT  |  RESOURCE INTELLIGENCE",

          margin,

          34,

          { width: contentWidth },

        );

    };

    const drawPageFooter = () => {

      const range = doc.bufferedPageRange();

      for (

        let pageIndex = range.start;

        pageIndex < range.start + range.count;

        pageIndex += 1

      ) {

        doc.switchToPage(pageIndex);

        if (fontPath) doc.font(fontPath);

        doc

          .moveTo(margin, pageHeight - 28)

          .lineTo(pageWidth - margin, pageHeight - 28)

          .strokeColor("#e2e8f0")

          .lineWidth(0.5)

          .stroke();

        doc

          .fontSize(6.5)

          .fillColor("#94a3b8")

          .text(

            `GreenFactory Insight  |  Generated ${formatBangkokDateTime(new Date())}`,

            margin,

            pageHeight - 22,

            { width: contentWidth / 2, align: "left" },

          );

        doc

          .fontSize(6.5)

          .fillColor("#94a3b8")

          .text(

            `Page ${pageIndex + 1}`,

            pageWidth - margin - 120,

            pageHeight - 22,

            { width: 120, align: "right" },

          );

      }

    };

    const drawKpi = (

      x: number,

      y: number,

      w: number,

      label: string,

      value: string,

      accent: string,

    ) => {

      doc

        .roundedRect(x, y, w, 62, 10)

        .fillAndStroke("#ffffff", "#e2e8f0");

      doc.roundedRect(x, y, 5, 62, 2).fill(accent);

      doc

        .fontSize(7)

        .fillColor("#64748b")

        .text(label, x + 14, y + 12, { width: w - 25 });

      doc

        .fontSize(16)

        .fillColor("#0f172a")

        .text(value, x + 14, y + 29, {

          width: w - 25,

          ellipsis: true,

        });

    };

    const drawHorizontalBars = (

      items: Array<{ label: string; value: number; suffix: string }>,

      x: number,

      y: number,

      w: number,

      title: string,

      accent: string,

    ) => {

      doc

        .fontSize(11)

        .fillColor("#0f172a")

        .text(title, x, y, { width: w });

      let cursor = y + 24;

      const max = Math.max(1, ...items.map((item) => item.value));

      items.forEach((item, index) => {

        const barWidth = Math.max(2, (item.value / max) * (w - 175));

        doc

          .fontSize(7)

          .fillColor("#475569")

          .text(`${index + 1}. ${item.label}`, x, cursor + 2, {

            width: 145,

            ellipsis: true,

          });

        doc

          .roundedRect(x + 150, cursor + 2, w - 175, 9, 4)

          .fill("#f1f5f9");

        doc

          .roundedRect(x + 150, cursor + 2, barWidth, 9, 4)

          .fill(accent);

        doc

          .fontSize(6.6)

          .fillColor("#334155")

          .text(

            `${item.value.toLocaleString("en-US", {

              maximumFractionDigits: 2,

            })} ${item.suffix}`,

            x + w - 120,

            cursor,

            { width: 120, align: "right" },

          );

        cursor += 24;

      });

      return cursor;

    };

    // ============================================================

    // PAGE 1 - EXECUTIVE SUMMARY

    // ============================================================

    drawBrand();

    doc

      .fontSize(24)

      .fillColor("#0f172a")

      .text("Resource Intelligence Report", margin, 62);

    doc

      .fontSize(10)

      .fillColor("#64748b")

      .text(

        `Reporting period ${from} - ${to}`,

        margin,

        96,

      );

    doc

      .fontSize(7.5)

      .fillColor("#94a3b8")

      .text(

        "Operational resource report generated from GreenFactory ResourceUsage records",

        margin,

        114,

      );

    const kpiY = 145;

    const gap = 10;

    const cardW = (contentWidth - gap * 3) / 4;

    drawKpi(

      margin,

      kpiY,

      cardW,

      "TOTAL RECORDS",

      summary.data.length.toLocaleString("en-US"),

      "#10b981",

    );

    drawKpi(

      margin + (cardW + gap),

      kpiY,

      cardW,

      "MACHINES WITH DATA",

      summary.uniqueMachines.toLocaleString("en-US"),

      "#0ea5e9",

    );

    drawKpi(

      margin + (cardW + gap) * 2,

      kpiY,

      cardW,

      "RESOURCE TYPES",

      summary.uniqueResources.toLocaleString("en-US"),

      "#8b5cf6",

    );

    drawKpi(

      margin + (cardW + gap) * 3,

      kpiY,

      cardW,

      "QR / MANUAL",

      `${summary.qrCount} / ${summary.manualCount}`,

      "#f59e0b",

    );

    const topResource = summary.resources[0];

    const topMachine = summary.machines[0];

    doc

      .roundedRect(margin, 225, contentWidth, 56, 10)

      .fillAndStroke("#0f172a", "#0f172a");

    doc

      .fontSize(7)

      .fillColor("#86efac")

      .text("MANAGEMENT SIGNAL", margin + 16, 238);

    doc

      .fontSize(10)

      .fillColor("#ffffff")

      .text(

        topResource

          ? `${topResource.name} is the largest recorded resource in this period. ${

              topMachine

                ? `${topMachine.name} has the highest combined recorded quantity across available units.`

                : ""

            }`

          : "No ResourceUsage records were found for the selected reporting period.",

        margin + 16,

        253,

        { width: contentWidth - 32, ellipsis: true },

      );

    drawHorizontalBars(

      summary.resources.slice(0, 6).map((item) => ({

        label: item.name,

        value: item.total,

        suffix: item.unit,

      })),

      margin,

      306,

      370,

      "Top Resource Consumers",

      "#10b981",

    );

    drawHorizontalBars(

      summary.machines.slice(0, 6).map((item) => ({

        label: item.name,

        value: item.total,

        suffix: "",

      })),

      margin + 405,

      306,

      368,

      "Top Machines by Recorded Quantity",

      "#6366f1",

    );

    // ============================================================

    // PAGE 2 - RESOURCE PROFILE

    // ============================================================

    doc.addPage();

    if (fontPath) doc.font(fontPath);

    drawBrand();

    doc

      .fontSize(18)

      .fillColor("#0f172a")

      .text("Resource Performance Profile", margin, 62);

    doc

      .fontSize(8)

      .fillColor("#64748b")

      .text(

        "Aggregated by resource type and unit. Different physical units are intentionally not summed together.",

        margin,

        88,

      );

    const tableX = margin;

    const tableY = 120;

    const widths = [220, 75, 150, 90, 150];

    const headers = ["Resource", "Unit", "Total", "Records", "Average / Record"];

    doc

      .rect(tableX, tableY, widths.reduce((a, b) => a + b, 0), 24)

      .fill("#0f172a");

    let hx = tableX;

    headers.forEach((header, i) => {

      doc

        .fontSize(7)

        .fillColor("#ffffff")

        .text(header, hx + 7, tableY + 8, {

          width: widths[i] - 14,

          ellipsis: true,

        });

      hx += widths[i];

    });

    let y = tableY + 24;

    summary.resources.slice(0, 16).forEach((item, index) => {

      if (index % 2 === 1) {

        doc

          .rect(tableX, y, widths.reduce((a, b) => a + b, 0), 24)

          .fill("#f8fafc");

      }

      const avg = item.count > 0 ? item.total / item.count : 0;

      const cells = [

        item.name,

        item.unit,

        item.total.toLocaleString("en-US", { maximumFractionDigits: 2 }),

        item.count.toLocaleString("en-US"),

        avg.toLocaleString("en-US", { maximumFractionDigits: 2 }),

      ];

      let cx = tableX;

      cells.forEach((cell, i) => {

        doc

          .fontSize(7)

          .fillColor("#334155")

          .text(String(cell), cx + 7, y + 8, {

            width: widths[i] - 14,

            ellipsis: true,

          });

        cx += widths[i];

      });

      y += 24;

    });

    // ============================================================

    // PAGE 3 - INPUT & DATA QUALITY PROFILE

    // ============================================================

    doc.addPage();

    if (fontPath) doc.font(fontPath);

    drawBrand();

    doc

      .fontSize(18)

      .fillColor("#0f172a")

      .text("Data Capture & Operational Traceability", margin, 62);

    doc

      .fontSize(8)

      .fillColor("#64748b")

      .text(

        "Shows how resource records entered the system and which machines contributed the most data.",

        margin,

        88,

      );

    drawKpi(

      margin,

      120,

      180,

      "QR RECORDS",

      summary.qrCount.toLocaleString("en-US"),

      "#10b981",

    );

    drawKpi(

      margin + 195,

      120,

      180,

      "MANUAL RECORDS",

      summary.manualCount.toLocaleString("en-US"),

      "#f59e0b",

    );

    drawKpi(

      margin + 390,

      120,

      180,

      "MACHINES",

      summary.uniqueMachines.toLocaleString("en-US"),

      "#6366f1",

    );

    drawKpi(

      margin + 585,

      120,

      188,

      "RESOURCE TYPES",

      summary.uniqueResources.toLocaleString("en-US"),

      "#0ea5e9",

    );

    drawHorizontalBars(

      summary.machines.slice(0, 10).map((item) => ({

        label: item.name,

        value: item.count,

        suffix: "records",

      })),

      margin,

      220,

      contentWidth,

      "Machines with Most Resource Records",

      "#0ea5e9",

    );

    // ============================================================

    // APPENDIX - RAW DATA

    // ============================================================

    doc.addPage();

    if (fontPath) doc.font(fontPath);

    drawBrand();

    doc

      .fontSize(16)

      .fillColor("#0f172a")

      .text("Appendix - Raw ResourceUsage Records", margin, 62);

    doc

      .fontSize(7.5)

      .fillColor("#64748b")

      .text(

        `Raw records: ${summary.data.length}. This appendix preserves traceability to the source data.`,

        margin,

        86,

      );

    const rawTableX = margin;

    const rawWidths = [78, 85, 115, 58, 42, 115, 95, 72, 72];

    const rawHeaders = [

      "Date",

      "Resource",

      "Machine",

      "Qty",

      "Unit",

      "Department",

      "Line",

      "Source",

      "Status",

    ];

    const drawRawHeader = () => {

      const y0 = doc.y;

      doc

        .rect(

          rawTableX,

          y0,

          rawWidths.reduce((a, b) => a + b, 0),

          22,

        )

        .fill("#0f172a");

      let x0 = rawTableX;

      rawHeaders.forEach((header, i) => {

        doc

          .fontSize(6.5)

          .fillColor("#ffffff")

          .text(header, x0 + 5, y0 + 7, {

            width: rawWidths[i] - 10,

            ellipsis: true,

          });

        x0 += rawWidths[i];

      });

      doc.y = y0 + 22;

    };

    doc.y = 110;

    drawRawHeader();

    summary.data.forEach((row, index) => {

      if (doc.y > 530) {

        doc.addPage();

        if (fontPath) doc.font(fontPath);

        drawBrand();

        doc.y = 55;

        drawRawHeader();

      }

      const y0 = doc.y;

      const rowHeight = 20;

      if (index % 2 === 1) {

        doc

          .rect(

            rawTableX,

            y0,

            rawWidths.reduce((a, b) => a + b, 0),

            rowHeight,

          )

          .fill("#f8fafc");

      }

      const cells = [

        row.dateTime,

        row.resourceName,

        row.machineName || row.machineCode || "-",

        row.quantity.toLocaleString("en-US", {

          maximumFractionDigits: 2,

        }),

        row.unit,

        row.department || "-",

        row.productionLine || "-",

        row.source,

        row.processingStatus,

      ];

      let x0 = rawTableX;

      cells.forEach((cell, i) => {

        doc

          .fontSize(6.2)

          .fillColor("#334155")

          .text(String(cell), x0 + 5, y0 + 6, {

            width: rawWidths[i] - 10,

            height: 9,

            ellipsis: true,

          });

        x0 += rawWidths[i];

      });

      doc.y = y0 + rowHeight;

    });

    drawPageFooter();

    doc.end();

  });

}

async function requireManager() {

  const session = await getSession();

  if (!session) {

    return {

      error: Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 }),

    } as const;

  }

  if (session.roleName !== "MANAGER" || !session.companyId) {

    return {

      error: Response.json({ message: "ไม่มีสิทธิ์ใช้งาน" }, { status: 403 }),

    } as const;

  }

  return { session } as const;

}

async function getRows(companyId: number, from: string, to: string) {

  return prisma.resourceUsage.findMany({

    where: {

      companyId,

      status: "ACTIVE",

      usageAt: {

        gte: startOfBangkokDate(from),

        lte: endOfBangkokDate(to),

      },

    },

    orderBy: { usageAt: "desc" },

    select: {

      usageReference: true,

      usageAt: true,

      quantity: true,

      sourceType: true,

      processingStatus: true,

      remark: true,

      machine: {

        select: {

          machineCode: true,

          machineName: true,

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

      resourceType: {

        select: {

          resourceCode: true,

          resourceName: true,

        },

      },

      unit: {

        select: {

          symbol: true,

        },

      },

    },

  });

}

export async function POST(request: NextRequest) {

  const auth = await requireManager();

  if ("error" in auth) return auth.error;

  try {

    const body = (await request.json()) as {

      from?: string;

      to?: string;

      format?: ReportFormat;

    };

    if (!isValidDateKey(body.from ?? null) || !isValidDateKey(body.to ?? null)) {

      return Response.json(

        { message: "กรุณาระบุ from และ to เป็น YYYY-MM-DD" },

        { status: 400 },

      );

    }

    const format: ReportFormat = isValidFormat(body.format)

      ? body.format

      : "XLSX";

    const from = body.from!;

    const to = body.to!;

    if (startOfBangkokDate(from) > endOfBangkokDate(to)) {

      return Response.json(

        { message: "วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด" },

        { status: 400 },

      );

    }

    const rows = await getRows(auth.session.companyId!, from, to);

    const filterScope: FilterScope = { from, to, format };

    const report = await prisma.report.create({

      data: {

        companyId: auth.session.companyId!,

        factoryId: auth.session.factoryId ?? null,

        generatedBy: auth.session.userId,

        reportName: `Resource Usage ${from} - ${to}`,

        reportType: "RESOURCE_USAGE",

        reportFormat: format,

        filterScope: JSON.stringify(filterScope),

        periodStart: startOfBangkokDate(from),

        periodEnd: startOfBangkokDate(to),

        reportStatus: "COMPLETED",

        generatedAt: new Date(),

      },

      select: {

        reportId: true,

        reportName: true,

      },

    });

    const downloadUrl =

      `/api/manager/reports/resource-usage?reportId=${String(report.reportId)}`;

    await prisma.report.update({

      where: { reportId: report.reportId },

      data: { filePath: downloadUrl },

    });

    return Response.json({

      success: true,

      reportId: String(report.reportId),

      reportName: report.reportName,

      format,

      rowCount: rows.length,

      downloadUrl,

    });

  } catch (error) {

    console.error("Create resource usage report error:", error);

    return Response.json(

      { message: "สร้างรายงานไม่สำเร็จ" },

      { status: 500 },

    );

  }

}

export async function GET(request: NextRequest) {

  const auth = await requireManager();

  if ("error" in auth) return auth.error;

  try {

    const reportIdRaw = request.nextUrl.searchParams.get("reportId");

    if (!reportIdRaw || !/^\d+$/.test(reportIdRaw)) {

      return Response.json({ message: "ไม่พบ reportId" }, { status: 400 });

    }

    const reportId = BigInt(reportIdRaw);

    const report = await prisma.report.findFirst({

      where: {

        reportId,

        companyId: auth.session.companyId!,

        reportType: "RESOURCE_USAGE",

      },

      select: {

        reportId: true,

        reportName: true,

        reportFormat: true,

        filterScope: true,

      },

    });

    if (!report) {

      return Response.json({ message: "ไม่พบรายงาน" }, { status: 404 });

    }

    let scope: FilterScope | null = null;

    try {

      const parsed = report.filterScope

        ? (JSON.parse(report.filterScope) as Partial<FilterScope>)

        : null;

      if (

        parsed &&

        isValidDateKey(parsed.from ?? null) &&

        isValidDateKey(parsed.to ?? null)

      ) {

        scope = {

          from: parsed.from!,

          to: parsed.to!,

          format: isValidFormat(parsed.format)

            ? parsed.format

            : isValidFormat(report.reportFormat)

              ? report.reportFormat

              : "XLSX",

        };

      }

    } catch {

      scope = null;

    }

    if (!scope) {

      return Response.json(

        { message: "ข้อมูลช่วงเวลาของรายงานไม่สมบูรณ์" },

        { status: 422 },

      );

    }

    const rows = await getRows(

      auth.session.companyId!,

      scope.from,

      scope.to,

    );

    await prisma.report.update({

      where: { reportId: report.reportId },

      data: {

        downloadCount: {

          increment: 1,

        },

      },

    });

    const baseName =

      report.reportName

        .replace(/[^\w\u0E00-\u0E7F-]+/g, "_")

        .replace(/_+/g, "_")

        .replace(/^_|_$/g, "") || "resource_usage_report";

    if (scope.format === "PDF") {

      const pdf = await buildPdf(

        rows,

        report.reportName,

        scope.from,

        scope.to,

      );

      return new Response(new Uint8Array(pdf), {

        status: 200,

        headers: {

          "Content-Type": "application/pdf",

          "Content-Disposition": `attachment; filename="${baseName}.pdf"`,

          "Cache-Control": "no-store",

        },

      });

    }

    if (scope.format === "JSON") {

      const body = JSON.stringify(

        {

          reportName: report.reportName,

          generatedAt: new Date().toISOString(),

          period: { from: scope.from, to: scope.to },

          rowCount: rows.length,

          data: normalizedRows(rows),

        },

        null,

        2,

      );

      return new Response(body, {

        status: 200,

        headers: {

          "Content-Type": "application/json; charset=utf-8",

          "Content-Disposition": `attachment; filename="${baseName}.json"`,

          "Cache-Control": "no-store",

        },

      });

    }

    if (scope.format === "XLSX") {

      const buffer = await buildXlsx(rows, report.reportName, scope.from, scope.to);

      return new Response(buffer, {

        status: 200,

        headers: {

          "Content-Type":

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,

          "Cache-Control": "no-store",

        },

      });

    }

    const csv = buildCsv(rows);

    return new Response(csv, {

      status: 200,

      headers: {

        "Content-Type": "text/csv; charset=utf-8",

        "Content-Disposition": `attachment; filename="${baseName}.csv"`,

        "Cache-Control": "no-store",

      },

    });

  } catch (error) {

    console.error("Download resource usage report error:", error);

    return Response.json(

      { message: "ดาวน์โหลดรายงานไม่สำเร็จ" },

    );

  }

}
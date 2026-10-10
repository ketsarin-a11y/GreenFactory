import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

import { getSession } from "@/lib/session";
import {
  computeResourceMetrics,
  getCarbonFootprint,
  ENERGY_TYPES,
  WATER_TYPES,
} from "@/lib/manager queries";
import { RESOURCE_META } from "@/lib/resource-meta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidDateInput(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00`))
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(value);
}

function drawDivider(doc: PDFKit.PDFDocument) {
  const y = doc.y + 5;
  doc
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.8);
}

function ensureSpace(doc: PDFKit.PDFDocument, needed = 90) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    if (session.roleName !== "MANAGER") {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลบริษัทของผู้ใช้งาน" },
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

    const regularFont = path.join(
      process.cwd(),
      "public",
      "fonts",
      "NotoSansThai-Regular.ttf"
    );

    const boldFont = path.join(
      process.cwd(),
      "public",
      "fonts",
      "NotoSansThai-Bold.ttf"
    );

    if (!fs.existsSync(regularFont) || !fs.existsSync(boldFont)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่พบฟอนต์ PDF กรุณาเพิ่ม NotoSansThai-Regular.ttf และ NotoSansThai-Bold.ttf ใน public/fonts",
        },
        { status: 500 }
      );
    }

    const startDate = new Date(`${from}T00:00:00`);
    const endDate = new Date(`${to}T23:59:59.999`);

    const [energy, water, carbon] = await Promise.all([
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
        "m³"
      ),
      getCarbonFootprint(session.companyId, startDate, endDate),
    ]);

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 48,
        bottom: 48,
        left: 50,
        right: 50,
      },
      info: {
        Title: `GreenFactory Executive Summary ${from} - ${to}`,
        Author: "GreenFactory Insight",
        Subject: "Industrial Sustainability Executive Summary",
      },
      bufferPages: true,
    });

    doc.registerFont("Thai", regularFont);
    doc.registerFont("ThaiBold", boldFont);

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    const completed = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    doc
      .font("ThaiBold")
      .fontSize(22)
      .text("GreenFactory Insight", {
        align: "left",
      });

    doc
      .font("Thai")
      .fontSize(11)
      .text("รายงานสรุปด้านพลังงาน ทรัพยากร และคาร์บอนสำหรับผู้บริหาร");

    doc.moveDown(0.4);

    doc
      .font("Thai")
      .fontSize(10)
      .text(`ช่วงข้อมูล: ${from} ถึง ${to}`);

    drawDivider(doc);

    doc
      .font("ThaiBold")
      .fontSize(16)
      .text("ภาพรวม");

    doc.moveDown(0.6);

    const summary = [
      {
        label: "การใช้พลังงานรวม",
        value: `${formatNumber(Number(energy.total))} ${energy.unit}`,
        change: `${formatNumber(Number(energy.changePct))}%`,
      },
      {
        label: "การใช้น้ำรวม",
        value: `${formatNumber(Number(water.total))} ${water.unit}`,
        change: `${formatNumber(Number(water.changePct))}%`,
      },
      {
        label: "Carbon Footprint",
        value: `${formatNumber(Number(carbon.totalKgCO2e))} kgCO2e`,
        change: `${formatNumber(Number(carbon.changePct))}%`,
      },
    ];

    for (const item of summary) {
      ensureSpace(doc, 55);

      doc
        .font("ThaiBold")
        .fontSize(11)
        .text(item.label);

      doc
        .font("Thai")
        .fontSize(12)
        .text(item.value);

      doc
        .font("Thai")
        .fontSize(9)
        .text(`เปลี่ยนแปลงจากช่วงก่อนหน้า: ${item.change}`);

      doc.moveDown(0.7);
    }

    drawDivider(doc);

    doc
      .font("ThaiBold")
      .fontSize(15)
      .text("การใช้พลังงานแยกตามแผนก");

    doc.moveDown(0.6);

    if (energy.breakdown.length === 0) {
      doc
        .font("Thai")
        .fontSize(10)
        .text("ไม่พบข้อมูลพลังงานแยกตามแผนกในช่วงเวลาที่เลือก");
    } else {
      energy.breakdown.forEach((item, index) => {
        ensureSpace(doc, 35);

        doc
          .font("Thai")
          .fontSize(10)
          .text(
            `${index + 1}. ${item.department}  ${formatNumber(
              Number(item.value)
            )} kWh  (${formatNumber(Number(item.percent))}%)`
          );
      });
    }

    doc.moveDown(0.8);
    drawDivider(doc);

    doc
      .font("ThaiBold")
      .fontSize(15)
      .text("Carbon Footprint แยกตามประเภททรัพยากร");

    doc.moveDown(0.6);

    if (carbon.breakdown.length === 0) {
      doc
        .font("Thai")
        .fontSize(10)
        .text("ไม่พบข้อมูล Carbon Footprint ในช่วงเวลาที่เลือก");
    } else {
      carbon.breakdown.forEach((item, index) => {
        ensureSpace(doc, 55);

        const resourceLabel =
          RESOURCE_META[item.resourceType]?.label ?? item.resourceType;

        doc
          .font("ThaiBold")
          .fontSize(10)
          .text(`${index + 1}. ${resourceLabel}`);

        doc
          .font("Thai")
          .fontSize(9)
          .text(
            `Scope: ${item.scope} | ปริมาณการใช้: ${formatNumber(
              Number(item.usageValue)
            )} ${item.unit}`
          );

        doc
          .font("Thai")
          .fontSize(9)
          .text(
            `Carbon: ${formatNumber(
              Number(item.carbonKg)
            )} kgCO2e | สัดส่วน: ${formatNumber(Number(item.percent))}%`
          );

        doc.moveDown(0.5);
      });
    }

    doc.moveDown(0.7);
    drawDivider(doc);

    ensureSpace(doc, 90);

    doc
      .font("ThaiBold")
      .fontSize(11)
      .text("หมายเหตุ");

    doc
      .font("Thai")
      .fontSize(9)
      .text(
        "ตัวคูณการปล่อยคาร์บอนเป็นค่าประมาณการทั่วไป ไม่ใช่ค่าที่บริษัทยืนยันอย่างเป็นทางการ ห้ามใช้อ้างอิงในรายงาน audit จริง",
        {
          align: "left",
        }
      );

    const range = doc.bufferedPageRange();

    for (
      let pageIndex = range.start;
      pageIndex < range.start + range.count;
      pageIndex += 1
    ) {
      doc.switchToPage(pageIndex);

      const pageNumber = pageIndex - range.start + 1;

      doc
        .font("Thai")
        .fontSize(8)
        .text(
          `GreenFactory Insight | หน้า ${pageNumber} จาก ${range.count}`,
          50,
          doc.page.height - 35,
          {
            width: doc.page.width - 100,
            align: "center",
            lineBreak: false,
          }
        );
    }

    doc.end();

    const pdfBuffer = await completed;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `attachment; filename="greenfactory-executive-summary-${from}-${to}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถสร้างไฟล์ PDF ได้",
      },
      { status: 500 }
    );
  }
}

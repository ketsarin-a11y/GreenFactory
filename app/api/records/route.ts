import { NextRequest, NextResponse } from "next/server";

import { createResourceUsage } from "@/lib/record-queries";
import { getSession } from "@/lib/session";

interface CreateResourceUsageBody {
  machineId?: number | null;
  checkpointId?: number | null;

  resourceTypeId?: number;
  unitId?: number;

  quantity?: number;
  usageAt?: string;

  qrScanId?: string | null;

  evidenceFilePath?: string | null;
  remark?: string | null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณาเข้าสู่ระบบ",
      },
      { status: 401 },
    );
  }

  if (session.roleName !== "OPERATOR") {
    return NextResponse.json(
      {
        success: false,
        message: "คุณไม่มีสิทธิ์บันทึกข้อมูลส่วนนี้",
      },
      { status: 403 },
    );
  }

  if (session.companyId === null) {
    return NextResponse.json(
      {
        success: false,
        message:
          "บัญชีผู้ใช้นี้ไม่ได้เชื่อมกับบริษัท จึงไม่สามารถบันทึกข้อมูลได้",
      },
      { status: 403 },
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as CreateResourceUsageBody | null;

  if (!body) {
    return NextResponse.json(
      {
        success: false,
        message: "รูปแบบข้อมูลไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  const machineId =
    typeof body.machineId === "number"
      ? body.machineId
      : null;

  const checkpointId =
    typeof body.checkpointId === "number"
      ? body.checkpointId
      : null;

  /*
   * ต้องเลือก Machine หรือ Checkpoint อย่างใดอย่างหนึ่ง
   */
  if (!machineId && !checkpointId) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณาเลือกเครื่องจักรหรือจุดตรวจ",
      },
      { status: 400 },
    );
  }

  if (machineId && checkpointId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่สามารถเลือกเครื่องจักรและจุดตรวจพร้อมกันได้",
      },
      { status: 400 },
    );
  }

  if (
    machineId !== null &&
    (!Number.isInteger(machineId) || machineId <= 0)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "รหัสเครื่องจักรไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  if (
    checkpointId !== null &&
    (!Number.isInteger(checkpointId) ||
      checkpointId <= 0)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "รหัสจุดตรวจไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  /*
   * Resource Type
   */
  if (
    typeof body.resourceTypeId !== "number" ||
    !Number.isInteger(body.resourceTypeId) ||
    body.resourceTypeId <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณาเลือกประเภททรัพยากร",
      },
      { status: 400 },
    );
  }

  /*
   * Unit
   */
  if (
    typeof body.unitId !== "number" ||
    !Number.isInteger(body.unitId) ||
    body.unitId <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "หน่วยวัดไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  /*
   * Quantity
   */
  if (
    typeof body.quantity !== "number" ||
    !Number.isFinite(body.quantity) ||
    body.quantity <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "ปริมาณการใช้ทรัพยากรต้องเป็นตัวเลขที่มากกว่า 0",
      },
      { status: 400 },
    );
  }

  /*
   * Usage date/time
   */
  if (!body.usageAt) {
    return NextResponse.json(
      {
        success: false,
        message: "กรุณาระบุวันที่และเวลา",
      },
      { status: 400 },
    );
  }

  const usageAt = new Date(body.usageAt);

  if (Number.isNaN(usageAt.getTime())) {
    return NextResponse.json(
      {
        success: false,
        message: "วันที่และเวลาไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  /*
   * QR Scan ID
   *
   * BigInt ส่งผ่าน JSON โดยตรงไม่ได้
   * Client จึงส่งมาเป็น string
   */
  let qrScanId: bigint | null = null;

  if (
    body.qrScanId !== undefined &&
    body.qrScanId !== null &&
    body.qrScanId !== ""
  ) {
    try {
      qrScanId = BigInt(body.qrScanId);

      if (qrScanId <= BigInt(0)) {
        throw new Error();
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลการสแกน QR Code ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }
  }

  /*
   * จำกัดขนาด String ก่อนเข้า DB
   */
  const evidenceFilePath =
    body.evidenceFilePath?.trim() || null;

  const remark =
    body.remark?.trim() || null;

  if (
    evidenceFilePath &&
    evidenceFilePath.length > 500
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "ที่อยู่ไฟล์หลักฐานยาวเกินกำหนด",
      },
      { status: 400 },
    );
  }

  if (remark && remark.length > 1000) {
    return NextResponse.json(
      {
        success: false,
        message:
          "หมายเหตุต้องมีความยาวไม่เกิน 1,000 ตัวอักษร",
      },
      { status: 400 },
    );
  }

  try {
    const usage = await createResourceUsage({
      companyId: session.companyId,
      recordedBy: session.userId,

      machineId,
      checkpointId,

      resourceTypeId: body.resourceTypeId,
      unitId: body.unitId,

      quantity: body.quantity,
      usageAt,

      qrScanId,

      evidenceFilePath,
      remark,
    });

    /*
     * BigInt ไม่สามารถ JSON.stringify ตรง ๆ
     * จึงแปลงกลับเป็น string
     */
    return NextResponse.json(
      {
        success: true,
        message: "บันทึกข้อมูลเรียบร้อยแล้ว",

        data: {
          usageId: usage.usageId.toString(),
          usageReference: usage.usageReference,

          machineId: usage.machineId,
          checkpointId: usage.checkpointId,

          resourceTypeId: usage.resourceTypeId,
          unitId: usage.unitId,

          quantity: Number(usage.quantity),

          qrScanId:
            usage.qrScanId?.toString() ?? null,

          evidenceFilePath:
            usage.evidenceFilePath,

          processingStatus:
            usage.processingStatus,

          createdAt:
            usage.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create ResourceUsage error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 },
    );
  }
}
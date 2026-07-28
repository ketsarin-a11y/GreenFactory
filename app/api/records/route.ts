import { NextRequest, NextResponse } from "next/server";

import { createResourceRecord } from "@/lib/record-queries";
import { getSession } from "@/lib/session";

interface CreateRecordBody {
  equipmentId?: number;
  value?: number;
  recordedAt?: string;
  note?: string;
  attachmentUrl?: string | null;
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
        message: "คุณไม่มีสิทธิ์ใช้งานส่วนนี้",
      },
      { status: 403 },
    );
  }

  if (session.companyId === null) {
    return NextResponse.json(
      {
        success: false,
        message: "บัญชีนี้ไม่ได้ผูกกับบริษัท ไม่สามารถบันทึกข้อมูลได้",
      },
      { status: 403 },
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as CreateRecordBody | null;

  if (
    !body ||
    typeof body.equipmentId !== "number" ||
    typeof body.value !== "number" ||
    !body.recordedAt
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "ข้อมูลไม่ครบถ้วน",
      },
      { status: 400 },
    );
  }

  if (!Number.isInteger(body.equipmentId) || body.equipmentId <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "อุปกรณ์ที่เลือกไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  if (!Number.isFinite(body.value) || body.value < 0) {
    return NextResponse.json(
      {
        success: false,
        message: "ปริมาณที่ใช้ต้องเป็นตัวเลขที่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  const recordedAt = new Date(body.recordedAt);

  if (Number.isNaN(recordedAt.getTime())) {
    return NextResponse.json(
      {
        success: false,
        message: "วันที่และเวลาไม่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  try {
    const record = await createResourceRecord({
      equipmentId: body.equipmentId,
      recordedById: session.userId,
      companyId: session.companyId,
      value: body.value,
      recordedAt,
      note: body.note?.trim() || undefined,
      attachmentUrl: body.attachmentUrl?.trim() || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "บันทึกข้อมูลเรียบร้อยแล้ว",
        recordId: record.recordId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create record error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 },
    );
  }
}
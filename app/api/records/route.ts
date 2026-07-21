import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createResourceRecord } from "@/lib/record-queries";

interface CreateRecordBody {
  equipmentId?: number;
  value?: number;
  recordedAt?: string; // ISO string จาก client เช่น "2026-05-19T10:30"
  note?: string;
  attachmentUrl?: string | null;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  if (user.companyId === null) {
    return NextResponse.json(
      { success: false, message: "บัญชีนี้ไม่ได้ผูกกับบริษัท ไม่สามารถบันทึกข้อมูลได้" },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as CreateRecordBody | null;

  if (!body || typeof body.equipmentId !== "number" || typeof body.value !== "number" || !body.recordedAt) {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  if (Number.isNaN(body.value) || body.value < 0) {
    return NextResponse.json({ success: false, message: "ปริมาณที่ใช้ต้องเป็นตัวเลขที่ถูกต้อง" }, { status: 400 });
  }

  const recordedAt = new Date(body.recordedAt);
  if (Number.isNaN(recordedAt.getTime())) {
    return NextResponse.json({ success: false, message: "วันที่และเวลาไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const record = await createResourceRecord({
      equipmentId: body.equipmentId,
      recordedById: user.id,
      companyId: user.companyId,
      value: body.value,
      recordedAt,
      note: body.note,
      attachmentUrl: body.attachmentUrl ?? null,
    });

    return NextResponse.json({ success: true, recordId: record.recordId });
  } catch (error) {
    console.error("Create record error:", error);
    const message = error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
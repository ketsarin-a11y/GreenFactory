import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { getSession } from "@/lib/session";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "records",
);

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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        message: "ไม่พบไฟล์ที่อัปโหลด",
      },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: "รองรับเฉพาะไฟล์ JPG, PNG และ PDF",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        message: "ขนาดไฟล์ต้องไม่เกิน 10MB",
      },
      { status: 400 },
    );
  }

  await mkdir(UPLOAD_DIR, {
    recursive: true,
  });

  const extension =
    path.extname(file.name) ||
    (file.type === "application/pdf" ? ".pdf" : ".jpg");

  const filename = `${session.userId}-${randomUUID()}${extension}`;

  const filePath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    url: `/uploads/records/${filename}`,
  });
}
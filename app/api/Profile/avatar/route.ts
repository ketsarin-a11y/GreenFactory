import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function extensionFor(type: string) {
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  return ".jpg";
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

  try {
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเลือกรูปโปรไฟล์",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "รองรับเฉพาะ JPG, PNG และ WEBP",
        },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB",
        },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        userId: session.userId,
      },
      select: {
        profileImagePath: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้งาน",
        },
        { status: 404 },
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profiles",
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const filename = `profile-${session.userId}-${randomUUID()}${extensionFor(
      file.type,
    )}`;

    const absolutePath = path.join(
      uploadDir,
      filename,
    );

    const buffer = Buffer.from(
      await file.arrayBuffer(),
    );

    await writeFile(
      absolutePath,
      buffer,
    );

    const avatarUrl = `/uploads/profiles/${filename}`;

    await prisma.user.update({
      where: {
        userId: session.userId,
      },
      data: {
        profileImagePath: avatarUrl,
      },
    });

    const previousPath =
      currentUser.profileImagePath;

    if (
      previousPath?.startsWith(
        "/uploads/profiles/",
      )
    ) {
      const previousFilename =
        path.basename(previousPath);

      const previousAbsolutePath =
        path.join(
          uploadDir,
          previousFilename,
        );

      if (
        previousAbsolutePath !==
        absolutePath
      ) {
        await unlink(
          previousAbsolutePath,
        ).catch(() => undefined);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว",
      avatarUrl,
    });
  } catch (error) {
    console.error(
      "Profile avatar upload error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่สามารถบันทึกรูปโปรไฟล์ได้",
      },
      { status: 500 },
    );
  }
}
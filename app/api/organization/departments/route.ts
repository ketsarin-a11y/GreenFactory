import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getDepartmentsByBuilding } from "@/lib/organization";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const buildingId = Number(
    request.nextUrl.searchParams.get("buildingId")
  );

  if (!Number.isInteger(buildingId) || buildingId <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "buildingId ไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const departments =
    await getDepartmentsByBuilding(buildingId);

  return NextResponse.json({
    success: true,
    data: departments,
  });
}
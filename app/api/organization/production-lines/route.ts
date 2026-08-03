import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getProductionLinesByDepartment } from "@/lib/organization";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const departmentId = Number(
    request.nextUrl.searchParams.get("departmentId")
  );

  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "departmentId ไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const productionLines =
    await getProductionLinesByDepartment(departmentId);

  return NextResponse.json({
    success: true,
    data: productionLines,
  });
}
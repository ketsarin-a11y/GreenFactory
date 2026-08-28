import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getMachinesByLine } from "@/lib/organization";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const lineId = Number(
    request.nextUrl.searchParams.get("lineId")
  );

  if (!Number.isInteger(lineId) || lineId <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "lineId ไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const machines = await getMachinesByLine(lineId);

  return NextResponse.json({
    success: true,
    data: machines,
  });
}
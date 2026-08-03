import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getBuildingsByFactory } from "@/lib/organization";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const factoryId = Number(
    request.nextUrl.searchParams.get("factoryId")
  );

  if (!Number.isInteger(factoryId) || factoryId <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "factoryId ไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const buildings = await getBuildingsByFactory(factoryId);

  return NextResponse.json({
    success: true,
    data: buildings,
  });
}
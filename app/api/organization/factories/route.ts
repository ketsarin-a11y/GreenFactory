import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getFactoriesByCompany } from "@/lib/organization";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!session.companyId) {
    return NextResponse.json({
      success: true,
      data: [],
    });
  }

  const factories = await getFactoriesByCompany(session.companyId);

  return NextResponse.json({
    success: true,
    data: factories,
  });
}
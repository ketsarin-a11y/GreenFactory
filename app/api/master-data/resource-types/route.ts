import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getActiveResourceTypes } from "@/lib/resource-master";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const resourceTypes = await getActiveResourceTypes();

  return NextResponse.json({
    success: true,
    data: resourceTypes,
  });
}
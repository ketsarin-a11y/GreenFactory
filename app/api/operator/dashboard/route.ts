import { NextResponse } from "next/server";

import {
  getRecentRecords,
  getTodayTaskSummary,
} from "@/lib/dashboard-queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  if (
    session.roleName !== "OPERATOR"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  if (!session.companyId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Operator account does not have a companyId",
      },
      {
        status: 400,
      },
    );
  }

  const [summary, records] =
    await Promise.all([
      getTodayTaskSummary(
        session.companyId,
      ),
      getRecentRecords(
        session.userId,
        5,
      ),
    ]);

  return NextResponse.json({
    success: true,
    data: {
      summary,
      records,
    },
  });
}
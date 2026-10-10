import { NextResponse } from "next/server";

import { analyzeResourceUsage } from "@/lib/anomaly-engine";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parseDate(
  value: string | null,
  endOfDay: boolean,
): Date | null {
  if (!value) {
    return null;
  }

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  if (dateOnlyPattern.test(value)) {
    const date = new Date(
      endOfDay
        ? `${value}T23:59:59.999`
        : `${value}T00:00:00.000`,
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseLimit(value: string | null): number | null {
  if (!value) {
    return DEFAULT_LIMIT;
  }

  const limit = Number(value);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    return null;
  }

  return limit;
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (session.roleName !== "MANAGER") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 },
    );
  }

  if (!session.companyId) {
    return NextResponse.json(
      {
        message:
          "Manager account does not have a companyId",
      },
      { status: 400 },
    );
  }

  const url = new URL(request.url);

  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const limitParam = url.searchParams.get("limit");

  const from = parseDate(fromParam, false);
  const to = parseDate(toParam, true);
  const limit = parseLimit(limitParam);

  if (fromParam && !from) {
    return NextResponse.json(
      {
        message:
          "Invalid from date. Use YYYY-MM-DD or a valid ISO date.",
      },
      { status: 400 },
    );
  }

  if (toParam && !to) {
    return NextResponse.json(
      {
        message:
          "Invalid to date. Use YYYY-MM-DD or a valid ISO date.",
      },
      { status: 400 },
    );
  }

  if (from && to && from > to) {
    return NextResponse.json(
      {
        message:
          "from date must be earlier than or equal to to date",
      },
      { status: 400 },
    );
  }

  if (limit === null) {
    return NextResponse.json(
      {
        message: `limit must be an integer between 1 and ${MAX_LIMIT}`,
      },
      { status: 400 },
    );
  }

  const usages = await prisma.resourceUsage.findMany({
    where: {
      companyId: session.companyId,
      status: "ACTIVE",
      usageAt:
        from || to
          ? {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            }
          : undefined,
      OR: [
        {
          machineId: {
            not: null,
          },
        },
        {
          checkpointId: {
            not: null,
          },
        },
      ],
    },
    orderBy: [
      {
        usageAt: "asc",
      },
      {
        usageId: "asc",
      },
    ],
    take: limit,
    select: {
      usageId: true,
      usageReference: true,
      usageAt: true,
    },
  });

  let createdAlerts = 0;
  let existingAlerts = 0;
  let skipped = 0;

  const skipReasons: Record<string, number> = {};

  const errors: Array<{
    usageId: string;
    usageReference: string;
    message: string;
  }> = [];

  const created: Array<{
    usageId: string;
    usageReference: string;
    alertId: string;
  }> = [];

  for (const usage of usages) {
    try {
      const result = await analyzeResourceUsage(
        usage.usageId,
      );

      if (result.created) {
        createdAlerts += 1;

        created.push({
          usageId: usage.usageId.toString(),
          usageReference: usage.usageReference,
          alertId: result.alertId ?? "",
        });

        continue;
      }

      if (result.reason === "Alert already exists") {
        existingAlerts += 1;
        continue;
      }

      skipped += 1;

      const reason =
        result.reason?.trim() || "Unknown skip reason";

      skipReasons[reason] =
        (skipReasons[reason] ?? 0) + 1;
    } catch (error) {
      console.error(
        `Historical anomaly backfill failed for usage ${usage.usageId.toString()}:`,
        error,
      );

      errors.push({
        usageId: usage.usageId.toString(),
        usageReference: usage.usageReference,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: errors.length === 0,

    companyId: session.companyId,

    filters: {
      from: from?.toISOString() ?? null,
      to: to?.toISOString() ?? null,
      limit,
    },

    summary: {
      scanned: usages.length,
      createdAlerts,
      existingAlerts,
      skipped,
      errors: errors.length,
      skipReasons,
    },

    created,
    errors,
  });
}
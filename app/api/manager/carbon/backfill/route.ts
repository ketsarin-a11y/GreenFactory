import { NextResponse } from "next/server";

import { processResourceUsageCarbon } from "@/lib/carbon-engine";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

type BackfillBody = {
  from?: string;
  to?: string;
  limit?: number;
  factoryId?: number;
};

type ErrorItem = {
  usageId: string;
  message: string;
};

function parseDate(
  value: string | undefined,
  fieldName: "from" | "to",
): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} date`);
  }

  return parsed;
}

function parseLimit(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_LIMIT
  ) {
    throw new Error(
      `limit must be an integer between 1 and ${MAX_LIMIT}`,
    );
  }

  return value;
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

  let body: BackfillBody;

  try {
    body = (await request.json()) as BackfillBody;
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  let from: Date | null;
  let to: Date | null;
  let limit: number;

  try {
    from = parseDate(body.from, "from");
    to = parseDate(body.to, "to");
    limit = parseLimit(body.limit);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Invalid request",
      },
      { status: 400 },
    );
  }

  if (from && to && from > to) {
    return NextResponse.json(
      {
        message: "from must be before or equal to to",
      },
      { status: 400 },
    );
  }

  /*
   * Optional factory filter.
   *
   * Important:
   * A Manager may only target a factory belonging to the
   * Manager's own company.
   */
  if (body.factoryId !== undefined) {
    if (
      !Number.isInteger(body.factoryId) ||
      body.factoryId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid factoryId" },
        { status: 400 },
      );
    }

    const allowedFactory = await prisma.factory.findFirst({
      where: {
        factoryId: body.factoryId,
        companyId: session.companyId,
        status: "ACTIVE",
      },
      select: {
        factoryId: true,
      },
    });

    if (!allowedFactory) {
      return NextResponse.json(
        {
          message:
            "Factory not found or does not belong to your company",
        },
        { status: 404 },
      );
    }
  }

  /*
   * ResourceUsage is always scoped to the authenticated company.
   *
   * We process only ACTIVE resources whose ResourceType explicitly
   * allows carbon calculation.
   *
   * Already calculated rows are excluded here for efficiency.
   * processResourceUsageCarbon() still has its own idempotency guard,
   * so this endpoint does not become the source of truth for duplicate
   * protection.
   */
  const usages = await prisma.resourceUsage.findMany({
    where: {
      companyId: session.companyId,
      status: "ACTIVE",

      ...(body.factoryId !== undefined
        ? {
            factoryId: body.factoryId,
          }
        : {}),

      ...(from || to
        ? {
            usageAt: {
              ...(from
                ? {
                    gte: from,
                  }
                : {}),
              ...(to
                ? {
                    lte: to,
                  }
                : {}),
            },
          }
        : {}),

      resourceType: {
        carbonCalculable: true,
        status: "ACTIVE",
      },

      carbonResults: {
        none: {
          calculationStatus: "CALCULATED",
        },
      },
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
      resourceTypeId: true,
    },
  });

  let created = 0;
  let reused = 0;

  let skippedNotCalculable = 0;
  let skippedNoFactor = 0;
  let skippedUnitMismatch = 0;

  const errors: ErrorItem[] = [];

  for (const usage of usages) {
    try {
      const result =
        await processResourceUsageCarbon(usage.usageId);

      if (result.skipped) {
        switch (result.reason) {
          case "RESOURCE_NOT_CARBON_CALCULABLE":
            skippedNotCalculable += 1;
            break;

          case "NO_ACTIVE_EMISSION_FACTOR":
            skippedNoFactor += 1;
            break;

          case "INCOMPATIBLE_FACTOR_UNIT":
            skippedUnitMismatch += 1;
            break;
        }

        continue;
      }

      if (result.created) {
        created += 1;
      } else {
        reused += 1;
      }
    } catch (error) {
      errors.push({
        usageId: usage.usageId.toString(),
        message:
          error instanceof Error
            ? error.message
            : "Unknown carbon processing error",
      });
    }
  }

  /*
   * Count remaining eligible rows after this batch.
   *
   * This is useful for controlled backfill runs:
   * 50 -> verify -> next 50 -> verify.
   */
  const remaining = await prisma.resourceUsage.count({
    where: {
      companyId: session.companyId,
      status: "ACTIVE",

      ...(body.factoryId !== undefined
        ? {
            factoryId: body.factoryId,
          }
        : {}),

      ...(from || to
        ? {
            usageAt: {
              ...(from
                ? {
                    gte: from,
                  }
                : {}),
              ...(to
                ? {
                    lte: to,
                  }
                : {}),
            },
          }
        : {}),

      resourceType: {
        carbonCalculable: true,
        status: "ACTIVE",
      },

      carbonResults: {
        none: {
          calculationStatus: "CALCULATED",
        },
      },
    },
  });

  return NextResponse.json({
    success: errors.length === 0,

    scope: {
      companyId: session.companyId,
      factoryId: body.factoryId ?? null,
      from: from?.toISOString() ?? null,
      to: to?.toISOString() ?? null,
      limit,
    },

    summary: {
      scanned: usages.length,

      created,
      reused,

      skippedNotCalculable,
      skippedNoFactor,
      skippedUnitMismatch,

      failed: errors.length,
      remaining,
    },

    errors,
  });
}
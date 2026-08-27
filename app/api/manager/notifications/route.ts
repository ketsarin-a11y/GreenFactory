import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
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
      { message: "Manager account does not have a companyId" },
      { status: 400 },
    );
  }

  const alerts = await prisma.alert.findMany({
    where: {
      companyId: session.companyId,
      status: {
        in: ["OPEN", "ACKNOWLEDGED"],
      },
    },
    orderBy: [
      {
        triggeredAt: "desc",
      },
    ],
    take: 20,
    select: {
      alertId: true,
      alertCode: true,
      alertType: true,
      severity: true,
      title: true,
      message: true,
      status: true,
      triggeredAt: true,
      machine: {
        select: {
          machineName: true,
        },
      },
      department: {
        select: {
          departmentName: true,
        },
      },
      building: {
        select: {
          buildingName: true,
        },
      },
    },
  });

  const openCount = alerts.filter(
    (alert) => alert.status === "OPEN",
  ).length;

  return NextResponse.json({
    alerts: alerts.map((alert) => ({
      id: String(alert.alertId),
      alertCode: alert.alertCode,
      alertType: alert.alertType,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      status: alert.status,
      triggeredAt: alert.triggeredAt.toISOString(),
      machineName: alert.machine?.machineName ?? null,
      departmentName:
        alert.department?.departmentName ?? null,
      buildingName:
        alert.building?.buildingName ?? null,
    })),
    openCount,
  });
}

export async function PATCH(request: Request) {
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
      { message: "Manager account does not have a companyId" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    alertId?: string;
    acknowledgeAll?: boolean;
  };

  if (body.acknowledgeAll) {
    const result = await prisma.alert.updateMany({
      where: {
        companyId: session.companyId,
        status: "OPEN",
      },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  }

  if (!body.alertId) {
    return NextResponse.json(
      { message: "alertId is required" },
      { status: 400 },
    );
  }

  let alertId: bigint;

  try {
    alertId = BigInt(body.alertId);
  } catch {
    return NextResponse.json(
      { message: "Invalid alertId" },
      { status: 400 },
    );
  }

  const alert = await prisma.alert.findFirst({
    where: {
      alertId,
      companyId: session.companyId,
    },
    select: {
      alertId: true,
      status: true,
    },
  });

  if (!alert) {
    return NextResponse.json(
      { message: "Alert not found" },
      { status: 404 },
    );
  }

  if (alert.status === "OPEN") {
    await prisma.alert.update({
      where: {
        alertId,
      },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    id: String(alert.alertId),
  });
}

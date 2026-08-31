import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import {
  createQRScanLog,
  findActiveQRByToken,
} from "@/lib/qr-scan";

interface RouteProps {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteProps,
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบก่อนสแกน QR Code",
        },
        { status: 401 },
      );
    }

    if (session.roleName !== "OPERATOR") {
      return NextResponse.json(
        {
          success: false,
          message:
            "เฉพาะ Operator เท่านั้นที่สามารถสแกน QR เพื่อบันทึกข้อมูลหน้างานได้",
        },
        { status: 403 },
      );
    }

    if (
      session.companyId === null ||
      session.factoryId === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "บัญชี Operator นี้ยังไม่ได้กำหนดบริษัทหรือโรงงาน",
        },
        { status: 403 },
      );
    }

    const { token } = await params;
    const normalizedToken = decodeURIComponent(token).trim();

    if (!normalizedToken) {
      return NextResponse.json(
        {
          success: false,
          message: "QR token ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const qr = await findActiveQRByToken(normalizedToken);

    if (!qr) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่พบ QR Code นี้ในระบบ หรือ QR Code ถูกระงับ/ยกเลิกแล้ว",
        },
        { status: 404 },
      );
    }

    const target = qr.machine ?? qr.checkpoint;

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          message:
            "QR Code นี้ยังไม่ได้ผูกกับเครื่องจักรหรือจุดตรวจ",
        },
        { status: 422 },
      );
    }

    const line = target.productionLine;
    const department = line.department;
    const building = department.building;
    const factory = building.factory;

    if (factory.companyId !== session.companyId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "QR Code นี้เป็นของบริษัทอื่น คุณไม่มีสิทธิ์เข้าถึง",
        },
        { status: 403 },
      );
    }

    if (factory.factoryId !== session.factoryId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "QR Code นี้เป็นของโรงงานอื่น คุณไม่มีสิทธิ์เข้าถึง",
        },
        { status: 403 },
      );
    }

    const forwardedFor =
      request.headers.get("x-forwarded-for");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip");

    const scanLog = await createQRScanLog({
      qrId: qr.qrId,
      userId: session.userId,
      scanResult: "SUCCESS",
      ipAddress,
      userAgent: request.headers.get("user-agent"),
    });

    if (qr.machine) {
      return NextResponse.json({
        success: true,
        data: {
          targetType: "MACHINE",
          scanId: scanLog.scanId.toString(),
          qrId: qr.qrId.toString(),
          token: qr.qrToken,

          machine: {
            machineId: qr.machine.machineId,
            machineCode: qr.machine.machineCode,
            machineName: qr.machine.machineName,
            operationalStatus:
              qr.machine.operationalStatus,
            machineType:
              qr.machine.machineType.machineTypeName,
          },

          organization: {
            factoryId: factory.factoryId,
            factoryName: factory.factoryName,
            buildingId: building.buildingId,
            buildingName: building.buildingName,
            departmentId: department.departmentId,
            departmentName: department.departmentName,
            lineId: line.lineId,
            lineName: line.lineName,
          },
        },
      });
    }

    if (qr.checkpoint) {
      return NextResponse.json({
        success: true,
        data: {
          targetType: "CHECKPOINT",
          scanId: scanLog.scanId.toString(),
          qrId: qr.qrId.toString(),
          token: qr.qrToken,

          checkpoint: {
            checkpointId: qr.checkpoint.checkpointId,
            checkpointCode: qr.checkpoint.checkpointCode,
            checkpointName: qr.checkpoint.checkpointName,
            checkpointType: qr.checkpoint.checkpointType,
          },

          organization: {
            factoryId: factory.factoryId,
            factoryName: factory.factoryName,
            buildingId: building.buildingId,
            buildingName: building.buildingName,
            departmentId: department.departmentId,
            departmentName: department.departmentName,
            lineId: line.lineId,
            lineName: line.lineName,
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "QR Code นี้ยังไม่ได้ผูกกับเครื่องจักรหรือจุดตรวจ",
      },
      { status: 422 },
    );
  } catch (error) {
    console.error("QR scan API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "ระบบไม่สามารถตรวจสอบ QR Code ได้ กรุณาตรวจสอบ Terminal",
      },
      { status: 500 },
    );
  }
}
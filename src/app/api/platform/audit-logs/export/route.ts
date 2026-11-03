import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth/current-user";
import { exportAuditLogs } from "@/server/queries/platform/logs";
import { csvResponse, toCsv } from "@/server/queries/platform/common";
import { fmtDateTime } from "@/lib/time";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "PLATFORM_ADMIN") return new Response("Forbidden", { status: 403 });
  const rows = await exportAuditLogs(Object.fromEntries(req.nextUrl.searchParams));
  const csv = toCsv(
    ["เวลา", "ผู้ใช้", "อีเมล", "บทบาท", "การกระทำ", "ตาราง", "รหัสอ้างอิง", "IP", "User agent", "ข้อมูลเดิม", "ข้อมูลใหม่"],
    rows.map((a) => [fmtDateTime(a.createdAt), a.userName ?? "ระบบ", a.userEmail, a.role, a.action, a.tableName, a.recordId, a.ipAddress, a.userAgent, a.oldData, a.newData]),
  );
  return csvResponse(csv, "greenfactory-audit-log.csv");
}

import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth/current-user";
import { exportLoginLogs } from "@/server/queries/platform/logs";
import { csvResponse, toCsv } from "@/server/queries/platform/common";
import { LOGIN_FAILURE_LABEL } from "@/server/domain/user-agent";
import { fmtDateTime } from "@/lib/time";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "PLATFORM_ADMIN") return new Response("Forbidden", { status: 403 });
  const rows = await exportLoginLogs(Object.fromEntries(req.nextUrl.searchParams));
  const csv = toCsv(
    ["เวลา", "ผู้ใช้", "อีเมลที่ใช้", "บทบาท", "บริษัท", "สถานะ", "เหตุผล", "IP", "ระบบปฏิบัติการ", "เบราว์เซอร์", "อุปกรณ์", "ออกจากระบบ"],
    rows.map((l) => [
      fmtDateTime(l.loginAt),
      l.userName,
      l.email,
      l.role,
      l.company,
      l.status,
      l.failureReason ? (LOGIN_FAILURE_LABEL[l.failureReason] ?? l.failureReason) : "",
      l.ipAddress,
      l.os,
      l.browser,
      l.device,
      l.logoutAt ? fmtDateTime(l.logoutAt) : "",
    ]),
  );
  return csvResponse(csv, "greenfactory-login-log.csv");
}

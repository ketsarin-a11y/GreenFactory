import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth/current-user";
import { exportCompanies } from "@/server/queries/platform/companies";
import { csvResponse, toCsv } from "@/server/queries/platform/common";
import { bkkDay } from "@/lib/time";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "PLATFORM_ADMIN") return new Response("Forbidden", { status: 403 });
  const rows = await exportCompanies(Object.fromEntries(req.nextUrl.searchParams));
  const csv = toCsv(
    ["รหัส", "ชื่อบริษัท", "อีเมล", "โทรศัพท์", "จังหวัด", "อุตสาหกรรม", "แพ็กเกจ", "โรงงาน", "ผู้ใช้", "เครื่องจักร", "สถานะ", "สร้างเมื่อ (วันที่ไทย)"],
    rows.map((c) => [c.companyCode, c.companyName, c.email, c.phone, c.province, c.industryType, c.subscriptionPlan, c._count.factories, c._count.users, c.machines, c.status, bkkDay(c.createdAt)]),
  );
  return csvResponse(csv, "greenfactory-companies.csv");
}

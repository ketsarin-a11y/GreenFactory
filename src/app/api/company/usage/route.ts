import { getCurrentUser } from "@/server/auth/current-user";
import { db } from "@/server/db";
import { usageFilter, usageInclude, usageRow } from "@/server/queries/company/usage";
import { SOURCE_LABEL } from "@/components/company/labels";
import { bkkStamp, csvResponse, round3 } from "../_csv";

const MAX = 50_000;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY_ADMIN") return new Response(null, { status: 401 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const { where, from, to } = usageFilter(user, sp);
  const rows = (await db.resourceUsage.findMany({ where, include: usageInclude, orderBy: { usageAt: "asc" }, take: MAX })).map(usageRow);
  return csvResponse(
    `usage_${from}_${to}.csv`,
    ["วันเวลา (เวลาไทย)", "เลขอ้างอิง", "โรงงาน", "เป้าหมาย", "ทรัพยากร", "ปริมาณ", "หน่วย", "คาร์บอน (kgCO2e)", "แหล่งที่มา", "ผู้บันทึก", "สถานะประมวลผล", "หมายเหตุ"],
    rows.map((r) => [bkkStamp(r.usageAt), r.reference, r.factory, r.target, r.resource, r.quantity, r.unit, r.carbonKg === null ? "" : round3(r.carbonKg), SOURCE_LABEL[r.source] ?? r.source, r.recorder, r.processing, r.remark]),
  );
}

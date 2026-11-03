import { getCurrentUser } from "@/server/auth/current-user";
import { db } from "@/server/db";
import { historyInclude, historyWhere, parseHistoryFilters } from "@/server/queries/operator";
import { bkkLocalInput } from "@/server/domain/qr-scan";
import { bkkDay } from "@/lib/time";

const MAX_ROWS = 20_000;

/** Quotes a CSV cell and defuses spreadsheet formulas (=, +, -, @ at the start). */
const cell = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
};

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OPERATOR" || !user.companyId) return new Response(null, { status: 401 });
  const filters = parseHistoryFilters(Object.fromEntries(new URL(req.url).searchParams));
  const rows = await db.resourceUsage.findMany({
    where: historyWhere(user, filters),
    include: historyInclude,
    orderBy: [{ usageAt: "desc" }, { usageId: "desc" }],
    take: MAX_ROWS,
  });

  const header = ["Reference", "DateTime (Asia/Bangkok)", "Machine/Checkpoint", "Code", "Resource", "Quantity", "Unit", "Recorder", "Source", "QR Scan ID", "Processing", "Evidence", "Remark"];
  const lines = rows.map((r) =>
    [
      r.usageReference,
      bkkLocalInput(r.usageAt).replace("T", " "),
      r.machine?.machineName ?? r.checkpoint?.checkpointName ?? "",
      r.machine?.machineCode ?? r.checkpoint?.checkpointCode ?? "",
      r.resourceType.resourceName,
      r.quantity.toString(),
      r.unit.symbol,
      `${r.recorder.firstName} ${r.recorder.lastName}`,
      r.sourceType,
      r.qrScanId?.toString() ?? "",
      r.processingStatus,
      r.evidenceFilePath ? "YES" : "",
      r.remark ?? "",
    ].map(cell).join(","),
  );
  const body = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="resource-usage-history-${bkkDay(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

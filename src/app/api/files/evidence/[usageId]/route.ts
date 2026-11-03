import { getCurrentUser } from "@/server/auth/current-user";
import { db } from "@/server/db";
import { ownedWhere } from "@/server/scope";
import { readStoredFile } from "@/server/storage";

export async function GET(_req: Request, ctx: RouteContext<"/api/files/evidence/[usageId]">) {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return new Response(null, { status: 401 });
  const raw = (await ctx.params).usageId;
  if (!/^\d+$/.test(raw)) return new Response(null, { status: 404 });
  const usage = await db.resourceUsage.findFirst({
    where: { usageId: BigInt(raw), ...ownedWhere(user), status: "ACTIVE" },
    select: { evidenceFilePath: true },
  });
  if (!usage?.evidenceFilePath) return new Response(null, { status: 404 });
  const f = await readStoredFile(usage.evidenceFilePath).catch(() => null);
  if (!f) return new Response(null, { status: 404 });
  return new Response(f.buf, {
    headers: { "Content-Type": f.kind, "Cache-Control": "private, max-age=60", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" },
  });
}

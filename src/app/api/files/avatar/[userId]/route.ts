import { getCurrentUser } from "@/server/auth/current-user";
import { db } from "@/server/db";
import { readStoredFile } from "@/server/storage";

export async function GET(_req: Request, ctx: RouteContext<"/api/files/avatar/[userId]">) {
  const viewer = await getCurrentUser();
  if (!viewer) return new Response(null, { status: 401 });
  const userId = Number((await ctx.params).userId);
  const u = Number.isInteger(userId) ? await db.user.findUnique({ where: { userId }, select: { profileImagePath: true, companyId: true } }) : null;
  // Same company (or platform admin) only.
  if (!u?.profileImagePath || (viewer.role !== "PLATFORM_ADMIN" && u.companyId !== viewer.companyId && userId !== viewer.id))
    return new Response(null, { status: 404 });
  const f = await readStoredFile(u.profileImagePath).catch(() => null);
  if (!f) return new Response(null, { status: 404 });
  return new Response(f.buf, { headers: { "Content-Type": f.kind, "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" } });
}

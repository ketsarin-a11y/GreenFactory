import { getCurrentUser } from "@/server/auth/current-user";
import { db } from "@/server/db";
import { readStoredFile } from "@/server/storage";

/** The signed-in user's own company logo (any role of that company). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.companyId) return new Response(null, { status: 401 });
  const c = await db.company.findUnique({ where: { companyId: user.companyId }, select: { logoPath: true } });
  const f = c?.logoPath ? await readStoredFile(c.logoPath).catch(() => null) : null;
  if (!f) return new Response(null, { status: 404 });
  return new Response(f.buf, { headers: { "Content-Type": f.kind, "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" } });
}

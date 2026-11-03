import { getCurrentUser } from "@/server/auth/current-user";
import { sensorReadings24h } from "@/server/queries/company/sensors";

/** Last 24 h of one sensor's readings (10-minute averages) for the sensor detail sheet. */
export async function GET(_req: Request, ctx: RouteContext<"/api/company/sensors/[id]/readings">) {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY_ADMIN") return new Response(null, { status: 401 });
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response(null, { status: 404 });
  const data = await sensorReadings24h(user, id);
  if (!data) return new Response(null, { status: 404 });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}

import { redirect } from "next/navigation";
import ManagerCarbonIntelligencePage from "@/components/manager/ManagerCarbonIntelligencePage";
import { getCarbonFootprint } from "@/lib/manager queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function dateAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default async function CarbonPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.roleName !== "MANAGER") redirect("/");
  if (!session.companyId) redirect("/");

  const p = await searchParams;
  const from = p.from ?? dateAgo(6);
  const to = p.to ?? dateAgo(0);
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T23:59:59`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    redirect("/manager/overview/carbon");
  }

  const carbon = await getCarbonFootprint(session.companyId, start, end);

  return <ManagerCarbonIntelligencePage carbon={carbon} dateFrom={from} dateTo={to} />;
}

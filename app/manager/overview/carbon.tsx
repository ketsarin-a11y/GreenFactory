import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getCarbonFootprint } from "@/lib/manager queries";
import CarbonPage from "@/components/manager/CarbonPage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ManagerCarbonPage({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session || session.roleName !== "MANAGER" || !session.companyId) {
    redirect("/login");
  }
  const params = await searchParams;
  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  const data = await getCarbonFootprint(session.companyId!, new Date(`${fromStr}T00:00:00`), new Date(`${toStr}T00:00:00`));

  return <CarbonPage data={data} dateFrom={fromStr} dateTo={toStr} />;
}




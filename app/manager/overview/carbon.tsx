import { getCurrentUser } from "@/lib/auth";
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
  const user = await getCurrentUser();
  const params = await searchParams;
  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  const data = await getCarbonFootprint(user!.companyId, new Date(`${fromStr}T00:00:00`), new Date(`${toStr}T00:00:00`));

  return <CarbonPage data={data} dateFrom={fromStr} dateTo={toStr} />;
}
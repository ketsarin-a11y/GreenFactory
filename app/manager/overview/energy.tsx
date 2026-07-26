import { Zap } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { computeResourceMetrics, ENERGY_TYPES } from "@/lib/manager queries";
import ResourceDetailPage from "@/components/manager/ResourceDetailPage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function EnergyPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  const data = await computeResourceMetrics(
    user!.companyId,
    ENERGY_TYPES,
    new Date(`${fromStr}T00:00:00`),
    new Date(`${toStr}T00:00:00`),
    "kWh",
  );

  return <ResourceDetailPage title="พลังงาน" icon={<Zap size={24} />} data={data} dateFrom={fromStr} dateTo={toStr} />;
}
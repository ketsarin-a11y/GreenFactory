import { Droplet } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { computeResourceMetrics, WATER_TYPES } from "@/lib/manager queries";
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

export default async function WaterPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  const data = await computeResourceMetrics(
    user!.companyId,
    WATER_TYPES,
    new Date(`${fromStr}T00:00:00`),
    new Date(`${toStr}T00:00:00`),
    "m³",
  );

  return <ResourceDetailPage title="น้ำ" icon={<Droplet size={24} />} data={data} dateFrom={fromStr} dateTo={toStr} />;
}
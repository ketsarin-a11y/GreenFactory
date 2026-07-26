import { getCurrentUser } from "@/lib/auth";
import ReportsPage from "@/components/manager/ReportsPage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ManagerReportsPage({ searchParams }: PageProps) {
  await getCurrentUser();
  const params = await searchParams;
  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  return <ReportsPage dateFrom={fromStr} dateTo={toStr} />;
}
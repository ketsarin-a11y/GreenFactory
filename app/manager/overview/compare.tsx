import { getCurrentUser } from "@/lib/auth";
import { getComparisonMetrics } from "@/lib/manager queries";
import ComparePage from "@/components/manager/ComparePage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ fromA?: string; toA?: string; fromB?: string; toB?: string }>;
}

export default async function ManagerComparePage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  const fromA = params.fromA ?? defaultDate(6);
  const toA = params.toA ?? defaultDate(0);
  const fromB = params.fromB ?? defaultDate(13);
  const toB = params.toB ?? defaultDate(7);

  const results = await getComparisonMetrics(user!.companyId, [
    { label: "ช่วงที่ 1", from: new Date(`${fromA}T00:00:00`), to: new Date(`${toA}T00:00:00`) },
    { label: "ช่วงที่ 2", from: new Date(`${fromB}T00:00:00`), to: new Date(`${toB}T00:00:00`) },
  ]);

  return <ComparePage results={results} fromA={fromA} toA={toA} fromB={fromB} toB={toB} />;
}
import { getCurrentUser } from "@/lib/auth";
import { getDepartmentSummaries } from "@/lib/manager queries";
import DepartmentsPage from "@/components/manager/DepartmentsPage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ManagerDepartmentsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  const summaries = await getDepartmentSummaries(
    user!.companyId,
    new Date(`${fromStr}T00:00:00`),
    new Date(`${toStr}T00:00:00`),
  );

  return <DepartmentsPage summaries={summaries} dateFrom={fromStr} dateTo={toStr} />;
}
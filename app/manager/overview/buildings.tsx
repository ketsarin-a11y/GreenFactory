import { redirect } from "next/navigation";

import BuildingsPage from "@/components/manager/BuildingsPage";
import { getBuildingSummaries } from "@/lib/manager queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function ManagerBuildingsPage({
  searchParams,
}: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "MANAGER") {
    redirect("/");
  }

  if (!session.companyId) {
    redirect("/");
  }

  const params = await searchParams;

  const fromStr = params.from ?? defaultDate(6);
  const toStr = params.to ?? defaultDate(0);

  const startDate = new Date(`${fromStr}T00:00:00`);
  const endDate = new Date(`${toStr}T23:59:59`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    redirect("/manager/overview/buildings");
  }

  const summaries = await getBuildingSummaries(
    session.companyId,
    startDate,
    endDate,
  );

  return (
    <BuildingsPage
      summaries={summaries}
      dateFrom={fromStr}
      dateTo={toStr}
    />
  );
}
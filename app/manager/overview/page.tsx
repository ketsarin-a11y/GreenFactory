import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getManagerDashboardData } from "@/lib/manager queries";
import ManagerDashboardPage from "@/components/manager/Managerdashboardpage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

interface ManagerPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function ManagerPage({
  searchParams,
}: ManagerPageProps) {
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

  const data = await getManagerDashboardData(
    session.companyId,
    startDate,
    endDate
  );

  const currentUserName =
    `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() ||
    session.email;

  return (
    <ManagerDashboardPage
      data={data}
      currentUserName={currentUserName}
      dateFrom={fromStr}
      dateTo={toStr}
    />
  );
}

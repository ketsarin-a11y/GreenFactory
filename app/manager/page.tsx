import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getManagerDashboardData } from "@/lib/manager queries";
import ManagerHomePage from "@/components/manager/Managerhomepage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default async function ManagerPage() {
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

  const startDate = new Date(`${defaultDate(6)}T00:00:00`);
  const endDate = new Date(`${defaultDate(0)}T23:59:59`);

  const data = await getManagerDashboardData(
    session.companyId,
    startDate,
    endDate
  );

  const currentUserName =
    `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() ||
    session.email;

  return (
    <ManagerHomePage
      energy={data.energy}
      water={data.water}
      currentUserName={currentUserName}
    />
  );
}
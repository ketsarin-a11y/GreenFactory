import { redirect } from "next/navigation";

import ManagerHomePage from "@/components/manager/Managerhomepage";
import {
  getCarbonFootprint,
  getManagerResourceDashboard,
} from "@/lib/manager queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function startOfDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
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
    throw new Error("Manager account does not have a companyId");
  }

  const startDate = startOfDaysAgo(6);
  const endDate = endOfToday();

  const [resourceDashboard, carbon] = await Promise.all([
    getManagerResourceDashboard(
      session.companyId,
      startDate,
      endDate,
    ),
    getCarbonFootprint(
      session.companyId,
      startDate,
      endDate,
    ),
  ]);

  return (
    <ManagerHomePage
      resourceDashboard={resourceDashboard}
      carbon={carbon}
      currentUserName={session.name ?? ""}
    />
  );
}

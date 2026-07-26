import { getCurrentUser } from "@/lib/auth";
import { getManagerDashboardData } from "@/lib/manager queries";
import ManagerHomePage from "@/components/manager/Managerhomepage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default async function ManagerPage() {
  const user = await getCurrentUser();

  const startDate = new Date(`${defaultDate(6)}T00:00:00`);
  const endDate = new Date(`${defaultDate(0)}T00:00:00`);
  const data = await getManagerDashboardData(user!.companyId, startDate, endDate);

  return <ManagerHomePage energy={data.energy} water={data.water} currentUserName={user!.name} />;
}
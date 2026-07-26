import { getCurrentUser } from "@/lib/auth";
import { getManagerDashboardData } from "@/lib/manager queries";
import ManagerDashboardPage from "@/components/manager/Managerdashboardpage";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

interface ManagerPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ManagerPage({ searchParams }: ManagerPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  const fromStr = params.from ?? defaultDate(6); // ค่าเริ่มต้น: ย้อนหลัง 7 วัน
  const toStr = params.to ?? defaultDate(0);
  const startDate = new Date(`${fromStr}T00:00:00`);
  const endDate = new Date(`${toStr}T00:00:00`);

  const data = await getManagerDashboardData(user!.companyId, startDate, endDate);

  return <ManagerDashboardPage data={data} currentUserName={user!.name} dateFrom={fromStr} dateTo={toStr} />;
}
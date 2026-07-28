import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import {
  getTodayTaskSummary,
  getRecentRecords,
} from "@/lib/dashboard-queries";

import QuickActions from "@/components/operator/QuickActions";
import TodayTasks from "@/components/operator/TodayTasks";
import RecentRecords from "@/components/operator/RecentRecords";
import TipBanner from "@/components/operator/TipBanner";

// Dashboard ต้องดึงข้อมูลล่าสุดทุกครั้ง
export const dynamic = "force-dynamic";

export default async function OperatorHomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "OPERATOR") {
    redirect("/");
  }

  if (!session.companyId) {
    throw new Error("Operator account does not have a companyId");
  }

  const [summary, records] = await Promise.all([
    getTodayTaskSummary(session.companyId),
    getRecentRecords(session.userId, 5),
  ]);

  return (
    <>
      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <TodayTasks summary={summary} />
        <RecentRecords records={records} />
      </div>

      <TipBanner />
    </>
  );
}
import { redirect } from "next/navigation";

import DashboardLive from "@/components/operator/DashboardLive";
import QuickActions from "@/components/operator/QuickActions";
import TipBanner from "@/components/operator/TipBanner";

import {
  getRecentRecords,
  getTodayTaskSummary,
} from "@/lib/dashboard-queries";
import { getSession } from "@/lib/session";

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
    throw new Error(
      "Operator account does not have a companyId",
    );
  }

  const [summary, records] = await Promise.all([
    getTodayTaskSummary(session.companyId),
    getRecentRecords(session.userId, 5),
  ]);

  return (
    <div className="space-y-6 pb-8">
      <QuickActions />

      <DashboardLive
        initialSummary={summary}
        initialRecords={records}
      />

      <TipBanner />
    </div>
  );
}
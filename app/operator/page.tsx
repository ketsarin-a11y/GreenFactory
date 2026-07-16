import { getCurrentUser } from "@/lib/auth";
import { getTodayTaskSummary, getRecentRecords } from "@/lib/dashboard-queries";
import QuickActions from "@/components/operator/QuickActions";
import TodayTasks from "@/components/operator/TodayTasks";
import RecentRecords from "@/components/operator/RecentRecords";
import TipBanner from "@/components/operator/TipBanner";

// ดึงข้อมูลสดทุกครั้งที่เข้าหน้านี้ (ไม่ cache) เพราะเป็น dashboard ที่ต้องเห็นข้อมูลล่าสุด
export const dynamic = "force-dynamic";

export default async function OperatorHomePage() {
  const user = await getCurrentUser();

  const [summary, records] = await Promise.all([
    getTodayTaskSummary(user!.companyId),
    getRecentRecords(user!.id, 5),
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
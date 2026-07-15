import { getSession } from "@/lib/session";

export default async function CompanyDashboardPage() {
  const session = await getSession();

  return (
    <main className="min-h-screen bg-[#f5f7f4] p-8">
      <h1 className="text-3xl font-semibold text-[#17291f]">
        Company Admin Dashboard
      </h1>

      <p className="mt-3 text-[#758179]">
        ยินดีต้อนรับ {session?.firstName} {session?.lastName}
      </p>

      <p className="mt-2 text-sm text-[#758179]">
        Company ID: {session?.companyId}
      </p>
    </main>
  );
}
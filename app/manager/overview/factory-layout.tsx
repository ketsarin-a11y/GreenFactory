import { Map, AlertTriangle, Building2, Wrench } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getBuildingSummaries } from "@/lib/manager queries";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default async function ManagerFactoryLayoutPage() {
  const session = await getSession();

  if (!session || session.roleName !== "MANAGER" || !session.companyId) {
    redirect("/login");
  }
  const today = defaultDate(0);
  // เนเธเนเธเนเธญเธกเธนเธฅเธงเธฑเธเธเธตเนเนเธเนเนเธเธงเนเธเธณเธเธงเธเน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃเธ•เนเธญเนเธเธเธเธฃเธดเธ (เธเธฑเธเธ•เธณเนเธซเธเนเธ/เธเธฃเธฒเธเธดเธเธขเธฑเธเน€เธเนเธ mock)
  const buildings = await getBuildingSummaries(session.companyId!, new Date(`${today}T00:00:00`), new Date(`${today}T00:00:00`));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>เธเธฑเธเธเธฃเธฒเธเธดเธเธ”เนเธฒเธเธฅเนเธฒเธเน€เธเนเธ mock</strong> โ€” เธฃเธฐเธเธเธขเธฑเธเนเธกเนเธกเธตเธ•เธฒเธฃเธฒเธเน€เธเนเธเธเธดเธเธฑเธ” x/y เธเธญเธเน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃเธเธเธเธฑเธเธเธฃเธดเธ (เธ•เนเธญเธเธกเธตเธ•เธฒเธฃเธฒเธ Building, Floor, เนเธฅเธฐเธเธดเธเธฑเธ”)
          เนเธ•เนเธฃเธฒเธขเธเธทเนเธญเนเธเธ/เธเธณเธเธงเธเน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃเธ—เธตเนเนเธชเธ”เธเนเธเธฃเธฒเธขเธเธฒเธฃเธ”เนเธฒเธเธฅเนเธฒเธเน€เธเนเธ<strong>เธเนเธญเธกเธนเธฅเธเธฃเธดเธ</strong>เธเธฒเธ Equipment.location
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Map size={16} />
            เธเธฑเธเนเธฃเธเธเธฒเธ
          </h2>
          <div className="flex gap-1.5">
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              2D
            </button>
            <button type="button" disabled title="เนเธซเธกเธ” 3D เธขเธฑเธเนเธกเนเธฃเธญเธเธฃเธฑเธ" className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-300">
              3D
            </button>
          </div>
        </div>

        <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-emerald-50 via-sky-50 to-slate-50 text-center">
          <Building2 size={40} className="text-emerald-400" />
          <p className="text-sm text-slate-500">
            เนเธเธเธเธฑเธเนเธฃเธเธเธฒเธเนเธเธ interactive (เธฅเธฒเธ/เธเธนเธก/เธเธฅเธดเธเธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃเนเธ•เนเธฅเธฐเธเธธเธ”)
            <br />
            เธเธฐเนเธชเธ”เธเธ•เธฃเธเธเธตเนเน€เธกเธทเนเธญเธกเธตเธเนเธญเธกเธนเธฅเธเธฑเธเธญเธฒเธเธฒเธฃ/เธเธดเธเธฑเธ”เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃเธเธฃเธดเธ
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">เนเธเธ/เธ•เธณเนเธซเธเนเธเนเธเนเธฃเธเธเธฒเธ (เธเนเธญเธกเธนเธฅเธเธฃเธดเธ)</h2>
        {buildings.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">เธขเธฑเธเนเธกเนเธกเธตเธเนเธญเธกเธนเธฅ</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((b) => (
              <li key={b.location} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Wrench size={15} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{b.location}</p>
                  <p className="text-xs text-slate-400">{b.equipmentCount} เน€เธเธฃเธทเนเธญเธเธเธฑเธเธฃ</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-400">
          เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฅเธฑเธเธเธฒเธ/เธเนเธณเธ•เนเธญเนเธเธเนเธเธเน€เธ•เนเธกเนเธ”เนเธ—เธตเนเธซเธเนเธฒ{" "}
          <a href="/manager/overview/buildings" className="font-medium text-emerald-600 underline">
            เธญเธฒเธเธฒเธฃ
          </a>
        </p>
      </section>
    </div>
  );
}



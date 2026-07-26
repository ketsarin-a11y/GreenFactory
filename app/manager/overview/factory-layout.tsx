import { Map, AlertTriangle, Building2, Wrench } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getBuildingSummaries } from "@/lib/manager queries";

export const dynamic = "force-dynamic";

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default async function ManagerFactoryLayoutPage() {
  const user = await getCurrentUser();
  const today = defaultDate(0);
  // ใช้ข้อมูลวันนี้แค่โชว์จำนวนเครื่องจักรต่อโซนจริง (ผังตำแหน่ง/กราฟิกยังเป็น mock)
  const buildings = await getBuildingSummaries(user!.companyId, new Date(`${today}T00:00:00`), new Date(`${today}T00:00:00`));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>ผังกราฟิกด้านล่างเป็น mock</strong> — ระบบยังไม่มีตารางเก็บพิกัด x/y ของเครื่องจักรบนผังจริง (ต้องมีตาราง Building, Floor, และพิกัด)
          แต่รายชื่อโซน/จำนวนเครื่องจักรที่แสดงในรายการด้านล่างเป็น<strong>ข้อมูลจริง</strong>จาก Equipment.location
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Map size={16} />
            ผังโรงงาน
          </h2>
          <div className="flex gap-1.5">
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              2D
            </button>
            <button type="button" disabled title="โหมด 3D ยังไม่รองรับ" className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-300">
              3D
            </button>
          </div>
        </div>

        <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-emerald-50 via-sky-50 to-slate-50 text-center">
          <Building2 size={40} className="text-emerald-400" />
          <p className="text-sm text-slate-500">
            แผนผังโรงงานแบบ interactive (ลาก/ซูม/คลิกดูรายละเอียดเครื่องจักรแต่ละจุด)
            <br />
            จะแสดงตรงนี้เมื่อมีข้อมูลผังอาคาร/พิกัดเครื่องจักรจริง
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">โซน/ตำแหน่งในโรงงาน (ข้อมูลจริง)</h2>
        {buildings.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีข้อมูล</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((b) => (
              <li key={b.location} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Wrench size={15} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{b.location}</p>
                  <p className="text-xs text-slate-400">{b.equipmentCount} เครื่องจักร</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-400">
          ดูรายละเอียดพลังงาน/น้ำต่อโซนแบบเต็มได้ที่หน้า{" "}
          <a href="/manager/overview/buildings" className="font-medium text-emerald-600 underline">
            อาคาร
          </a>
        </p>
      </section>
    </div>
  );
}
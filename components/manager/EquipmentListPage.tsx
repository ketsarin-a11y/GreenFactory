"use client";

import { useMemo, useState } from "react";
import { Search, Wrench } from "lucide-react";
import type { EquipmentListItem } from "@/lib/record-queries";
import { RESOURCE_META } from "@/lib/resource-meta";

const ALL = "ทั้งหมด";

/**
 * components/manager/EquipmentListPage.tsx
 * --------------------------------------------
 * รายการเครื่องจักรแบบอ่านอย่างเดียว (ไม่มีปุ่มบันทึกข้อมูลเหมือนฝั่ง Operator)
 * ใช้ข้อมูลจริงชุดเดียวกับหน้า "บันทึกการใช้ทรัพยากร" ของ Operator
 * (lib/record-queries.ts -> getEquipmentList)
 */
export default function EquipmentListPage({ equipmentList }: { equipmentList: EquipmentListItem[] }) {
  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const resourceTypes = useMemo(() => [ALL, ...new Set(equipmentList.map((e) => e.resourceType))], [equipmentList]);
  const statuses = useMemo(() => [ALL, ...new Set(equipmentList.map((e) => e.status))], [equipmentList]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return equipmentList.filter((eq) => {
      const matchesSearch =
        !term ||
        eq.name.toLowerCase().includes(term) ||
        (eq.equipmentCode ?? "").toLowerCase().includes(term) ||
        (eq.equipmentType ?? "").toLowerCase().includes(term);
      const matchesResource = resourceType === ALL || eq.resourceType === resourceType;
      const matchesStatus = status === ALL || eq.status === status;
      return matchesSearch && matchesResource && matchesStatus;
    });
  }, [equipmentList, search, resourceType, status]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วยชื่อเครื่อง, รหัสเครื่อง, ประเภท"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none">
            <option value={ALL}>ประเภททรัพยากรทั้งหมด</option>
            {resourceTypes.filter((r) => r !== ALL).map((r) => (
              <option key={r} value={r}>{RESOURCE_META[r]?.label ?? r}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none">
            <option value={ALL}>สถานะทั้งหมด</option>
            {statuses.filter((s) => s !== ALL).map((s) => (
              <option key={s} value={s}>{s === "NORMAL" ? "ปกติ" : s}</option>
            ))}
          </select>
        </div>

        <p className="mb-2 text-xs text-slate-400">พบ {filtered.length} รายการ จากทั้งหมด {equipmentList.length} รายการ</p>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">เครื่องจักร</th>
                <th className="px-3 py-2.5 font-medium">รหัสเครื่อง</th>
                <th className="px-3 py-2.5 font-medium">ประเภทเครื่องจักร</th>
                <th className="px-3 py-2.5 font-medium">ไลน์การผลิต</th>
                <th className="px-3 py-2.5 font-medium">แผนก</th>
                <th className="px-3 py-2.5 font-medium">ประเภททรัพยากร</th>
                <th className="px-3 py-2.5 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((eq) => (
                <tr key={eq.equipmentId} className="hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2 font-medium text-slate-800">
                      <Wrench size={14} className="text-slate-400" />
                      {eq.name}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{eq.equipmentCode ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-500">{eq.equipmentType ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-500">{eq.productionLine ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-500">{eq.department ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-500">{RESOURCE_META[eq.resourceType]?.label ?? eq.resourceType}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${eq.status === "NORMAL" ? "text-emerald-600" : "text-amber-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${eq.status === "NORMAL" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {eq.status === "NORMAL" ? "ปกติ" : eq.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-400">
                    ไม่พบเครื่องจักรที่ตรงกับตัวกรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
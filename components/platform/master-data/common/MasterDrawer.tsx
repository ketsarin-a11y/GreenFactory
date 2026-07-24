"use client";

import { CalendarDays, Hash, Pencil, Tag, X } from "lucide-react";
import type { MasterItem } from "./types";
import MasterItemIcon from "./MasterItemIcon";
import StatusBadge from "./StatusBadge";

export default function MasterDrawer({
  item,
  title,
  iconType,
  onClose,
}: {
  item: MasterItem | null;
  title: string;
  iconType: "machine" | "sensor" | "resource" | "category" | "unit" | "emission";
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-[#17201c]/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[430px] overflow-y-auto border-l border-[#e4e6e3] bg-[#fbfaf8] shadow-[-24px_0_70px_rgba(31,42,37,0.14)]">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#e8e5e0] bg-[#fbfaf8] px-5 py-4">
          <div>
            <p className="text-[15px] font-bold text-[#26312c]">{title}</p>
            <p className="mt-1 text-[11px] text-[#89928e]">พร้อมเชื่อม Prisma และ API</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-[10px] hover:bg-white">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-[20px] border border-[#e5e3df] bg-white p-5">
            <div className="flex items-center gap-4">
              <MasterItemIcon item={item} type={iconType} large />
              <div>
                <h3 className="text-[19px] font-bold text-[#26312c]">{item.nameTh}</h3>
                <p className="mt-1 text-[11px] text-[#89928e]">{item.nameEn ?? item.code}</p>
                <div className="mt-3">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[16px] border border-[#e7e5e1] bg-white p-4">
            <p className="text-[10px] font-semibold text-[#949c98]">คำอธิบาย</p>
            <p className="mt-2 text-[12px] leading-6 text-[#46524c]">{item.description}</p>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              { icon: Hash, label: "รหัส", value: item.code },
              { icon: Tag, label: "ชื่อภาษาไทย", value: item.nameTh },
              { icon: Tag, label: "ชื่อภาษาอังกฤษ", value: item.nameEn ?? "—" },
              { icon: CalendarDays, label: "วันที่สร้าง", value: item.createdAt },
              { icon: CalendarDays, label: "แก้ไขล่าสุด", value: item.updatedAt },
            ].map((detail) => {
              const Icon = detail.icon;
              return (
                <div key={detail.label} className="flex gap-3 rounded-[15px] border border-[#e7e5e1] bg-white px-4 py-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#f1f4f3] text-[#577066]">
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-[#949c98]">{detail.label}</p>
                    <p className="mt-1 text-[12px] font-medium text-[#39453f]">{detail.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#0d7659] text-[12px] font-semibold text-white"
          >
            <Pencil className="h-4 w-4" />
            แก้ไขข้อมูล
          </button>
        </div>
      </aside>
    </>
  );
}

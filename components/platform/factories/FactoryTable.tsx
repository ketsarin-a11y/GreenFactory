"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Search,
  ShieldBan,
  Trash2,
  UsersRound,
} from "lucide-react";

import type { Factory, FactoryStatus } from "./types";

const statusLabel: Record<FactoryStatus, string> = {
  ACTIVE: "ใช้งานอยู่",
  INACTIVE: "ไม่ใช้งาน",
  SUSPENDED: "ระงับใช้งาน",
};

const statusClass: Record<FactoryStatus, string> = {
  ACTIVE: "bg-[#eaf8f2] text-[#087a57]",
  INACTIVE: "bg-[#f1f3f2] text-[#6c7771]",
  SUSPENDED: "bg-[#fff0f1] text-[#b83b4b]",
};

export default function FactoryTable({
  factories,
  loading,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onView,
  onStatusChange,
  onDelete,
}: {
  factories: Factory[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (factory: Factory) => void;
  onStatusChange: (id: number, status: FactoryStatus) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <thead>
            <tr className="border-b border-[#ecefed] text-left">
              {[
                "โรงงาน",
                "บริษัท",
                "รหัส",
                "ที่ตั้ง",
                "อาคาร",
                "ผู้ใช้",
                "การบันทึก",
                "สถานะ",
                "จัดการ",
              ].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3.5 text-[10px] font-semibold text-[#7d8882]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={9} className="px-4 py-3">
                    <div className="h-12 animate-pulse rounded-xl bg-[#f1f4f2]" />
                  </td>
                </tr>
              ))}

            {!loading &&
              factories.map((factory) => (
                <tr
                  key={factory.id}
                  className="border-b border-[#eff2f0] transition hover:bg-[#fbfcfb]"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#e9f5f0] text-[#176b52]">
                        <Building2 className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="max-w-[240px] truncate text-[12px] font-semibold text-[#25302b]">
                          {factory.name}
                        </p>
                        <p className="mt-1 text-[10px] text-[#8a9490]">
                          {factory.email || "ยังไม่มีอีเมลโรงงาน"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="max-w-[220px] truncate text-[11px] font-semibold text-[#46524c]">
                      {factory.company.companyName}
                    </p>
                    <p className="mt-1 text-[9px] text-[#8b9590]">
                      {factory.company.companyCode}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-[11px] font-semibold">
                    {factory.code}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 text-[#6e7b74]" />
                      <div>
                        <p className="text-[10px] text-[#52605a]">
                          {factory.province || "ไม่ระบุจังหวัด"}
                        </p>
                        <p className="mt-1 max-w-[210px] truncate text-[9px] text-[#929b96]">
                          {factory.address || "ยังไม่มีที่อยู่"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-[11px] font-semibold">
                    {factory.buildings}
                  </td>

                  <td className="px-4 py-4 text-[11px] font-semibold">
                    {factory.users}
                  </td>

                  <td className="px-4 py-4 text-[11px] font-semibold">
                    {factory.resourceUsages}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass[factory.status]}`}
                    >
                      {statusLabel[factory.status]}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onView(factory)}
                        className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#168066] hover:bg-[#eef8f4]"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onStatusChange(
                            factory.id,
                            factory.status === "SUSPENDED"
                              ? "ACTIVE"
                              : "SUSPENDED",
                          )
                        }
                        className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#b47a22] hover:bg-[#fff8eb]"
                        title={
                          factory.status === "SUSPENDED"
                            ? "เปิดใช้งาน"
                            : "ระงับใช้งาน"
                        }
                      >
                        <ShieldBan className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(factory.id)}
                        className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#d1505e] hover:bg-[#fff1f3]"
                        title="ลบ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && factories.length === 0 && (
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <Search className="mx-auto h-6 w-6 text-[#85908a]" />
                  <p className="mt-3 text-[13px] font-semibold">
                    ไม่พบข้อมูลโรงงาน
                  </p>
                  <p className="mt-1 text-[10px] text-[#929a96]">
                    ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#edf0ee] px-4 py-4 text-[10px]">
        <span>
          แสดง{" "}
          {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, totalItems)} จาก {totalItems} รายการ
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="grid h-9 w-9 place-items-center rounded-[10px] border disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span>
            หน้า {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="grid h-9 w-9 place-items-center rounded-[10px] border disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

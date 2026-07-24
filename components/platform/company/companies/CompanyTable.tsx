"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Eye,
  Factory,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { STATUS_CLASS, STATUS_LABEL } from "./data";
import type { Company, CompanyStatus } from "./types";

type Props = {
  companies: Company[];
  selectedIds: number[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  onPageChange: (page: number) => void;
  onView: (company: Company) => void;
  onStatusChange: (id: number, status: CompanyStatus) => void;
  onDelete: (id: number) => void;
};

export default function CompanyTable({
  companies,
  selectedIds,
  page,
  totalPages,
  totalItems,
  pageSize,
  onSelect,
  onSelectAll,
  onPageChange,
  onView,
  onStatusChange,
  onDelete,
}: Props) {
  const [openId, setOpenId] = useState<number | null>(null);
  const allSelected =
    companies.length > 0 && companies.every((item) => selectedIds.includes(item.id));

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="w-12 px-4 py-3">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className={`grid h-5 w-5 place-items-center rounded border ${
                    allSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </th>
              {["บริษัท", "รหัส", "อุตสาหกรรม", "ผู้ดูแลหลัก", "ทรัพยากร", "วันที่จดทะเบียน", "สถานะ", ""].map(
                (item) => (
                  <th
                    key={item}
                    className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"
                  >
                    {item}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {companies.map((company) => {
              const selected = selectedIds.includes(company.id);

              return (
                <tr
                  key={company.id}
                  className={`border-b border-slate-100 transition last:border-0 ${
                    selected ? "bg-blue-50/50" : "hover:bg-slate-50/70"
                  }`}
                >
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onSelect(company.id)}
                      className={`grid h-5 w-5 place-items-center rounded border ${
                        selected
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onView(company)}
                      className="flex items-center gap-3 text-left"
                    >
                      <div className={`grid h-10 w-10 place-items-center rounded-xl text-[11px] font-bold ${company.logoClass}`}>
                        {company.logoText}
                      </div>
                      <div>
                        <p className="max-w-[230px] truncate text-[12px] font-semibold text-slate-900">
                          {company.name}
                        </p>
                        <p className="mt-1 max-w-[230px] truncate text-[10px] text-slate-400">
                          {company.email}
                        </p>
                      </div>
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-600">
                      {company.code}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <p className="max-w-[190px] truncate text-[11px] font-medium text-slate-700">
                      {company.industry}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">{company.province}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-[11px] font-semibold text-slate-700">{company.contactName}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{company.phone}</p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                        <Factory className="h-3 w-3" />
                        {company.factories}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">
                        <Users className="h-3 w-3" />
                        {company.users}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-[11px] font-medium text-slate-700">{company.registeredAt}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{company.registeredTime}</p>
                  </td>

                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_CLASS[company.status]}`}>
                      {STATUS_LABEL[company.status]}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="relative inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(company)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpenId(openId === company.id ? null : company.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openId === company.id && (
                        <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              onView(company);
                              setOpenId(null);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50"
                          >
                            ดูรายละเอียด
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onStatusChange(
                                company.id,
                                company.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                              );
                              setOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-amber-700 hover:bg-amber-50"
                          >
                            <CirclePause className="h-3.5 w-3.5" />
                            {company.status === "ACTIVE" ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onDelete(company.id);
                              setOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            ลบบริษัท
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {companies.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-[13px] font-semibold text-slate-700">ไม่พบข้อมูลบริษัท</p>
            <p className="mt-1 text-[11px] text-slate-400">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-slate-500">
          แสดง {totalItems === 0 ? 0 : (page - 1) * pageSize + 1} -{" "}
          {Math.min(page * pageSize, totalItems)} จาก {totalItems} รายการ
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="min-w-20 text-center text-[11px] font-semibold text-slate-700">
            หน้า {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

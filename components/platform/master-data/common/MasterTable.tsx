"use client";

import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import type { MasterColumn, MasterItem } from "./types";
import MasterItemIcon from "./MasterItemIcon";
import StatusBadge from "./StatusBadge";

export default function MasterTable({
  rows,
  columns,
  iconType,
  onView,
}: {
  rows: MasterItem[];
  columns: MasterColumn[];
  iconType: "machine" | "sensor" | "resource" | "category" | "unit" | "emission";
  onView: (row: MasterItem) => void;
}) {
  function renderCell(row: MasterItem, key: MasterColumn["key"]) {
    switch (key) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <MasterItemIcon item={row} type={iconType} />
            <div className="min-w-0">
              <p className="max-w-[230px] truncate text-[12px] font-semibold text-[#26312c]">
                {row.nameTh}
                {row.nameEn ? ` (${row.nameEn})` : ""}
              </p>
              <p className="mt-1 text-[10px] text-[#8a938f]">
                แก้ไขล่าสุด {row.updatedAt}
              </p>
            </div>
          </div>
        );
      case "code":
        return <span className="text-[11px] font-semibold text-[#52605a]">{row.code}</span>;
      case "category":
        return <span className="rounded-full bg-[#f1f4f3] px-2.5 py-1 text-[10px] font-semibold text-[#56625c]">{row.category ?? "—"}</span>;
      case "unit":
        return <span className="text-[11px] text-[#4f5b56]">{row.unit ?? "—"}</span>;
      case "value":
        return <span className="text-[11px] font-semibold text-[#2f3a35]">{row.value ?? "—"}</span>;
      case "source":
        return <span className="text-[11px] text-[#4f5b56]">{row.source ?? "—"}</span>;
      case "description":
        return <p className="max-w-[320px] truncate text-[11px] text-[#4f5b56]">{row.description}</p>;
      case "relatedCount":
        return (
          <span className="text-[11px] font-semibold text-[#4e5b55]">
            {row.relatedCount ?? 0}
            <span className="ml-1 text-[10px] font-normal text-[#929a96]">รายการ</span>
          </span>
        );
      case "status":
        return <StatusBadge status={row.status} />;
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse">
        <thead>
          <tr className="border-b border-[#ece9e4] bg-[#fbfcfb] text-left">
            <th className="px-4 py-3.5 text-[10px] font-semibold text-[#7f8883]">#</th>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3.5 text-[10px] font-semibold text-[#7f8883]">
                {column.label}
              </th>
            ))}
            <th className="px-4 py-3.5 text-[10px] font-semibold text-[#7f8883]">จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-b border-[#f0ede9] last:border-b-0 hover:bg-[#fbfcfb]">
              <td className="px-4 py-3.5 text-[12px] text-[#75807b]">{index + 1}</td>
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3.5">
                  {renderCell(row, column.key)}
                </td>
              ))}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onView(row)}
                    className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#168066] hover:bg-[#eef8f4]"
                  >
                    <Eye className="h-[15px] w-[15px]" />
                  </button>
                  <button className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#3c72b3] hover:bg-[#f0f5fb]">
                    <Pencil className="h-[14px] w-[14px]" />
                  </button>
                  <button className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#d1505e] hover:bg-[#fff1f3]">
                    <Trash2 className="h-[14px] w-[14px]" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 2} className="px-6 py-16 text-center">
                <Search className="mx-auto h-5 w-5 text-[#7e8984]" />
                <p className="mt-3 text-[13px] font-semibold text-[#4f5a55]">ไม่พบข้อมูล</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

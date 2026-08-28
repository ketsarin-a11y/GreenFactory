"use client";

import {
  Eye,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import type { MasterColumn, MasterItem } from "./types";
import MasterItemIcon from "./MasterItemIcon";
import StatusBadge from "./StatusBadge";

export default function MasterTable({
  rows,
  columns,
  iconType,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  statusUpdatingId,
}: {
  rows: MasterItem[];
  columns: MasterColumn[];
  iconType:
    | "machine"
    | "sensor"
    | "resource"
    | "category"
    | "unit"
    | "emission";
  onView: (row: MasterItem) => void;
  onEdit?: (row: MasterItem) => void;
  onDelete?: (row: MasterItem) => void;
  onToggleStatus?: (row: MasterItem) => void;
  statusUpdatingId?: number | null;
}) {
  function renderCell(
    row: MasterItem,
    key: MasterColumn["key"],
  ) {
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
        return (
          <span className="text-[11px] font-semibold text-[#52605a]">
            {row.code}
          </span>
        );

      case "category":
        return (
          <span className="rounded-full bg-[#f1f4f3] px-2.5 py-1 text-[10px] font-semibold text-[#56625c]">
            {row.category ?? "—"}
          </span>
        );

      case "unit":
        return (
          <span className="text-[11px] text-[#4f5b56]">
            {row.unit ?? "—"}
          </span>
        );

      case "value":
        return (
          <span className="text-[11px] font-semibold text-[#2f3a35]">
            {row.value ?? "—"}
          </span>
        );

      case "source":
        return (
          <span className="text-[11px] text-[#4f5b56]">
            {row.source ?? "—"}
          </span>
        );

      case "description":
        return (
          <p className="max-w-[320px] truncate text-[11px] text-[#4f5b56]">
            {row.description || "—"}
          </p>
        );

      case "relatedCount":
        return (
          <span className="text-[11px] font-semibold text-[#4e5b55]">
            {row.relatedCount ?? 0}

            <span className="ml-1 text-[10px] font-normal text-[#929a96]">
              รายการ
            </span>
          </span>
        );

      case "status": {
        const isActive = row.status === "ACTIVE";
        const isUpdating = statusUpdatingId === row.id;

        if (!onToggleStatus) {
          return <StatusBadge status={row.status} />;
        }

        return (
          <div className="flex items-center gap-3">
            <StatusBadge status={row.status} />

            <button
              type="button"
              onClick={() => onToggleStatus(row)}
              disabled={isUpdating}
              aria-label={
                isActive
                  ? `ปิดใช้งาน ${row.nameTh}`
                  : `เปิดใช้งาน ${row.nameTh}`
              }
              title={
                isActive
                  ? "คลิกเพื่อปิดใช้งาน"
                  : "คลิกเพื่อเปิดใช้งาน"
              }
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all duration-200 ${
                isActive
                  ? "border-[#9dd8c3] bg-[#1f9a70] shadow-[0_4px_12px_rgba(31,154,112,0.2)]"
                  : "border-[#d9deda] bg-[#e8ece9]"
              } ${
                isUpdating
                  ? "cursor-wait opacity-70"
                  : "cursor-pointer hover:scale-[1.03]"
              }`}
            >
              {isUpdating ? (
                <LoaderCircle className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 animate-spin text-white" />
              ) : (
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isActive
                      ? "translate-x-[22px]"
                      : "translate-x-[3px]"
                  }`}
                />
              )}
            </button>
          </div>
        );
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse">
        <thead>
          <tr className="border-b border-[#ece9e4] bg-[#fbfcfb] text-left">
            <th className="px-4 py-3.5 text-[10px] font-semibold text-[#7f8883]">
              #
            </th>

            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3.5 text-[10px] font-semibold text-[#7f8883]"
              >
                {column.label}
              </th>
            ))}

            <th className="px-4 py-3.5 text-[10px] font-semibold text-[#7f8883]">
              จัดการ
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className="border-b border-[#f0ede9] last:border-b-0 hover:bg-[#fbfcfb]"
            >
              <td className="px-4 py-3.5 text-[12px] text-[#75807b]">
                {index + 1}
              </td>

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
                    title="ดูรายละเอียด"
                    aria-label="ดูรายละเอียด"
                    className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#168066] transition hover:bg-[#eef8f4]"
                  >
                    <Eye className="h-[15px] w-[15px]" />
                  </button>

                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      title="แก้ไข"
                      aria-label="แก้ไข"
                      className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#3c72b3] transition hover:bg-[#f0f5fb]"
                    >
                      <Pencil className="h-[14px] w-[14px]" />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      title="ลบ"
                      aria-label="ลบ"
                      className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#d1505e] transition hover:bg-[#fff1f3]"
                    >
                      <Trash2 className="h-[14px] w-[14px]" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 2}
                className="px-6 py-16 text-center"
              >
                <Search className="mx-auto h-5 w-5 text-[#7e8984]" />

                <p className="mt-3 text-[13px] font-semibold text-[#4f5a55]">
                  ไม่พบข้อมูล
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
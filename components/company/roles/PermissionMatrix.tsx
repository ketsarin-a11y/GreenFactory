"use client";

import {
  Check,
  Eye,
  FileDown,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

export type RoleKey = "MANAGER" | "OPERATOR";
export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export";

export type PermissionItem = {
  module: string;
  description: string;
  permissions: Record<PermissionAction, boolean>;
};

type PermissionMatrixProps = {
  role: RoleKey;
  items: PermissionItem[];
};

const columns: Array<{
  key: PermissionAction;
  label: string;
  icon: typeof Eye;
}> = [
  { key: "view", label: "ดู", icon: Eye },
  { key: "create", label: "เพิ่ม", icon: Plus },
  { key: "edit", label: "แก้ไข", icon: Pencil },
  { key: "delete", label: "ลบ", icon: Trash2 },
  { key: "approve", label: "อนุมัติ", icon: ShieldCheck },
  { key: "export", label: "ส่งออก", icon: FileDown },
];

export default function PermissionMatrix({
  role,
  items,
}: PermissionMatrixProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#dfe5eb] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-[#e6ebf0] bg-[#fafbfc]">
              <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8b96a5]">
                โมดูล
              </th>

              {columns.map((column) => {
                const Icon = column.icon;

                return (
                  <th
                    key={column.key}
                    className="px-3 py-4 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8b96a5]"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {column.label}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.module}
                className="border-b border-[#edf0f3] last:border-0 hover:bg-[#fbfcfd]"
              >
                <td className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-[#344154]">
                    {item.module}
                  </p>
                  <p className="mt-1 max-w-[320px] text-[8px] leading-4 text-[#929ca9]">
                    {item.description}
                  </p>
                </td>

                {columns.map((column) => {
                  const allowed = item.permissions[column.key];

                  return (
                    <td key={column.key} className="px-3 py-4 text-center">
                      <span
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                          allowed
                            ? role === "MANAGER"
                              ? "bg-[#e7f7ef] text-[#238156]"
                              : "bg-[#f0ebff] text-[#7154b5]"
                            : "bg-[#f2f4f6] text-[#a7b0bc]"
                        }`}
                      >
                        {allowed ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                        ) : (
                          <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-[#e6ebf0] bg-[#fafbfc] px-5 py-3">
        <span className="inline-flex items-center gap-2 text-[8px] text-[#6e7988]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e7f7ef] text-[#238156]">
            <Check className="h-3 w-3" />
          </span>
          อนุญาต
        </span>

        <span className="inline-flex items-center gap-2 text-[8px] text-[#6e7988]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f2f4f6] text-[#a7b0bc]">
            <X className="h-3 w-3" />
          </span>
          ไม่มีสิทธิ์
        </span>
      </div>
    </div>
  );
}
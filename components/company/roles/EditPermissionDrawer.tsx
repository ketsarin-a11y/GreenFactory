"use client";

import { Check, Save, X } from "lucide-react";
import {
  PermissionAction,
  PermissionItem,
  RoleKey,
} from "./PermissionMatrix";

type EditPermissionDrawerProps = {
  open: boolean;
  role: RoleKey;
  items: PermissionItem[];
  onClose: () => void;
  onChange: (
    moduleIndex: number,
    action: PermissionAction,
    value: boolean,
  ) => void;
  onSave: () => void;
};

const actions: Array<{
  key: PermissionAction;
  label: string;
}> = [
  { key: "view", label: "ดูข้อมูล" },
  { key: "create", label: "เพิ่มข้อมูล" },
  { key: "edit", label: "แก้ไขข้อมูล" },
  { key: "delete", label: "ลบข้อมูล" },
  { key: "approve", label: "อนุมัติข้อมูล" },
  { key: "export", label: "ส่งออกข้อมูล" },
];

export default function EditPermissionDrawer({
  open,
  role,
  items,
  onClose,
  onChange,
  onSave,
}: EditPermissionDrawerProps) {
  if (!open) {
    return null;
  }

  const roleLabel = role === "MANAGER" ? "Manager" : "Operator";

  return (
    <>
      <button
        type="button"
        aria-label="ปิดหน้าต่างแก้ไขสิทธิ์"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-[#0d1726]/35 backdrop-blur-[2px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[620px] overflow-y-auto bg-white shadow-[-24px_0_70px_rgba(17,31,51,0.18)]">
        <div className="sticky top-0 z-10 flex min-h-[74px] items-center justify-between border-b border-[#e5e9ee] bg-white px-6">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-[#263247]">
              แก้ไขสิทธิ์ {roleLabel}
            </h2>
            <p className="mt-1 text-[8px] text-[#929ca9]">
              Frontend preview — การเปลี่ยนแปลงยังไม่บันทึกลงฐานข้อมูล
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#718091] hover:bg-[#eef2f5] hover:text-[#2f3c50]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {items.map((item, moduleIndex) => (
            <section
              key={item.module}
              className="rounded-[16px] border border-[#dfe5eb] bg-[#fbfcfd] p-4"
            >
              <div>
                <h3 className="text-[11px] font-semibold text-[#344154]">
                  {item.module}
                </h3>
                <p className="mt-1 text-[8px] leading-4 text-[#929ca9]">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {actions.map((action) => {
                  const checked = item.permissions[action.key];

                  return (
                    <label
                      key={action.key}
                      className={`flex cursor-pointer items-center gap-3 rounded-[12px] border px-3 py-3 transition ${
                        checked
                          ? role === "MANAGER"
                            ? "border-[#74c8a5]/40 bg-[#edf9f3]"
                            : "border-[#a99ad9]/35 bg-[#f5f1ff]"
                          : "border-[#e3e7ec] bg-white hover:bg-[#f7f9fa]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          onChange(
                            moduleIndex,
                            action.key,
                            event.target.checked,
                          )
                        }
                        className="sr-only"
                      />

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-[6px] ${
                          checked
                            ? role === "MANAGER"
                              ? "bg-[#24875a] text-white"
                              : "bg-[#7356b7] text-white"
                            : "border border-[#cdd4dd] bg-white text-transparent"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </span>

                      <span className="text-[9px] font-medium text-[#4c596b]">
                        {action.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#e5e9ee] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-[11px] border border-[#dfe5eb] bg-white px-5 text-[10px] font-medium text-[#667283] hover:bg-[#f4f6f8]"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onSave}
            className={`inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-[11px] px-5 text-[10px] font-semibold text-white shadow-[0_10px_24px_rgba(31,143,98,0.18)] ${
              role === "MANAGER"
                ? "bg-[#1f8f62] hover:bg-[#187852]"
                : "bg-[#7254b5] hover:bg-[#60459d]"
            }`}
          >
            <Save className="h-4 w-4" />
            บันทึกสิทธิ์
          </button>
        </div>
      </aside>
    </>
  );
}
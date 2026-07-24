"use client";

import { MoreHorizontal } from "lucide-react";

export default function UserActionMenu({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="grid h-8 w-8 place-items-center rounded-[9px] text-[#7a847f] transition hover:bg-[#f1f3f2]"
        aria-label="ตัวเลือกเพิ่มเติม"
      >
        <MoreHorizontal className="h-[16px] w-[16px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-44 rounded-[12px] border border-[#e5e7e5] bg-white p-1.5 shadow-[0_14px_36px_rgba(42,50,46,0.13)]">
          <button className="w-full rounded-lg px-3 py-2 text-left text-[11px] text-[#4d5853] hover:bg-[#f5f7f6]">
            รีเซ็ตรหัสผ่าน
          </button>
          <button className="w-full rounded-lg px-3 py-2 text-left text-[11px] text-[#4d5853] hover:bg-[#f5f7f6]">
            ดูประวัติการเข้าสู่ระบบ
          </button>
          <button className="w-full rounded-lg px-3 py-2 text-left text-[11px] text-[#4d5853] hover:bg-[#f5f7f6]">
            ดู Audit Log
          </button>
        </div>
      )}
    </div>
  );
}

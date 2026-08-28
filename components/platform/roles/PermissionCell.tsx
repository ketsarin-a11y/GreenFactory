"use client";

import { Check, Eye, Minus } from "lucide-react";
import type { PermissionLevel } from "./types";

export default function PermissionCell({
  value,
  onChange,
}: {
  value: PermissionLevel;
  onChange: (value: PermissionLevel) => void;
}) {
  const Icon = value === "FULL" ? Check : value === "VIEW" ? Eye : Minus;
  const className =
    value === "FULL"
      ? "bg-[#0f8a5f] text-white hover:bg-[#0c7a53]"
      : value === "VIEW"
        ? "bg-[#3f7cff] text-white hover:bg-[#326fe9]"
        : "bg-[#ef4354] text-white hover:bg-[#df3344]";

  function cycle() {
    onChange(value === "FULL" ? "VIEW" : value === "VIEW" ? "NONE" : "FULL");
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={`mx-auto grid h-6 w-6 place-items-center rounded-full shadow-sm transition hover:scale-105 ${className}`}
      title="คลิกเพื่อเปลี่ยนสิทธิ์"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
    </button>
  );
}

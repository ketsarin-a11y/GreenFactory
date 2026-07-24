"use client";

import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import SectionCard from "./SectionCard";

export default function SecuritySettings() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <SectionCard
      title="ความปลอดภัย"
      description="จัดการรหัสผ่านและการยืนยันตัวตน"
    >
      <button
        type="button"
        onClick={() => setTwoFactor((current) => !current)}
        className="flex w-full items-center gap-3 rounded-[16px] border border-[#dfe9e3] bg-[#f8fbf9] px-4 py-3 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#e8f7ee] text-[#188250]">
          <ShieldCheck className="h-5 w-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-[#35463c]">
            การยืนยันตัวตนสองขั้นตอน
          </span>
          <span className="mt-1 block text-[11px] text-[#819087]">
            เพิ่มความปลอดภัยให้กับบัญชีของคุณ
          </span>
        </span>

        <span
          className={`relative h-6 w-11 rounded-full transition ${
            twoFactor ? "bg-[#1d9b5f]" : "bg-[#ccd6d0]"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
              twoFactor ? "left-6" : "left-1"
            }`}
          />
        </span>
      </button>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            รหัสผ่านปัจจุบัน
          </span>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              className="h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 pr-11 text-[13px] font-semibold text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((current) => !current)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#849188]"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            รหัสผ่านใหม่
          </span>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className="h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 pr-11 text-[13px] font-semibold text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
            />
            <button
              type="button"
              onClick={() => setShowNew((current) => !current)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#849188]"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#243b2f] px-5 text-[13px] font-bold text-white hover:bg-[#192b21]"
        >
          <KeyRound className="h-4 w-4" />
          เปลี่ยนรหัสผ่าน
        </button>
      </div>
    </SectionCard>
  );
}

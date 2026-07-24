"use client";

import { ChevronDown, RefreshCw, Search } from "lucide-react";
import type { CompanyStatus } from "./types";

type Props = {
  search: string;
  status: "ALL" | CompanyStatus;
  industry: string;
  industries: string[];
  onSearch: (value: string) => void;
  onStatus: (value: "ALL" | CompanyStatus) => void;
  onIndustry: (value: string) => void;
  onReset: () => void;
};

export default function CompanyFilters({
  search,
  status,
  industry,
  industries,
  onSearch,
  onStatus,
  onIndustry,
  onReset,
}: Props) {
  return (
    <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[1fr_auto_auto_auto]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="ค้นหาชื่อบริษัท รหัส อีเมล หรือผู้ติดต่อ"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[12px] text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="relative">
        <select
          value={status}
          onChange={(event) => onStatus(event.target.value as "ALL" | CompanyStatus)}
          className="h-11 min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-[11px] font-semibold text-slate-600 outline-none focus:border-blue-400"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="ACTIVE">ใช้งานอยู่</option>
          <option value="SUSPENDED">ระงับการใช้งาน</option>
          <option value="INACTIVE">ยกเลิกการใช้งาน</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </label>

      <label className="relative">
        <select
          value={industry}
          onChange={(event) => onIndustry(event.target.value)}
          className="h-11 min-w-[220px] appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-[11px] font-semibold text-slate-600 outline-none focus:border-blue-400"
        >
          <option value="ALL">อุตสาหกรรมทั้งหมด</option>
          {industries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </label>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        <RefreshCw className="h-4 w-4" />
        รีเซ็ต
      </button>
    </div>
  );
}

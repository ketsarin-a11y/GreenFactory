"use client";

import { RotateCcw, Search } from "lucide-react";

import type { CompanyOption, FactoryStatus } from "./types";

export default function FactoryFilters({
  search,
  status,
  companyId,
  companies,
  onSearch,
  onStatus,
  onCompany,
  onReset,
}: {
  search: string;
  status: "ALL" | FactoryStatus;
  companyId: string;
  companies: CompanyOption[];
  onSearch: (value: string) => void;
  onStatus: (value: "ALL" | FactoryStatus) => void;
  onCompany: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-3 border-y border-[#edf0ee] bg-[#fbfcfb] p-4 lg:grid-cols-[1fr_250px_210px_44px]">
      <label className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9690]" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="ค้นหาโรงงาน รหัส บริษัท จังหวัด..."
          className="h-11 w-full rounded-[12px] border border-[#dfe5e1] bg-white pl-11 pr-4 text-[11px] outline-none focus:border-[#1a8a68]/40 focus:ring-4 focus:ring-[#1a8a68]/[0.06]"
        />
      </label>

      <select
        value={companyId}
        onChange={(event) => onCompany(event.target.value)}
        className="h-11 rounded-[12px] border border-[#dfe5e1] bg-white px-3 text-[11px]"
      >
        <option value="">ทุกบริษัท</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) =>
          onStatus(event.target.value as "ALL" | FactoryStatus)
        }
        className="h-11 rounded-[12px] border border-[#dfe5e1] bg-white px-3 text-[11px]"
      >
        <option value="ALL">ทุกสถานะ</option>
        <option value="ACTIVE">ใช้งานอยู่</option>
        <option value="INACTIVE">ไม่ใช้งาน</option>
        <option value="SUSPENDED">ระงับใช้งาน</option>
      </select>

      <button
        type="button"
        onClick={onReset}
        title="ล้างตัวกรอง"
        className="grid h-11 w-11 place-items-center rounded-[12px] border border-[#dfe5e1] bg-white"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

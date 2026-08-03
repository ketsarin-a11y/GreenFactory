"use client";
import { RotateCcw, Search } from "lucide-react";
import type { CompanyStatus } from "./types";

export default function CompanyFilters(props: {
  search: string; status: "ALL" | CompanyStatus; industry: string; industries: string[];
  onSearch: (v: string) => void; onStatus: (v: "ALL" | CompanyStatus) => void;
  onIndustry: (v: string) => void; onReset: () => void;
}) {
  return <div className="grid gap-3 border-y border-[#edf0ee] bg-[#fbfcfb] p-4 lg:grid-cols-[1fr_220px_220px_44px]">
    <label className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9690]" /><input value={props.search} onChange={e => props.onSearch(e.target.value)} placeholder="ค้นหาบริษัท รหัส อีเมล ผู้ดูแล จังหวัด..." className="h-11 w-full rounded-[12px] border border-[#dfe5e1] bg-white pl-11 pr-4 text-[11px] outline-none focus:border-[#1a8a68]/40" /></label>
    <select value={props.industry} onChange={e => props.onIndustry(e.target.value)} className="h-11 rounded-[12px] border border-[#dfe5e1] bg-white px-3 text-[11px]"><option value="ALL">ทุกอุตสาหกรรม</option>{props.industries.map(i => <option key={i}>{i}</option>)}</select>
    <select value={props.status} onChange={e => props.onStatus(e.target.value as "ALL" | CompanyStatus)} className="h-11 rounded-[12px] border border-[#dfe5e1] bg-white px-3 text-[11px]"><option value="ALL">ทุกสถานะ</option><option value="ACTIVE">ใช้งานอยู่</option><option value="PENDING">รอตรวจสอบ</option><option value="SUSPENDED">ระงับใช้งาน</option></select>
    <button onClick={props.onReset} className="grid h-11 w-11 place-items-center rounded-[12px] border border-[#dfe5e1] bg-white"><RotateCcw className="h-4 w-4" /></button>
  </div>;
}

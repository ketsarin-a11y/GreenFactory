"use client";
import { Download, Plus, Sparkles } from "lucide-react";

export default function CompanyHeader(props: {
  totalCompanies: number;
  totalFactories: number;
  totalUsers: number;
  activeCompanies: number;
  onCreate: () => void;
  onExport: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#e3e8e5] bg-white px-7 py-7 shadow-[0_18px_60px_rgba(41,54,47,.06)]">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#dff5ec] blur-3xl" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ebe2] bg-[#f6fbf8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#3e7d65]">
            <Sparkles className="h-3 w-3" /> Platform Operations
          </span>
          <h1 className="mt-4 text-[30px] font-bold tracking-[-.045em] text-[#1f2a25]">จัดการบริษัท</h1>
          <p className="mt-2 text-[12px] text-[#748079]">ศูนย์กลางบริษัท โรงงาน ผู้ใช้งาน และสถานะการให้บริการทั้งแพลตฟอร์ม</p>
          <p className="mt-5 text-[11px] text-[#6e7973]">
            <b>{props.totalCompanies}</b> บริษัท · <b>{props.activeCompanies}</b> ใช้งานอยู่ · <b>{props.totalFactories}</b> โรงงาน · <b>{props.totalUsers}</b> ผู้ใช้
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={props.onExport} className="inline-flex h-11 items-center gap-2 rounded-[13px] border border-[#dce3df] px-4 text-[12px] font-semibold text-[#50605a] hover:bg-[#f7faf8]">
            <Download className="h-4 w-4" /> ส่งออก CSV
          </button>
          <button onClick={props.onCreate} className="inline-flex h-11 items-center gap-2 rounded-[13px] bg-[#0e7b5b] px-5 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(14,123,91,.22)] hover:bg-[#0a6d50]">
            <Plus className="h-4 w-4" /> เพิ่มบริษัท
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Factory, MapPinned, Plus, Sparkles } from "lucide-react";

export default function FactoryHeader({
  totalFactories,
  activeFactories,
  totalBuildings,
  onCreate,
}: {
  totalFactories: number;
  activeFactories: number;
  totalBuildings: number;
  onCreate: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#e2e7e4] bg-white px-7 py-7 shadow-[0_18px_60px_rgba(41,54,47,0.06)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#dff5ec] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-24 h-56 w-56 rounded-full bg-[#e8efff] blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ebe2] bg-[#f6fbf8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3e7d65]">
            <Sparkles className="h-3 w-3" />
            Factory Network
          </span>

          <h1 className="mt-4 text-[30px] font-bold tracking-[-0.045em] text-[#1f2a25]">
            จัดการโรงงาน
          </h1>

          <p className="mt-2 max-w-3xl text-[12px] leading-6 text-[#748079]">
            ดูแลโรงงานหลักของแต่ละบริษัท พิกัด แผนที่ อาคาร และสถานะการเปิดใช้งาน
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#6e7973]">
            <span>
              <b className="text-[#25312b]">{totalFactories}</b> โรงงาน
            </span>
            <span>
              <b className="text-[#25312b]">{activeFactories}</b> ใช้งานอยู่
            </span>
            <span>
              <b className="text-[#25312b]">{totalBuildings}</b> อาคาร
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#0e7b5b] px-5 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(14,123,91,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0a6d50]"
        >
          <Plus className="h-4 w-4" />
          เพิ่มโรงงานหลัก
        </button>
      </div>
    </section>
  );
}

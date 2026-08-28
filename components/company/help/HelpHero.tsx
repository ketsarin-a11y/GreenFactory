"use client";

import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
};

export default function HelpHero({ query, onQueryChange }: Props) {
  return (
    <section className="rounded-[22px] border border-[#dfe8e2] bg-white px-6 py-7 shadow-[0_12px_36px_rgba(30,73,46,0.05)] sm:px-8">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1d8a57]">
          Help Center
        </p>
        <h1 className="mt-2 text-[30px] font-extrabold tracking-[-0.03em] text-[#26362d]">
          ศูนย์ช่วยเหลือ
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#75837a]">
          ค้นหาคำตอบและแนวทางแก้ไขสำหรับการใช้งาน GreenFactory Insight
        </p>

        <label className="relative mt-6 block max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8c9991]" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="ค้นหาคำถามหรือวิธีใช้งาน..."
            className="h-13 w-full rounded-[16px] border border-[#dce6df] bg-[#f8faf9] py-3.5 pl-12 pr-4 text-[14px] font-medium text-[#33453a] outline-none transition placeholder:text-[#9aa59e] focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
          />
        </label>
      </div>
    </section>
  );
}

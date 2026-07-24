"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { FaqItem } from "./types";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

  return (
    <section className="rounded-[22px] border border-[#e1eae4] bg-white p-5 shadow-[0_12px_36px_rgba(30,73,46,0.05)] sm:p-6">
      <div className="mb-4">
        <h2 className="text-[18px] font-extrabold text-[#26362d]">
          คำถามที่พบบ่อย
        </h2>
        <p className="mt-1 text-[12px] text-[#819087]">
          เลือกคำถามเพื่อดูรายละเอียด
        </p>
      </div>

      <div className="divide-y divide-[#e7ede9]">
        {items.map((item) => {
          const open = openId === item.id;

          return (
            <article key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-[13px] font-bold text-[#35463c]">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#829087] transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open && (
                <p className="pb-4 pr-8 text-[12px] leading-6 text-[#75837a]">
                  {item.answer}
                </p>
              )}
            </article>
          );
        })}

        {items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[13px] font-bold text-[#627168]">
              ไม่พบคำถามที่ตรงกับการค้นหา
            </p>
            <p className="mt-1 text-[11px] text-[#8b9890]">
              ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

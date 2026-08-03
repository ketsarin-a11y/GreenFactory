"use client";

import {
  Building2,
  ExternalLink,
  Factory as FactoryIcon,
  Mail,
  MapPin,
  Phone,
  UsersRound,
  X,
} from "lucide-react";

import type { Factory } from "./types";

export default function FactoryDrawer({
  factory,
  onClose,
}: {
  factory: Factory | null;
  onClose: () => void;
}) {
  if (!factory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#19221e]/35 backdrop-blur-[2px]"
        aria-label="ปิด"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-[520px] overflow-y-auto bg-[#f7f9f8] shadow-[-24px_0_70px_rgba(27,42,35,0.18)]">
        <div className="sticky top-0 z-10 border-b border-[#e4e8e5] bg-white/95 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6d7a74]">
                Factory workspace
              </p>
              <h2 className="mt-1 text-[22px] font-bold tracking-[-0.035em] text-[#202a25]">
                {factory.name}
              </h2>
              <p className="mt-1 text-[10px] text-[#88928d]">
                {factory.code} · {factory.company.companyName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e1e6e3]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <section className="rounded-[20px] border border-[#e2e7e4] bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [MapPin, "จังหวัด", factory.province || "ไม่ระบุ"],
                [Phone, "โทรศัพท์", factory.phone || "ไม่ระบุ"],
                [Mail, "อีเมล", factory.email || "ไม่ระบุ"],
                [FactoryIcon, "เขตเวลา", factory.timezone],
              ].map(([Icon, label, value]) => {
                const Component = Icon as typeof MapPin;

                return (
                  <div key={String(label)} className="flex gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#eef5f2] text-[#1b7f61]">
                      <Component className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8b9590]">
                        {String(label)}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold">
                        {String(value)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3">
            {[
              [Building2, "อาคาร", factory.buildings],
              [UsersRound, "ผู้ใช้", factory.users],
              [FactoryIcon, "การบันทึก", factory.resourceUsages],
            ].map(([Icon, label, value]) => {
              const Component = Icon as typeof Building2;

              return (
                <article
                  key={String(label)}
                  className="rounded-[18px] border border-[#e2e7e4] bg-white p-4"
                >
                  <Component className="h-5 w-5 text-[#39725d]" />
                  <strong className="mt-3 block text-[22px]">
                    {Number(value)}
                  </strong>
                  <p className="mt-1 text-[9px] text-[#7f8984]">
                    {String(label)}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="rounded-[20px] border border-[#e2e7e4] bg-white p-5">
            <p className="text-[10px] font-semibold text-[#56625c]">
              ที่อยู่โรงงาน
            </p>
            <p className="mt-2 text-[11px] leading-6 text-[#737e78]">
              {factory.address || "ยังไม่ได้ระบุที่อยู่"}
            </p>

            {(factory.latitude || factory.longitude) && (
              <p className="mt-3 text-[10px] text-[#8d9691]">
                {factory.latitude ?? "—"}, {factory.longitude ?? "—"}
              </p>
            )}

            {factory.googleMapUrl && (
              <a
                href={factory.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-[11px] bg-[#eef7f3] px-3 py-2 text-[10px] font-semibold text-[#167459]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                เปิด Google Maps
              </a>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

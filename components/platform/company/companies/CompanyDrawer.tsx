"use client";

import { Building2, Factory, Mail, MapPin, Phone, Users, X } from "lucide-react";
import { STATUS_CLASS, STATUS_LABEL } from "./data";
import type { Company } from "./types";

export default function CompanyDrawer({
  company,
  onClose,
}: {
  company: Company | null;
  onClose: () => void;
}) {
  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30"
        aria-label="ปิด"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-[430px] overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Company profile
            </p>
            <h2 className="mt-1 text-[16px] font-bold text-slate-950">รายละเอียดบริษัท</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl text-[14px] font-bold ${company.logoClass}`}>
                {company.logoText}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-950">{company.name}</h3>
                <p className="mt-1 font-mono text-[10px] text-slate-400">{company.code}</p>
              </div>
            </div>

            <span className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_CLASS[company.status]}`}>
              {STATUS_LABEL[company.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <Factory className="h-4 w-4 text-blue-600" />
              <p className="mt-3 text-[22px] font-bold text-slate-950">{company.factories}</p>
              <p className="text-[10px] text-slate-400">โรงงาน</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <Users className="h-4 w-4 text-violet-600" />
              <p className="mt-3 text-[22px] font-bold text-slate-950">{company.users}</p>
              <p className="text-[10px] text-slate-400">ผู้ใช้งาน</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            {[
              [Building2, "อุตสาหกรรม", company.industry],
              [MapPin, "จังหวัด", company.province],
              [Mail, "อีเมล", company.email],
              [Phone, "โทรศัพท์", company.phone],
            ].map(([Icon, label, value]) => {
              const ItemIcon = Icon as typeof Building2;
              return (
                <div key={String(label)} className="flex gap-3 border-b border-slate-100 px-4 py-3.5 last:border-0">
                  <ItemIcon className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {String(label)}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-700">{String(value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

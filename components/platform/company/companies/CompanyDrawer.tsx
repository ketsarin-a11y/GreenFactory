"use client";
import { Factory, HardDrive, Mail, MapPin, Phone, UsersRound, X } from "lucide-react";
import type { Company } from "./types";

export default function CompanyDrawer({ company, onClose }: { company: Company | null; onClose: () => void }) {
  if (!company) return null;
  const storage = Math.min(100, Math.round(company.storageUsedGb / Math.max(company.storageLimitGb,1) * 100));
  return <div className="fixed inset-0 z-[200]"><button onClick={onClose} className="absolute inset-0 bg-[#19221e]/35"/><aside className="absolute right-0 top-0 h-full w-full max-w-[500px] overflow-y-auto bg-[#f7f9f8] shadow-[-24px_0_70px_rgba(27,42,35,.18)]">
    <div className="sticky top-0 border-b bg-white px-6 py-5"><div className="flex justify-between"><div><p className="text-[10px] uppercase tracking-[.12em] text-[#6d7a74]">Company workspace</p><h2 className="mt-1 text-[22px] font-bold">{company.name}</h2><p className="mt-1 text-[10px] text-[#88928d]">{company.code} · {company.plan}</p></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border"><X className="h-4 w-4"/></button></div></div>
    <div className="space-y-4 p-5">
      <section className="grid gap-4 rounded-[20px] border bg-white p-5 sm:grid-cols-2">{[[Mail,"อีเมล",company.email],[Phone,"โทรศัพท์",company.phone],[MapPin,"จังหวัด",company.province],[UsersRound,"ผู้ดูแล",company.contactName]].map(([Icon,l,v])=>{const C=Icon as typeof Mail;return <div key={String(l)} className="flex gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef5f2] text-[#1b7f61]"><C className="h-4 w-4"/></div><div><p className="text-[9px] text-[#8b9590]">{String(l)}</p><p className="mt-1 text-[11px] font-semibold">{String(v)}</p></div></div>})}</section>
      <section className="grid grid-cols-2 gap-3">{[[Factory,"โรงงาน",company.factories],[UsersRound,"ผู้ใช้งาน",company.users]].map(([Icon,l,v])=>{const C=Icon as typeof Factory;return <article key={String(l)} className="rounded-[18px] border bg-white p-4"><div className="flex justify-between"><C className="h-5 w-5 text-[#39725d]"/><strong className="text-[22px]">{Number(v)}</strong></div><p className="mt-3 text-[10px]">{String(l)}</p></article>})}</section>
      <section className="rounded-[20px] border bg-white p-5"><div className="flex justify-between"><p className="text-[11px] font-semibold">พื้นที่จัดเก็บ</p><HardDrive className="h-5 w-5"/></div><div className="mt-4 h-2 rounded-full bg-[#edf1ef]"><div className="h-full rounded-full bg-[#1b8a68]" style={{width:`${storage}%`}}/></div><p className="mt-2 text-[9px] text-[#838d88]">{company.storageUsedGb} / {company.storageLimitGb} GB</p></section>
    </div>
  </aside></div>;
}

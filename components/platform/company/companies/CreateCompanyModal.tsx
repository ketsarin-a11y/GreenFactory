"use client";
import { LoaderCircle, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { CompanyPlan, NewCompany } from "./types";

const empty: NewCompany = { code:"", name:"", email:"", phone:"", province:"", industry:"", contactName:"", plan:"TRIAL" };

export default function CreateCompanyModal({ open, submitting, onClose, onCreate }: { open:boolean; submitting:boolean; onClose:()=>void; onCreate:(f:NewCompany)=>Promise<void> }) {
  const [form,setForm]=useState(empty); const [error,setError]=useState("");
  useEffect(()=>{if(open){setForm(empty);setError("")}},[open]);
  if(!open)return null;
  async function submit(e:FormEvent){e.preventDefault();if(!form.code||!form.name||!form.email||!form.contactName){setError("กรุณากรอกข้อมูลสำคัญให้ครบ");return}try{await onCreate({...form,code:form.code.toUpperCase().trim()})}catch(x){setError(x instanceof Error?x.message:"เพิ่มบริษัทไม่สำเร็จ")}}
  const fields=[["code","รหัสบริษัท"],["name","ชื่อบริษัท"],["email","อีเมล"],["phone","โทรศัพท์"],["province","จังหวัด"],["industry","อุตสาหกรรม"],["contactName","ผู้ดูแลหลัก"]] as const;
  return <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#18221d]/45 px-4 backdrop-blur"><section className="w-full max-w-[660px] rounded-[28px] bg-white shadow-2xl">
    <div className="flex justify-between border-b px-7 py-6"><div><p className="text-[10px] uppercase tracking-[.12em] text-[#4c8d74]">New company workspace</p><h2 className="mt-2 text-[23px] font-bold">เพิ่มบริษัทเข้าสู่แพลตฟอร์ม</h2></div><button onClick={onClose}><X className="h-4 w-4"/></button></div>
    <form onSubmit={submit} className="px-7 py-7"><div className="grid gap-5 sm:grid-cols-2">{fields.map(([k,l])=><label key={k} className={k==="contactName"?"sm:col-span-2":""}><span className="text-[11px] font-semibold">{l}</span><input value={form[k]} onChange={e=>setForm(c=>({...c,[k]:k==="code"?e.target.value.toUpperCase():e.target.value}))} className="mt-2 h-12 w-full rounded-[13px] border bg-[#fbfcfb] px-4 text-[12px] outline-none"/></label>)}<label className="sm:col-span-2"><span className="text-[11px] font-semibold">แพ็กเกจ</span><select value={form.plan} onChange={e=>setForm(c=>({...c,plan:e.target.value as CompanyPlan}))} className="mt-2 h-12 w-full rounded-[13px] border px-4"><option value="TRIAL">Trial</option><option value="STANDARD">Standard</option><option value="ENTERPRISE">Enterprise</option></select></label></div>
    {error&&<p className="mt-5 rounded-xl bg-[#fff5f6] px-4 py-3 text-[11px] text-[#b83b4b]">{error}</p>}
    <div className="mt-7 flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onClose} className="h-11 rounded-xl border px-5 text-[12px]">ยกเลิก</button><button disabled={submitting} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0e7b5b] px-5 text-[12px] font-semibold text-white">{submitting?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Plus className="h-4 w-4"/>}สร้างบริษัท</button></div></form>
  </section></div>;
}

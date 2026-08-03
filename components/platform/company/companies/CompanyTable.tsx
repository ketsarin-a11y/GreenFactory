"use client";
import { ChevronLeft, ChevronRight, Eye, Search, ShieldBan, Trash2 } from "lucide-react";
import type { Company, CompanyStatus } from "./types";

const badge: Record<CompanyStatus, string> = {
  ACTIVE: "bg-[#eaf8f2] text-[#087a57]",
  PENDING: "bg-[#fff7e8] text-[#9a6415]",
  SUSPENDED: "bg-[#fff0f1] text-[#b83b4b]",
};
const label: Record<CompanyStatus, string> = { ACTIVE: "ใช้งานอยู่", PENDING: "รอตรวจสอบ", SUSPENDED: "ระงับใช้งาน" };

export default function CompanyTable(props: {
  companies: Company[]; selectedIds: number[]; page: number; totalPages: number;
  totalItems: number; pageSize: number; loading: boolean;
  onSelect: (id:number)=>void; onSelectAll:()=>void; onPageChange:(p:number)=>void;
  onView:(c:Company)=>void; onStatusChange:(id:number,s:CompanyStatus)=>void; onDelete:(id:number)=>void;
}) {
  const all = props.companies.length > 0 && props.companies.every(c => props.selectedIds.includes(c.id));
  return <>
    <div className="overflow-x-auto"><table className="w-full min-w-[1120px]">
      <thead><tr className="border-b border-[#ecefed] text-left"><th className="px-4 py-3"><input type="checkbox" checked={all} onChange={props.onSelectAll}/></th>{["บริษัท","รหัส","อุตสาหกรรม","แผน","โรงงาน","ผู้ใช้","สินทรัพย์","สถานะ","จัดการ"].map(x=><th key={x} className="px-4 py-3 text-[10px] text-[#7d8882]">{x}</th>)}</tr></thead>
      <tbody>
        {props.loading && Array.from({length:5}).map((_,i)=><tr key={i}><td colSpan={10} className="px-4 py-3"><div className="h-12 animate-pulse rounded-xl bg-[#f1f4f2]"/></td></tr>)}
        {!props.loading && props.companies.map(c=><tr key={c.id} className="border-b border-[#eff2f0] hover:bg-[#fbfcfb]">
          <td className="px-4 py-4"><input type="checkbox" checked={props.selectedIds.includes(c.id)} onChange={()=>props.onSelect(c.id)}/></td>
          <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#e9f5f0] text-[11px] font-bold text-[#176b52]">{c.name.replace("บริษัท","").trim().slice(0,2)}</div><div><p className="max-w-[230px] truncate text-[12px] font-semibold text-[#25302b]">{c.name}</p><p className="mt-1 text-[10px] text-[#8a9490]">{c.email}</p></div></div></td>
          <td className="px-4 py-4 text-[11px] font-semibold">{c.code}</td><td className="px-4 py-4 text-[10px]">{c.industry}</td><td className="px-4 py-4 text-[10px] font-semibold">{c.plan}</td>
          <td className="px-4 py-4 text-[11px]">{c.factories}</td><td className="px-4 py-4 text-[11px]">{c.users}</td>
          <td className="px-4 py-4 text-[10px]">{c.machines} เครื่อง<br/><span className="text-[#8d9692]">{c.sensors} เซนเซอร์</span></td>
          <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge[c.status]}`}>{label[c.status]}</span></td>
          <td className="px-4 py-4"><div className="flex gap-1.5"><button onClick={()=>props.onView(c)} className="grid h-8 w-8 place-items-center rounded-[9px] border text-[#168066]"><Eye className="h-4 w-4"/></button><button onClick={()=>props.onStatusChange(c.id,c.status==="SUSPENDED"?"ACTIVE":"SUSPENDED")} className="grid h-8 w-8 place-items-center rounded-[9px] border text-[#b47a22]"><ShieldBan className="h-4 w-4"/></button><button onClick={()=>props.onDelete(c.id)} className="grid h-8 w-8 place-items-center rounded-[9px] border text-[#d1505e]"><Trash2 className="h-4 w-4"/></button></div></td>
        </tr>)}
        {!props.loading && !props.companies.length && <tr><td colSpan={10} className="py-20 text-center"><Search className="mx-auto h-6 w-6 text-[#85908a]"/><p className="mt-3 text-[13px] font-semibold">ไม่พบข้อมูลบริษัท</p></td></tr>}
      </tbody>
    </table></div>
    <div className="flex items-center justify-between border-t px-4 py-4 text-[10px]"><span>ทั้งหมด {props.totalItems} รายการ</span><div className="flex items-center gap-2"><button disabled={props.page<=1} onClick={()=>props.onPageChange(props.page-1)} className="grid h-9 w-9 place-items-center rounded-[10px] border disabled:opacity-40"><ChevronLeft className="h-4 w-4"/></button><span>หน้า {props.page} / {props.totalPages}</span><button disabled={props.page>=props.totalPages} onClick={()=>props.onPageChange(props.page+1)} className="grid h-9 w-9 place-items-center rounded-[10px] border disabled:opacity-40"><ChevronRight className="h-4 w-4"/></button></div></div>
  </>;
}

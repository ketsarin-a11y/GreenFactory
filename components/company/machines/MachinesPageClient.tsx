"use client";

import {
  Activity, CheckCircle2, CircleAlert, Cpu, Factory, Gauge, MoreHorizontal,
  Plus, QrCode, Search, Settings2, ShieldCheck, Sparkles, Trash2, Wrench, X
} from "lucide-react";
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type MT={machineTypeId:number;machineTypeCode:string;machineTypeName:string;description?:string|null};
type Line={lineId:number;lineCode:string;lineName:string};
type Dept={departmentId:number;departmentCode:string;departmentName:string;productionLines:Line[]};
type Building={buildingId:number;buildingCode:string;buildingName:string;departments:Dept[]};
type FactoryOpt={factoryId:number;factoryCode:string;factoryName:string;buildings:Building[]};
type Machine={
  id:number;code:string;name:string;manufacturer:string|null;model:string|null;serialNumber:string|null;
  installationDate:string|null;locationNote:string|null;operationalStatus:string;status:string;readiness:number;
  sensors:number;qrCodes:number;resourceUsages:number;
  machineType:{id:number;code:string;name:string};factory:{id:number;code:string;name:string};
  building:{id:number;code:string;name:string};department:{id:number;code:string;name:string};
  productionLine:{id:number;code:string;name:string};
};
type Resp={success:boolean;message?:string;data?:Machine[];hierarchy?:FactoryOpt[];machineTypes?:MT[];summary?:{total:number;active:number;maintenance:number;sensors:number;qrReady:number}};
type Form={factoryId:string;buildingId:string;departmentId:string;lineId:string;machineTypeId:string;machineCode:string;machineName:string;manufacturer:string;model:string;serialNumber:string;installationDate:string;locationNote:string;operationalStatus:string;status:string};
const empty:Form={factoryId:"",buildingId:"",departmentId:"",lineId:"",machineTypeId:"",machineCode:"",machineName:"",manufacturer:"",model:"",serialNumber:"",installationDate:"",locationNote:"",operationalStatus:"NORMAL",status:"ACTIVE"};

export default function MachinesPageClient(){
  const [machines,setMachines]=useState<Machine[]>([]),[hierarchy,setHierarchy]=useState<FactoryOpt[]>([]),[types,setTypes]=useState<MT[]>([]);
  const [summary,setSummary]=useState({total:0,active:0,maintenance:0,sensors:0,qrReady:0});
  const [search,setSearch]=useState(""),[factoryFilter,setFactoryFilter]=useState("ALL"),[statusFilter,setStatusFilter]=useState("ALL");
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState("");
  const [selected,setSelected]=useState<number|null>(null),[drawer,setDrawer]=useState(false),[editing,setEditing]=useState<Machine|null>(null),[menu,setMenu]=useState<number|null>(null),[form,setForm]=useState<Form>(empty);

  const load=useCallback(async()=>{
    try{
      setLoading(true);setError("");
      const r=await fetch("/api/company/machines",{cache:"no-store",credentials:"include"}),j:Resp=await r.json();
      if(!r.ok||!j.success)throw new Error(j.message||"โหลดข้อมูลไม่สำเร็จ");
      const m=j.data||[];setMachines(m);setHierarchy(j.hierarchy||[]);setTypes(j.machineTypes||[]);setSummary(j.summary||{total:0,active:0,maintenance:0,sensors:0,qrReady:0});
      setSelected(v=>v&&m.some(x=>x.id===v)?v:m[0]?.id??null);
    }catch(e){setError(e instanceof Error?e.message:"โหลดข้อมูลไม่สำเร็จ")}finally{setLoading(false)}
  },[]);
  useEffect(()=>{void load()},[load]);

  const filtered=useMemo(()=>machines.filter(m=>{
    const q=search.trim().toLowerCase();
    const text=[m.code,m.name,m.machineType.name,m.manufacturer||"",m.model||"",m.serialNumber||"",m.factory.name,m.building.name,m.department.name,m.productionLine.name].join(" ").toLowerCase();
    return (!q||text.includes(q))&&(factoryFilter==="ALL"||m.factory.id===Number(factoryFilter))&&(statusFilter==="ALL"||m.status===statusFilter||m.operationalStatus===statusFilter);
  }),[machines,search,factoryFilter,statusFilter]);
  const selectedMachine=machines.find(m=>m.id===selected)||null;

  function create(){setEditing(null);setForm(empty);setDrawer(true);setMenu(null)}
  function edit(m:Machine){setEditing(m);setForm({factoryId:String(m.factory.id),buildingId:String(m.building.id),departmentId:String(m.department.id),lineId:String(m.productionLine.id),machineTypeId:String(m.machineType.id),machineCode:m.code,machineName:m.name,manufacturer:m.manufacturer||"",model:m.model||"",serialNumber:m.serialNumber||"",installationDate:m.installationDate?.slice(0,10)||"",locationNote:m.locationNote||"",operationalStatus:m.operationalStatus,status:m.status});setDrawer(true);setMenu(null)}

  async function save(e:FormEvent){e.preventDefault();if(busy)return;try{
    setBusy(true);setError("");const r=await fetch(editing?`/api/company/machines/${editing.id}`:"/api/company/machines",{method:editing?"PATCH":"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,lineId:Number(form.lineId),machineTypeId:Number(form.machineTypeId)})}),j:Resp=await r.json();
    if(!r.ok||!j.success)throw new Error(j.message||"บันทึกไม่สำเร็จ");setDrawer(false);setEditing(null);setSuccess(j.message||"บันทึกเรียบร้อย");await load();setTimeout(()=>setSuccess(""),3000)
  }catch(e){setError(e instanceof Error?e.message:"บันทึกไม่สำเร็จ")}finally{setBusy(false)}}

  async function remove(m:Machine){if(!confirm(`ต้องการลบหรือปิดใช้งาน ${m.name} ใช่หรือไม่?`))return;try{setBusy(true);const r=await fetch(`/api/company/machines/${m.id}`,{method:"DELETE",credentials:"include"}),j:Resp=await r.json();if(!r.ok||!j.success)throw new Error(j.message||"ดำเนินการไม่สำเร็จ");setSuccess(j.message||"เรียบร้อย");await load()}catch(e){setError(e instanceof Error?e.message:"ดำเนินการไม่สำเร็จ")}finally{setBusy(false)}}

  return <><section className="mx-auto w-full max-w-[1680px] pb-12">
    <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-emerald-700"><ShieldCheck className="h-4 w-4"/>Asset Registry</div>
      <h1 className="text-[42px] font-bold tracking-[-.045em] text-slate-900">เครื่องจักร</h1><p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-500">ทะเบียนเครื่องจักรกลางของบริษัท เชื่อมโครงสร้างโรงงาน Sensor และ QR Code ไว้ในจุดเดียว</p></div>
      <button onClick={create} className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-emerald-700 px-6 text-[15px] font-bold text-white shadow-lg hover:bg-emerald-800"><Plus className="h-5 w-5"/>เพิ่มเครื่องจักร</button>
    </header>
    {(error||success)&&<div className={`mb-5 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold ${error?"border-red-200 bg-red-50 text-red-700":"border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error?<CircleAlert className="h-5 w-5"/>:<CheckCircle2 className="h-5 w-5"/>}{error||success}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Stat icon={<Settings2/>} value={summary.total} label="เครื่องทั้งหมด"/><Stat icon={<CheckCircle2/>} value={summary.active} label="เปิดใช้งาน"/><Stat icon={<Wrench/>} value={summary.maintenance} label="บำรุงรักษา"/><Stat icon={<Cpu/>} value={summary.sensors} label="Sensor"/><Stat icon={<QrCode/>} value={summary.qrReady} label="QR Ready"/>
    </div>
    <div className="mt-5 flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm xl:flex-row">
      <div className="flex h-[52px] flex-1 items-center gap-3 rounded-[14px] border border-slate-200 bg-slate-50 px-4"><Search className="h-5 w-5 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหารหัส ชื่อ ประเภท Serial หรือสถานที่..." className="flex-1 bg-transparent text-sm outline-none"/></div>
      <select value={factoryFilter} onChange={e=>setFactoryFilter(e.target.value)} className="h-[52px] rounded-[14px] border border-slate-200 px-4 text-sm font-semibold"><option value="ALL">ทุกโรงงาน</option>{hierarchy.map(f=><option key={f.factoryId} value={f.factoryId}>{f.factoryName}</option>)}</select>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-[52px] rounded-[14px] border border-slate-200 px-4 text-sm font-semibold"><option value="ALL">ทุกสถานะ</option><option value="ACTIVE">เปิดใช้งาน</option><option value="NORMAL">ทำงานปกติ</option><option value="MAINTENANCE">บำรุงรักษา</option><option value="WARNING">ต้องตรวจสอบ</option><option value="STOPPED">หยุดทำงาน</option><option value="INACTIVE">ปิดใช้งาน</option></select>
    </div>
    {loading?<div className="grid min-h-[450px] place-items-center"><div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"/></div>:machines.length===0?<Empty canAdd={hierarchy.some(f=>f.buildings.some(b=>b.departments.some(d=>d.productionLines.length)))} onAdd={create}/>:<div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="overflow-visible rounded-[22px] border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h2 className="text-lg font-bold text-slate-900">Machine Registry</h2><p className="mt-1 text-xs text-slate-400">แสดง {filtered.length} จาก {machines.length} เครื่อง</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1000px]"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-4">Machine</th><th className="px-4 py-4">Location</th><th className="px-4 py-4">Connectivity</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Readiness</th><th/></tr></thead><tbody>{filtered.map(m=><tr key={m.id} onClick={()=>setSelected(m.id)} className={`cursor-pointer border-t border-slate-100 ${selected===m.id?"bg-emerald-50/60":"hover:bg-slate-50"}`}>
        <td className="px-6 py-5"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Settings2 className="h-5 w-5"/></span><div><p className="text-sm font-bold text-slate-800">{m.name}</p><p className="mt-1 text-xs text-slate-400">{m.code} · {m.machineType.name}</p></div></div></td>
        <td className="px-4 py-5"><p className="text-sm font-semibold text-slate-700">{m.factory.name}</p><p className="mt-1 text-xs text-slate-400">{m.building.name} › {m.department.name} › {m.productionLine.name}</p></td>
        <td className="px-4 py-5"><div className="flex gap-2"><Chip icon={<Cpu/>} n={m.sensors}/><Chip icon={<QrCode/>} n={m.qrCodes}/></div></td><td className="px-4 py-5"><Badge status={m.status==="INACTIVE"?"INACTIVE":m.operationalStatus}/></td>
        <td className="px-4 py-5"><p className="text-sm font-bold">{m.readiness}%</p><div className="mt-2 h-2 w-28 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-600" style={{width:`${m.readiness}%`}}/></div></td>
        <td className="relative px-4"><button onClick={e=>{e.stopPropagation();setMenu(menu===m.id?null:m.id)}} className="h-9 w-9 rounded-xl text-slate-400 hover:bg-white"><MoreHorizontal/></button>{menu===m.id&&<div onClick={e=>e.stopPropagation()} className="absolute right-4 top-14 z-30 w-48 rounded-xl border bg-white p-2 shadow-xl"><button onClick={()=>edit(m)} className="w-full rounded-lg px-3 py-3 text-left text-sm font-semibold hover:bg-slate-50">แก้ไขข้อมูล</button><button onClick={()=>void remove(m)} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4"/>ลบ / ปิดใช้งาน</button></div>}</td>
      </tr>)}</tbody></table></div></div>
      <Inspector machine={selectedMachine} onEdit={()=>selectedMachine&&edit(selectedMachine)}/>
    </div>}
  </section>{drawer&&<Drawer editing={editing} hierarchy={hierarchy} types={types} form={form} setForm={setForm} busy={busy} onClose={()=>setDrawer(false)} onSubmit={save}/>}</>
}

function Stat({icon,value,label}:{icon:ReactNode;value:number;label:string}){return <div className="flex min-h-[120px] items-center gap-4 rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><div><p className="text-[29px] font-bold text-slate-900">{value}</p><p className="text-sm font-bold text-slate-700">{label}</p></div></div>}
function Chip({icon,n}:{icon:ReactNode;n:number}){return <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-600">{icon}{n}</span>}
function Badge({status}:{status:string}){const x:{[k:string]:[string,string]}={NORMAL:["ปกติ","bg-emerald-50 text-emerald-700"],MAINTENANCE:["บำรุงรักษา","bg-amber-50 text-amber-700"],WARNING:["ตรวจสอบ","bg-orange-50 text-orange-700"],STOPPED:["หยุดทำงาน","bg-red-50 text-red-700"],INACTIVE:["ปิดใช้งาน","bg-slate-100 text-slate-500"]};const c=x[status]||[status,"bg-slate-100 text-slate-600"];return <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${c[1]}`}>{c[0]}</span>}
function Inspector({machine,onEdit}:{machine:Machine|null;onEdit:()=>void}){if(!machine)return <aside className="rounded-[22px] border bg-white p-6 text-sm text-slate-400">เลือกเครื่องจักรเพื่อดูรายละเอียด</aside>;return <aside className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"><div className="bg-gradient-to-br from-emerald-800 to-emerald-600 p-6 text-white"><Settings2 className="h-7 w-7"/><p className="mt-5 text-xs font-bold tracking-widest text-white/60">{machine.code}</p><h2 className="mt-2 text-2xl font-bold">{machine.name}</h2><p className="mt-1 text-sm text-white/70">{machine.machineType.name}</p></div><div className="p-6"><Info l="ผู้ผลิต" v={machine.manufacturer||"—"}/><Info l="Model" v={machine.model||"—"}/><Info l="Serial" v={machine.serialNumber||"—"}/><div className="my-5 rounded-xl bg-slate-50 p-4"><p className="font-bold text-slate-700">{machine.factory.name}</p><p className="mt-2 text-xs leading-6 text-slate-500">{machine.building.name}<br/>{machine.department.name}<br/>{machine.productionLine.name}</p></div><div className="rounded-xl bg-emerald-50 p-4"><div className="flex justify-between"><p className="text-sm font-bold text-emerald-700">Asset Readiness</p><Sparkles className="text-emerald-600"/></div><p className="mt-2 text-3xl font-bold text-emerald-900">{machine.readiness}%</p></div><button onClick={onEdit} className="mt-5 h-12 w-full rounded-xl border text-sm font-bold text-slate-700 hover:bg-slate-50">แก้ไข Machine Profile</button></div></aside>}
function Info({l,v}:{l:string;v:string}){return <div className="flex justify-between border-b border-slate-100 py-3 text-sm"><span className="text-slate-400">{l}</span><span className="font-semibold text-slate-700">{v}</span></div>}

function Drawer({editing,hierarchy,types,form,setForm,busy,onClose,onSubmit}:{editing:Machine|null;hierarchy:FactoryOpt[];types:MT[];form:Form;setForm:React.Dispatch<React.SetStateAction<Form>>;busy:boolean;onClose:()=>void;onSubmit:(e:FormEvent)=>void}){
  const f=hierarchy.find(x=>x.factoryId===Number(form.factoryId)),bs=f?.buildings||[],b=bs.find(x=>x.buildingId===Number(form.buildingId)),ds=b?.departments||[],d=ds.find(x=>x.departmentId===Number(form.departmentId)),ls=d?.productionLines||[];
  return <><button onClick={onClose} className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm"/><aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[760px] overflow-y-auto bg-[#f7f9f8] shadow-2xl"><div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white/95 p-7 backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Asset Registry</p><h2 className="mt-2 text-[30px] font-bold text-slate-900">{editing?"แก้ไขเครื่องจักร":"เพิ่มเครื่องจักรใหม่"}</h2><p className="mt-2 text-sm text-slate-500">กำหนดตำแหน่งตามโครงสร้างจริง แล้วค่อยเชื่อม Sensor และ QR Code</p></div><button onClick={onClose} className="h-10 w-10 rounded-full border bg-white text-slate-400"><X className="mx-auto"/></button></div>
  <form onSubmit={onSubmit} className="space-y-5 p-7">
    <Section title="โครงสร้างโรงงาน"><div className="grid gap-4 sm:grid-cols-2">
      <Sel label="โรงงาน" value={form.factoryId} options={hierarchy.map(x=>[String(x.factoryId),x.factoryName])} onChange={v=>setForm(x=>({...x,factoryId:v,buildingId:"",departmentId:"",lineId:""}))}/>
      <Sel label="อาคาร" value={form.buildingId} disabled={!form.factoryId} options={bs.map(x=>[String(x.buildingId),x.buildingName])} onChange={v=>setForm(x=>({...x,buildingId:v,departmentId:"",lineId:""}))}/>
      <Sel label="แผนก" value={form.departmentId} disabled={!form.buildingId} options={ds.map(x=>[String(x.departmentId),x.departmentName])} onChange={v=>setForm(x=>({...x,departmentId:v,lineId:""}))}/>
      <Sel label="Production Line" value={form.lineId} disabled={!form.departmentId} options={ls.map(x=>[String(x.lineId),x.lineName])} onChange={v=>setForm(x=>({...x,lineId:v}))}/>
    </div></Section>
    <Section title="Machine Identity"><div className="grid gap-4 sm:grid-cols-2"><Field label="รหัสเครื่อง" value={form.machineCode} onChange={v=>setForm(x=>({...x,machineCode:v.toUpperCase()}))}/><Field label="ชื่อเครื่อง" value={form.machineName} onChange={v=>setForm(x=>({...x,machineName:v}))}/></div><div className="mt-4"><Sel label="ประเภทเครื่องจักร" value={form.machineTypeId} options={types.map(x=>[String(x.machineTypeId),`${x.machineTypeName} · ${x.machineTypeCode}`])} onChange={v=>setForm(x=>({...x,machineTypeId:v}))}/></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="ผู้ผลิต" value={form.manufacturer} req={false} onChange={v=>setForm(x=>({...x,manufacturer:v}))}/><Field label="Model" value={form.model} req={false} onChange={v=>setForm(x=>({...x,model:v}))}/><Field label="Serial Number" value={form.serialNumber} req={false} onChange={v=>setForm(x=>({...x,serialNumber:v}))}/><Field label="วันที่ติดตั้ง" type="date" value={form.installationDate} req={false} onChange={v=>setForm(x=>({...x,installationDate:v}))}/></div></Section>
    <Section title="Operation & Location"><div className="grid gap-4 sm:grid-cols-2"><Sel label="สถานะการทำงาน" value={form.operationalStatus} options={[["NORMAL","ทำงานปกติ"],["MAINTENANCE","บำรุงรักษา"],["WARNING","ต้องตรวจสอบ"],["STOPPED","หยุดทำงาน"]]} onChange={v=>setForm(x=>({...x,operationalStatus:v}))}/><Sel label="สถานะทะเบียน" value={form.status} options={[["ACTIVE","เปิดใช้งาน"],["INACTIVE","ปิดใช้งาน"]]} onChange={v=>setForm(x=>({...x,status:v}))}/></div><textarea value={form.locationNote} onChange={e=>setForm(x=>({...x,locationNote:e.target.value}))} placeholder="หมายเหตุตำแหน่งติดตั้ง..." className="mt-4 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-400"/></Section>
    <div className="sticky bottom-0 -mx-7 flex justify-end gap-3 border-t bg-white/95 px-7 py-5"><button type="button" onClick={onClose} className="h-12 rounded-xl border px-6 text-sm font-semibold">ยกเลิก</button><button disabled={busy||!form.lineId||!form.machineTypeId||!form.machineCode||!form.machineName} className="h-12 rounded-xl bg-emerald-700 px-7 text-sm font-bold text-white disabled:opacity-40">{busy?"กำลังบันทึก...":editing?"บันทึกการแก้ไข":"เพิ่มเครื่องจักร"}</button></div>
  </form></aside></>
}
function Section({title,children}:{title:string;children:ReactNode}){return <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-base font-bold text-slate-800">{title}</h3><div className="mt-5">{children}</div></section>}
function Field({label,value,onChange,type="text",req=true}:{label:string;value:string;onChange:(v:string)=>void;type?:string;req?:boolean}){return <label className="block text-sm font-semibold text-slate-600">{label}{req?" *":""}<input required={req} type={type} value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-normal outline-none focus:border-emerald-400"/></label>}
function Sel({label,value,onChange,options,disabled=false}:{label:string;value:string;onChange:(v:string)=>void;options:string[][];disabled?:boolean}){return <label className="block text-sm font-semibold text-slate-600">{label} *<select required value={value} disabled={disabled} onChange={e=>onChange(e.target.value)} className="mt-2 h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-normal outline-none disabled:text-slate-300"><option value="">เลือก{label}</option>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}
function Empty({canAdd,onAdd}:{canAdd:boolean;onAdd:()=>void}){return <div className="mt-5 grid min-h-[430px] place-items-center rounded-[22px] border border-dashed border-slate-300 bg-white text-center"><div><Settings2 className="mx-auto h-10 w-10 text-emerald-700"/><h2 className="mt-4 text-xl font-bold text-slate-800">{canAdd?"ยังไม่มีเครื่องจักร":"ยังไม่มี Production Line"}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{canAdd?"เริ่มเพิ่มเครื่องจักรจริงลงฐานข้อมูลได้เลย":"ต้องมี โรงงาน → อาคาร → แผนก → Production Line ก่อน เพราะ Machine ผูกกับ lineId"}</p>{canAdd&&<button onClick={onAdd} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">เพิ่มเครื่องจักรแรก</button>}</div></div>}

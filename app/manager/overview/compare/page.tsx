import { redirect } from "next/navigation";
import ManagerComparePage from "@/components/manager/ManagerComparePage";
import { computeResourceMetrics, ENERGY_TYPES, WATER_TYPES } from "@/lib/manager queries";
import { getSession } from "@/lib/session";

export const dynamic="force-dynamic";
const ago=(n:number)=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)};
export default async function ComparePage({searchParams}:{searchParams:Promise<{from?:string;to?:string}>}) {
 const s=await getSession();if(!s)redirect("/login");if(s.roleName!=="MANAGER")redirect("/");if(!s.companyId)redirect("/");
 const p=await searchParams,from=p.from??ago(6),to=p.to??ago(0),start=new Date(`${from}T00:00:00`),end=new Date(`${to}T23:59:59`);
 const days=Math.max(1,Math.round((end.getTime()-start.getTime())/86400000)+1);
 const prevEnd=new Date(start);prevEnd.setDate(prevEnd.getDate()-1);prevEnd.setHours(23,59,59,999);
 const prevStart=new Date(start);prevStart.setDate(prevStart.getDate()-days);prevStart.setHours(0,0,0,0);
 const defs=[["Electricity",ENERGY_TYPES,"kWh"],["Water",WATER_TYPES,"m³"],["Compressed Air",["COMPRESSED_AIR"],"m³"],["Gas",["GAS"],"m³"],["Steam",["STEAM"],"kg"],["Nitrogen",["NITROGEN"],"m³"],["Diesel",["DIESEL"],"L"]] as const;
 const rows=await Promise.all(defs.map(async([name,codes,unit])=>{const [c,pr]=await Promise.all([computeResourceMetrics(s.companyId!,codes,start,end,unit),computeResourceMetrics(s.companyId!,codes,prevStart,prevEnd,unit)]);return{name,current:c.total,previous:pr.total,unit,change:pr.total===0?(c.total>0?100:0):((c.total-pr.total)/pr.total)*100}}));
 return <ManagerComparePage rows={rows} dateFrom={from} dateTo={to} previousFrom={prevStart.toISOString().slice(0,10)} previousTo={prevEnd.toISOString().slice(0,10)}/>;
}

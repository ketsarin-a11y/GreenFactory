import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
type Ctx={params:Promise<{id:string}>};
async function auth(){const s=await getSession();return s&&s.roleName==="COMPANY_ADMIN"&&s.companyId?s:null}
async function owned(id:number,companyId:number){return prisma.productionLine.findFirst({where:{lineId:id,department:{building:{factory:{companyId}}}},select:{lineId:true,departmentId:true,lineCode:true,_count:{select:{machines:true,checkpoints:true,resourceUsages:true,kpis:true,alerts:true,aiRecommendations:true}}}})}
export async function PATCH(request:Request,{params}:Ctx){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการสายการผลิต"},{status:403});
    const id=Number((await params).id),cur=await owned(id,s.companyId);if(!cur)return NextResponse.json({success:false,message:"ไม่พบสายการผลิตในบริษัทนี้"},{status:404});
    const b=await request.json(),departmentId=b.departmentId===undefined?cur.departmentId:Number(b.departmentId);
    if(b.departmentId!==undefined&&!await prisma.department.findFirst({where:{departmentId,building:{factory:{companyId:s.companyId}}},select:{departmentId:true}}))return NextResponse.json({success:false,message:"ไม่พบแผนกในบริษัทนี้"},{status:404});
    const code=b.lineCode===undefined?cur.lineCode:String(b.lineCode).trim().toUpperCase();
    const dup=await prisma.productionLine.findFirst({where:{departmentId,lineCode:code,NOT:{lineId:id}},select:{lineId:true}});
    if(dup)return NextResponse.json({success:false,message:"รหัสสายการผลิตนี้มีอยู่ในแผนกแล้ว"},{status:409});
    await prisma.productionLine.update({where:{lineId:id},data:{
      ...(b.departmentId!==undefined&&{departmentId}),...(b.lineCode!==undefined&&{lineCode:code}),
      ...(b.lineName!==undefined&&{lineName:String(b.lineName).trim()}),
      ...(b.description!==undefined&&{description:String(b.description).trim()||null}),
      ...(b.status!==undefined&&{status:b.status==="INACTIVE"?"INACTIVE":"ACTIVE"})
    }});
    return NextResponse.json({success:true,message:"บันทึกข้อมูลสายการผลิตเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"แก้ไขสายการผลิตไม่สำเร็จ"},{status:500})}
}
export async function DELETE(_request:Request,{params}:Ctx){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการสายการผลิต"},{status:403});
    const id=Number((await params).id),cur=await owned(id,s.companyId);if(!cur)return NextResponse.json({success:false,message:"ไม่พบสายการผลิตในบริษัทนี้"},{status:404});
    const linked=Object.values(cur._count).some(v=>v>0);
    if(linked){await prisma.productionLine.update({where:{lineId:id},data:{status:"INACTIVE"}});return NextResponse.json({success:true,message:"สายการผลิตมีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ"})}
    await prisma.productionLine.delete({where:{lineId:id}});return NextResponse.json({success:true,message:"ลบสายการผลิตเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"ลบสายการผลิตไม่สำเร็จ"},{status:500})}
}

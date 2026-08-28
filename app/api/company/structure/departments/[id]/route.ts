import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
type Ctx={params:Promise<{id:string}>};
async function auth(){const s=await getSession();return s&&s.roleName==="COMPANY_ADMIN"&&s.companyId?s:null}
async function owned(id:number,companyId:number){return prisma.department.findFirst({where:{departmentId:id,building:{factory:{companyId}}},select:{departmentId:true,buildingId:true,departmentCode:true,_count:{select:{productionLines:true,users:true,resourceUsages:true,kpis:true,alerts:true,aiRecommendations:true}}}})}
export async function PATCH(request:Request,{params}:Ctx){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการแผนก"},{status:403});
    const id=Number((await params).id),cur=await owned(id,s.companyId);if(!cur)return NextResponse.json({success:false,message:"ไม่พบแผนกในบริษัทนี้"},{status:404});
    const b=await request.json(),buildingId=b.buildingId===undefined?cur.buildingId:Number(b.buildingId);
    if(b.buildingId!==undefined&&!await prisma.building.findFirst({where:{buildingId,factory:{companyId:s.companyId}},select:{buildingId:true}}))return NextResponse.json({success:false,message:"ไม่พบอาคารในบริษัทนี้"},{status:404});
    const code=b.departmentCode===undefined?cur.departmentCode:String(b.departmentCode).trim().toUpperCase();
    const dup=await prisma.department.findFirst({where:{buildingId,departmentCode:code,NOT:{departmentId:id}},select:{departmentId:true}});
    if(dup)return NextResponse.json({success:false,message:"รหัสแผนกนี้มีอยู่ในอาคารแล้ว"},{status:409});
    await prisma.department.update({where:{departmentId:id},data:{
      ...(b.buildingId!==undefined&&{buildingId}),...(b.departmentCode!==undefined&&{departmentCode:code}),
      ...(b.departmentName!==undefined&&{departmentName:String(b.departmentName).trim()}),
      ...(b.description!==undefined&&{description:String(b.description).trim()||null}),
      ...(b.status!==undefined&&{status:b.status==="INACTIVE"?"INACTIVE":"ACTIVE"})
    }});
    return NextResponse.json({success:true,message:"บันทึกข้อมูลแผนกเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"แก้ไขแผนกไม่สำเร็จ"},{status:500})}
}
export async function DELETE(_request:Request,{params}:Ctx){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการแผนก"},{status:403});
    const id=Number((await params).id),cur=await owned(id,s.companyId);if(!cur)return NextResponse.json({success:false,message:"ไม่พบแผนกในบริษัทนี้"},{status:404});
    const linked=Object.values(cur._count).some(v=>v>0);
    if(linked){await prisma.department.update({where:{departmentId:id},data:{status:"INACTIVE"}});return NextResponse.json({success:true,message:"แผนกมีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ"})}
    await prisma.department.delete({where:{departmentId:id}});return NextResponse.json({success:true,message:"ลบแผนกเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"ลบแผนกไม่สำเร็จ"},{status:500})}
}

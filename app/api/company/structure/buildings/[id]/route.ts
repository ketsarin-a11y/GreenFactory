import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
type Ctx={params:Promise<{id:string}>};

async function auth(){const s=await getSession();return s&&s.roleName==="COMPANY_ADMIN"&&s.companyId?s:null}
async function owned(id:number,companyId:number){return prisma.building.findFirst({where:{buildingId:id,factory:{companyId}},select:{buildingId:true,factoryId:true,buildingCode:true,_count:{select:{departments:true,resourceUsages:true,kpis:true,alerts:true,aiRecommendations:true}}}})}

export async function PATCH(request:Request,{params}:Ctx){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการอาคาร"},{status:403});
    const buildingId=Number((await params).id), cur=await owned(buildingId,s.companyId);
    if(!cur)return NextResponse.json({success:false,message:"ไม่พบอาคารในบริษัทนี้"},{status:404});
    const b=await request.json(), factoryId=b.factoryId===undefined?cur.factoryId:Number(b.factoryId);
    if(b.factoryId!==undefined&&!await prisma.factory.findFirst({where:{factoryId,companyId:s.companyId},select:{factoryId:true}}))return NextResponse.json({success:false,message:"ไม่พบโรงงานในบริษัทนี้"},{status:404});
    const code=b.buildingCode===undefined?cur.buildingCode:String(b.buildingCode).trim().toUpperCase();
    const dup=await prisma.building.findFirst({where:{factoryId,buildingCode:code,NOT:{buildingId}},select:{buildingId:true}});
    if(dup)return NextResponse.json({success:false,message:"รหัสอาคารนี้มีอยู่ในโรงงานแล้ว"},{status:409});
    await prisma.building.update({where:{buildingId},data:{
      ...(b.factoryId!==undefined&&{factoryId}),...(b.buildingCode!==undefined&&{buildingCode:code}),
      ...(b.buildingName!==undefined&&{buildingName:String(b.buildingName).trim()}),
      ...(b.buildingType!==undefined&&{buildingType:String(b.buildingType).trim()||null}),
      ...(b.floorCount!==undefined&&{floorCount:b.floorCount===""||b.floorCount==null?null:Number(b.floorCount)}),
      ...(b.description!==undefined&&{description:String(b.description).trim()||null}),
      ...(b.status!==undefined&&{status:b.status==="INACTIVE"?"INACTIVE":"ACTIVE"})
    }});
    return NextResponse.json({success:true,message:"บันทึกข้อมูลอาคารเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"แก้ไขอาคารไม่สำเร็จ"},{status:500})}
}
export async function DELETE(_request:Request,{params}:Ctx){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการอาคาร"},{status:403});
    const id=Number((await params).id),cur=await owned(id,s.companyId);if(!cur)return NextResponse.json({success:false,message:"ไม่พบอาคารในบริษัทนี้"},{status:404});
    const linked=Object.values(cur._count).some(v=>v>0);
    if(linked){await prisma.building.update({where:{buildingId:id},data:{status:"INACTIVE"}});return NextResponse.json({success:true,message:"อาคารมีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ"})}
    await prisma.building.delete({where:{buildingId:id}});return NextResponse.json({success:true,message:"ลบอาคารเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"ลบอาคารไม่สำเร็จ"},{status:500})}
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
async function auth(){const s=await getSession();return s&&s.roleName==="COMPANY_ADMIN"&&s.companyId?s:null}
export async function POST(request:Request){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการแผนก"},{status:403});
    const b=await request.json(),buildingId=Number(b.buildingId),departmentCode=String(b.departmentCode??"").trim().toUpperCase(),departmentName=String(b.departmentName??"").trim();
    if(!buildingId||!departmentCode||!departmentName)return NextResponse.json({success:false,message:"กรุณาระบุอาคาร รหัสแผนก และชื่อแผนก"},{status:400});
    const building=await prisma.building.findFirst({where:{buildingId,factory:{companyId:s.companyId}},select:{buildingId:true}});
    if(!building)return NextResponse.json({success:false,message:"ไม่พบอาคารในบริษัทนี้"},{status:404});
    const dup=await prisma.department.findFirst({where:{buildingId,departmentCode},select:{departmentId:true}});
    if(dup)return NextResponse.json({success:false,message:"รหัสแผนกนี้มีอยู่ในอาคารแล้ว"},{status:409});
    await prisma.department.create({data:{buildingId,departmentCode,departmentName,description:String(b.description??"").trim()||null,status:b.status==="INACTIVE"?"INACTIVE":"ACTIVE"}});
    return NextResponse.json({success:true,message:"เพิ่มแผนกเรียบร้อยแล้ว"},{status:201});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"เพิ่มแผนกไม่สำเร็จ"},{status:500})}
}

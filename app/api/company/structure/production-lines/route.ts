import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
async function auth(){const s=await getSession();return s&&s.roleName==="COMPANY_ADMIN"&&s.companyId?s:null}
export async function POST(request:Request){
  try{
    const s=await auth();if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการสายการผลิต"},{status:403});
    const b=await request.json(),departmentId=Number(b.departmentId),lineCode=String(b.lineCode??"").trim().toUpperCase(),lineName=String(b.lineName??"").trim();
    if(!departmentId||!lineCode||!lineName)return NextResponse.json({success:false,message:"กรุณาระบุแผนก รหัสสายการผลิต และชื่อสายการผลิต"},{status:400});
    const department=await prisma.department.findFirst({where:{departmentId,building:{factory:{companyId:s.companyId}}},select:{departmentId:true}});
    if(!department)return NextResponse.json({success:false,message:"ไม่พบแผนกในบริษัทนี้"},{status:404});
    const dup=await prisma.productionLine.findFirst({where:{departmentId,lineCode},select:{lineId:true}});
    if(dup)return NextResponse.json({success:false,message:"รหัสสายการผลิตนี้มีอยู่ในแผนกแล้ว"},{status:409});
    await prisma.productionLine.create({data:{departmentId,lineCode,lineName,description:String(b.description??"").trim()||null,status:b.status==="INACTIVE"?"INACTIVE":"ACTIVE"}});
    return NextResponse.json({success:true,message:"เพิ่มสายการผลิตเรียบร้อยแล้ว"},{status:201});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"เพิ่มสายการผลิตไม่สำเร็จ"},{status:500})}
}

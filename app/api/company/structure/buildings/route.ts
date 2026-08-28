import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function auth(){const s=await getSession();return s&&s.roleName==="COMPANY_ADMIN"&&s.companyId?s:null}

export async function POST(request:Request){
  try{
    const s=await auth(); if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์จัดการอาคาร"},{status:403});
    const b=await request.json(), factoryId=Number(b.factoryId);
    const buildingCode=String(b.buildingCode??"").trim().toUpperCase(), buildingName=String(b.buildingName??"").trim();
    if(!factoryId||!buildingCode||!buildingName)return NextResponse.json({success:false,message:"กรุณาระบุโรงงาน รหัสอาคาร และชื่ออาคาร"},{status:400});
    const factory=await prisma.factory.findFirst({where:{factoryId,companyId:s.companyId},select:{factoryId:true}});
    if(!factory)return NextResponse.json({success:false,message:"ไม่พบโรงงานในบริษัทนี้"},{status:404});
    const dup=await prisma.building.findFirst({where:{factoryId,buildingCode},select:{buildingId:true}});
    if(dup)return NextResponse.json({success:false,message:"รหัสอาคารนี้มีอยู่ในโรงงานแล้ว"},{status:409});
    await prisma.building.create({data:{
      factoryId,buildingCode,buildingName,
      buildingType:String(b.buildingType??"").trim()||null,
      floorCount:b.floorCount===""||b.floorCount==null?null:Number(b.floorCount),
      description:String(b.description??"").trim()||null,
      status:b.status==="INACTIVE"?"INACTIVE":"ACTIVE"
    }});
    return NextResponse.json({success:true,message:"เพิ่มอาคารเรียบร้อยแล้ว"},{status:201});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"เพิ่มอาคารไม่สำเร็จ"},{status:500})}
}

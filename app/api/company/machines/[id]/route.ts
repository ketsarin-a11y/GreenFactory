import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Ctx={params:Promise<{id:string}>};

async function auth(){
  const s=await getSession();
  return s&&s.roleName==="COMPANY_ADMIN"&&s.companyId?s:null;
}
async function owned(machineId:number,companyId:number){
  return prisma.machine.findFirst({
    where:{machineId,productionLine:{department:{building:{factory:{companyId}}}}},
    include:{_count:{select:{sensors:true,qrCodes:true,resourceUsages:true}}},
  });
}

export async function PATCH(request:Request,{params}:Ctx){
  try{
    const s=await auth(); if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์เข้าถึง"},{status:403});
    const machineId=Number((await params).id), current=await owned(machineId,s.companyId);
    if(!current)return NextResponse.json({success:false,message:"ไม่พบเครื่องจักรในบริษัทนี้"},{status:404});
    const b=await request.json(), lineId=b.lineId===undefined?current.lineId:Number(b.lineId);

    if(b.lineId!==undefined){
      const line=await prisma.productionLine.findFirst({where:{lineId,department:{building:{factory:{companyId:s.companyId}}}},select:{lineId:true}});
      if(!line)return NextResponse.json({success:false,message:"ไม่พบ Production Line ในบริษัทนี้"},{status:404});
    }

    const machineCode=b.machineCode===undefined?current.machineCode:String(b.machineCode).trim().toUpperCase();
    const dup=await prisma.machine.findFirst({where:{lineId,machineCode,NOT:{machineId}},select:{machineId:true}});
    if(dup)return NextResponse.json({success:false,message:"รหัสเครื่องจักรซ้ำใน Production Line"},{status:409});

    await prisma.machine.update({where:{machineId},data:{
      ...(b.lineId!==undefined&&{lineId}),
      ...(b.machineTypeId!==undefined&&{machineTypeId:Number(b.machineTypeId)}),
      ...(b.machineCode!==undefined&&{machineCode}),
      ...(b.machineName!==undefined&&{machineName:String(b.machineName).trim()}),
      ...(b.manufacturer!==undefined&&{manufacturer:String(b.manufacturer).trim()||null}),
      ...(b.model!==undefined&&{model:String(b.model).trim()||null}),
      ...(b.serialNumber!==undefined&&{serialNumber:String(b.serialNumber).trim()||null}),
      ...(b.installationDate!==undefined&&{installationDate:b.installationDate?new Date(`${b.installationDate}T00:00:00`):null}),
      ...(b.locationNote!==undefined&&{locationNote:String(b.locationNote).trim()||null}),
      ...(b.operationalStatus!==undefined&&{operationalStatus:String(b.operationalStatus)}),
      ...(b.status!==undefined&&{status:b.status==="INACTIVE"?"INACTIVE":"ACTIVE"}),
    }});
    return NextResponse.json({success:true,message:"บันทึกข้อมูลเครื่องจักรเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"แก้ไขไม่สำเร็จ"},{status:500});}
}

export async function DELETE(_request:Request,{params}:Ctx){
  try{
    const s=await auth(); if(!s)return NextResponse.json({success:false,message:"ไม่มีสิทธิ์เข้าถึง"},{status:403});
    const machineId=Number((await params).id), current=await owned(machineId,s.companyId);
    if(!current)return NextResponse.json({success:false,message:"ไม่พบเครื่องจักรในบริษัทนี้"},{status:404});
    if(current._count.sensors||current._count.qrCodes||current._count.resourceUsages){
      await prisma.machine.update({where:{machineId},data:{status:"INACTIVE"}});
      return NextResponse.json({success:true,message:"มีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ"});
    }
    await prisma.machine.delete({where:{machineId}});
    return NextResponse.json({success:true,message:"ลบเครื่องจักรเรียบร้อยแล้ว"});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:"ลบไม่สำเร็จ"},{status:500});}
}

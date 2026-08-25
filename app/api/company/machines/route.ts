import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function auth() {
  const session = await getSession();
  if (!session || session.roleName !== "COMPANY_ADMIN" || !session.companyId) return null;
  return session;
}

const scope = (companyId: number) => ({
  productionLine: { department: { building: { factory: { companyId } } } },
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success:false, message:"ไม่มีสิทธิ์เข้าถึง" }, { status:403 });

    const [machines, hierarchy, machineTypes] = await Promise.all([
      prisma.machine.findMany({
        where: scope(session.companyId),
        orderBy: { machineName:"asc" },
        include: {
          machineType:true,
          productionLine:{ include:{ department:{ include:{ building:{ include:{ factory:true } } } } } },
          _count:{ select:{ sensors:true, qrCodes:true, resourceUsages:true } },
        },
      }),
      prisma.factory.findMany({
        where:{ companyId:session.companyId, status:"ACTIVE" },
        orderBy:{ factoryName:"asc" },
        include:{
          buildings:{
            where:{ status:"ACTIVE" },
            orderBy:{ buildingName:"asc" },
            include:{
              departments:{
                where:{ status:"ACTIVE" },
                orderBy:{ departmentName:"asc" },
                include:{
                  productionLines:{
                    where:{ status:"ACTIVE" },
                    orderBy:{ lineName:"asc" },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.machineType.findMany({
        where:{ status:"ACTIVE" },
        orderBy:{ machineTypeName:"asc" },
      }),
    ]);

    const data = machines.map((m) => {
      const d=m.productionLine.department, b=d.building, f=b.factory;
      const checks=[m.machineCode,m.machineName,m.machineTypeId,m.lineId,m.manufacturer,m.model,m.serialNumber,m.installationDate,m.locationNote,m._count.sensors>0,m._count.qrCodes>0];
      return {
        id:m.machineId, code:m.machineCode, name:m.machineName,
        manufacturer:m.manufacturer, model:m.model, serialNumber:m.serialNumber,
        installationDate:m.installationDate, locationNote:m.locationNote,
        operationalStatus:m.operationalStatus, status:m.status,
        machineType:{ id:m.machineType.machineTypeId, code:m.machineType.machineTypeCode, name:m.machineType.machineTypeName },
        factory:{ id:f.factoryId, code:f.factoryCode, name:f.factoryName },
        building:{ id:b.buildingId, code:b.buildingCode, name:b.buildingName },
        department:{ id:d.departmentId, code:d.departmentCode, name:d.departmentName },
        productionLine:{ id:m.productionLine.lineId, code:m.productionLine.lineCode, name:m.productionLine.lineName },
        sensors:m._count.sensors, qrCodes:m._count.qrCodes, resourceUsages:m._count.resourceUsages,
        readiness:Math.round(checks.filter(Boolean).length/checks.length*100),
      };
    });

    return NextResponse.json({
      success:true, data, hierarchy, machineTypes,
      summary:{
        total:data.length,
        active:data.filter(x=>x.status==="ACTIVE").length,
        maintenance:data.filter(x=>x.operationalStatus==="MAINTENANCE").length,
        sensors:data.reduce((s,x)=>s+x.sensors,0),
        qrReady:data.filter(x=>x.qrCodes>0).length,
      },
    });
  } catch(error) {
    console.error(error);
    return NextResponse.json({ success:false, message:error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ" }, { status:500 });
  }
}

export async function POST(request:Request) {
  try {
    const session=await auth();
    if(!session) return NextResponse.json({success:false,message:"ไม่มีสิทธิ์เข้าถึง"},{status:403});
    const body=await request.json();
    const lineId=Number(body.lineId), machineTypeId=Number(body.machineTypeId);
    const machineCode=String(body.machineCode??"").trim().toUpperCase();
    const machineName=String(body.machineName??"").trim();

    if(!lineId||!machineTypeId||!machineCode||!machineName)
      return NextResponse.json({success:false,message:"กรุณากรอกข้อมูลที่จำเป็นให้ครบ"},{status:400});

    const line=await prisma.productionLine.findFirst({
      where:{ lineId, department:{ building:{ factory:{ companyId:session.companyId } } } },
      select:{lineId:true},
    });
    if(!line) return NextResponse.json({success:false,message:"ไม่พบ Production Line ในบริษัทนี้"},{status:404});

    const type=await prisma.machineType.findFirst({where:{machineTypeId,status:"ACTIVE"},select:{machineTypeId:true}});
    if(!type) return NextResponse.json({success:false,message:"ไม่พบประเภทเครื่องจักร"},{status:404});

    const dup=await prisma.machine.findFirst({where:{lineId,machineCode},select:{machineId:true}});
    if(dup) return NextResponse.json({success:false,message:"รหัสเครื่องจักรนี้มีอยู่ในสายการผลิตแล้ว"},{status:409});

    await prisma.machine.create({data:{
      lineId,machineTypeId,machineCode,machineName,
      manufacturer:String(body.manufacturer??"").trim()||null,
      model:String(body.model??"").trim()||null,
      serialNumber:String(body.serialNumber??"").trim()||null,
      installationDate:body.installationDate?new Date(`${body.installationDate}T00:00:00`):null,
      locationNote:String(body.locationNote??"").trim()||null,
      operationalStatus:String(body.operationalStatus??"NORMAL"),
      status:body.status==="INACTIVE"?"INACTIVE":"ACTIVE",
    }});

    return NextResponse.json({success:true,message:"เพิ่มเครื่องจักรเรียบร้อยแล้ว"},{status:201});
  } catch(error) {
    return NextResponse.json({success:false,message:error instanceof Error?error.message:"เพิ่มเครื่องจักรไม่สำเร็จ"},{status:500});
  }
}

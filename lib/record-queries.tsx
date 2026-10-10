import "server-only";

import { analyzeResourceUsage } from "@/lib/anomaly-engine";
import { processResourceUsageCarbon } from "@/lib/carbon-engine";

import { randomUUID } from "crypto";



import { prisma } from "@/lib/prisma";



export interface MachineListItem {

  machineId: number;

  machineCode: string;

  machineName: string;

  machineType: string;



  operationalStatus: string;



  lineId: number;

  lineName: string;



  departmentId: number;

  departmentName: string;



  buildingId: number;

  buildingName: string;



  factoryId: number;

  factoryName: string;

}



export interface EquipmentListItem {

  equipmentId: number;

  name: string;

  equipmentCode: string | null;

  equipmentType: string | null;

  productionLine: string | null;

  department: string | null;

  location: string;

  status: string;

  resourceType: string;

  resourceUnit: string;

}



export interface ResourceTypeListItem {

  resourceTypeId: number;

  resourceCode: string;

  resourceName: string;

  carbonCalculable: boolean;



  unit: {

    unitId: number;

    unitCode: string;

    unitName: string;

    symbol: string;

  };



  category: {

    categoryId: number;

    categoryCode: string;

    categoryName: string;

  };

}



export interface TodayUsageTotal {

  resourceTypeId: number;

  key: string;

  label: string;

  unit: string;

  total: number;

  recordCount: number;

}



/**

 * รายการเครื่องจักรจริงของบริษัท

 *

 * Machine

 * → ProductionLine

 * → Department

 * → Building

 * → Factory

 */

export async function getMachineList(

  companyId: number | null,

  search?: string,

): Promise<MachineListItem[]> {

  if (companyId === null) {

    return [];

  }



  const machines = await prisma.machine.findMany({

    where: {

      status: "ACTIVE",



      productionLine: {

        department: {

          building: {

            factory: {

              companyId,

            },

          },

        },

      },



      ...(search

        ? {

            OR: [

              {

                machineName: {

                  contains: search,

                },

              },

              {

                machineCode: {

                  contains: search,

                },

              },

              {

                machineType: {

                  machineTypeName: {

                    contains: search,

                  },

                },

              },

            ],

          }

        : {}),

    },



    orderBy: {

      machineName: "asc",

    },



    select: {

      machineId: true,

      machineCode: true,

      machineName: true,

      operationalStatus: true,



      machineType: {

        select: {

          machineTypeName: true,

        },

      },



      productionLine: {

        select: {

          lineId: true,

          lineName: true,



          department: {

            select: {

              departmentId: true,

              departmentName: true,



              building: {

                select: {

                  buildingId: true,

                  buildingName: true,



                  factory: {

                    select: {

                      factoryId: true,

                      factoryName: true,

                    },

                  },

                },

              },

            },

          },

        },

      },

    },

  });



  return machines.map((machine) => ({

    machineId: machine.machineId,

    machineCode: machine.machineCode,

    machineName: machine.machineName,

    machineType: machine.machineType.machineTypeName,



    operationalStatus: machine.operationalStatus,



    lineId: machine.productionLine.lineId,

    lineName: machine.productionLine.lineName,



    departmentId:

      machine.productionLine.department.departmentId,



    departmentName:

      machine.productionLine.department.departmentName,



    buildingId:

      machine.productionLine.department.building.buildingId,



    buildingName:

      machine.productionLine.department.building.buildingName,



    factoryId:

      machine.productionLine.department.building.factory.factoryId,



    factoryName:

      machine.productionLine.department.building.factory.factoryName,

  }));

}



/**

 * Compatibility layer สำหรับหน้า Operator เดิมที่ยังอ้างชื่อ Equipment

 *

 * ข้อมูลจริงอ่านจาก Machine ใหม่ ไม่ได้อ่านจาก Equipment legacy

 * หลัง migrate หน้า Operator ครบแล้วจึงค่อยลบส่วนนี้

 */

export async function getEquipmentList(

  companyId: number | null,

  search?: string,

): Promise<EquipmentListItem[]> {

  const machines = await getMachineList(companyId, search);



  return machines.map((machine) => ({

    equipmentId: machine.machineId,

    name: machine.machineName,

    equipmentCode: machine.machineCode,

    equipmentType: machine.machineType,

    productionLine: machine.lineName,

    department: machine.departmentName,

    location: [machine.factoryName, machine.buildingName]

      .filter(Boolean)

      .join(" / "),

    status: machine.operationalStatus,



    // Machine ใหม่ไม่ได้ผูก Resource Type แบบ 1:1

    // หน้า Record ใหม่ต้องเลือก ResourceTypeMaster แยกต่างหาก

    resourceType: "",

    resourceUnit: "",

  }));

}



/**

 * Resource Type จริงจาก Master Data

 *

 * ResourceTypeMaster

 * → ResourceCategory

 * → Unit

 */

export async function getResourceTypeList(): Promise<

  ResourceTypeListItem[]

> {

  const resourceTypes =

    await prisma.resourceTypeMaster.findMany({

      where: {

        status: "ACTIVE",

        defaultUnit: {

          status: "ACTIVE",

        },

      },



      orderBy: {

        resourceName: "asc",

      },



      select: {

        resourceTypeId: true,

        resourceCode: true,

        resourceName: true,

        carbonCalculable: true,



        defaultUnit: {

          select: {

            unitId: true,

            unitCode: true,

            unitName: true,

            symbol: true,

          },

        },



        category: {

          select: {

            categoryId: true,

            categoryCode: true,

            categoryName: true,

          },

        },

      },

    });



  return resourceTypes.map((resource) => ({

    resourceTypeId: resource.resourceTypeId,

    resourceCode: resource.resourceCode,

    resourceName: resource.resourceName,

    carbonCalculable: resource.carbonCalculable,



    unit: {

      unitId: resource.defaultUnit.unitId,

      unitCode: resource.defaultUnit.unitCode,

      unitName: resource.defaultUnit.unitName,

      symbol: resource.defaultUnit.symbol,

    },



    category: {

      categoryId: resource.category.categoryId,

      categoryCode: resource.category.categoryCode,

      categoryName: resource.category.categoryName,

    },

  }));

}



/**

 * สรุปข้อมูลที่ Operator บันทึกวันนี้

 *

 * ใช้ ResourceUsage ใหม่เท่านั้น

 */

export async function getTodayUsageTotals(

  companyId: number | null,

): Promise<TodayUsageTotal[]> {

  if (companyId === null) {

    return [];

  }



  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);



  const endOfToday = new Date();

  endOfToday.setHours(23, 59, 59, 999);



  const usages = await prisma.resourceUsage.findMany({

    where: {

      companyId,

      status: "ACTIVE",



      usageAt: {

        gte: startOfToday,

        lte: endOfToday,

      },

    },



    select: {

      quantity: true,



      resourceType: {

        select: {

          resourceTypeId: true,

          resourceCode: true,

          resourceName: true,

        },

      },



      unit: {

        select: {

          symbol: true,

        },

      },

    },

  });



  const totals = new Map<

    number,

    TodayUsageTotal

  >();



  for (const usage of usages) {

    const resourceTypeId =

      usage.resourceType.resourceTypeId;



    const current = totals.get(resourceTypeId);



    const quantity = Number(usage.quantity);



    if (current) {

      current.total += quantity;

      current.recordCount += 1;



      continue;

    }



    totals.set(resourceTypeId, {

      resourceTypeId,



      key: usage.resourceType.resourceCode,



      label: usage.resourceType.resourceName,



      unit: usage.unit.symbol,



      total: quantity,



      recordCount: 1,

    });

  }



  return Array.from(totals.values()).map((item) => ({

    ...item,

    total:

      Math.round((item.total + Number.EPSILON) * 100) /

      100,

  }));

}



export interface CreateResourceUsageInput {

  companyId: number;

  recordedBy: number;



  machineId?: number | null;

  checkpointId?: number | null;

  qrScanId?: bigint | null;



  resourceTypeId: number;

  unitId: number;



  quantity: number;

  usageAt: Date;



  evidenceFilePath?: string | null;

  remark?: string | null;

}



/**

 * สร้าง ResourceUsage จริง

 *

 * Organization IDs จะหาใหม่จาก Machine/Checkpoint

 * ฝั่ง Server เพื่อไม่เชื่อถือ ID ที่ส่งมาจาก Browser

 */

export async function createResourceUsage(

  input: CreateResourceUsageInput,

) {

  if (!input.machineId && !input.checkpointId) {

    throw new Error(

      "กรุณาระบุเครื่องจักรหรือจุดตรวจ",

    );

  }



  if (input.machineId && input.checkpointId) {

    throw new Error(

      "ไม่สามารถเลือกเครื่องจักรและจุดตรวจพร้อมกันได้",

    );

  }



  if (

    !Number.isFinite(input.quantity) ||

    input.quantity <= 0

  ) {

    throw new Error(

      "ปริมาณการใช้ทรัพยากรต้องมากกว่า 0",

    );

  }



  const resourceType =

    await prisma.resourceTypeMaster.findFirst({

      where: {

        resourceTypeId: input.resourceTypeId,

        status: "ACTIVE",



        defaultUnit: {

          status: "ACTIVE",

        },

      },



      select: {

        resourceTypeId: true,



        defaultUnit: {

          select: {

            unitId: true,

          },

        },

      },

    });



  if (!resourceType) {

    throw new Error(

      "ไม่พบประเภททรัพยากรที่เลือก",

    );

  }



  /*

   * ไม่เชื่อ unitId จาก Client อย่างเดียว

   * Resource Type ต้องสัมพันธ์กับ Unit จริง

   */

  if (

    resourceType.defaultUnit.unitId !== input.unitId

  ) {

    throw new Error(

      "หน่วยวัดไม่ตรงกับประเภททรัพยากร",

    );

  }



  let factoryId: number;

  let buildingId: number;

  let departmentId: number;

  let lineId: number;



  let machineId: number | null = null;

  let checkpointId: number | null = null;



  if (input.machineId) {

    const machine = await prisma.machine.findFirst({

      where: {

        machineId: input.machineId,

        status: "ACTIVE",



        productionLine: {

          department: {

            building: {

              factory: {

                companyId: input.companyId,

              },

            },

          },

        },

      },



      select: {

        machineId: true,



        productionLine: {

          select: {

            lineId: true,



            department: {

              select: {

                departmentId: true,



                building: {

                  select: {

                    buildingId: true,



                    factory: {

                      select: {

                        factoryId: true,

                      },

                    },

                  },

                },

              },

            },

          },

        },

      },

    });



    if (!machine) {

      throw new Error(

        "ไม่พบเครื่องจักรนี้ในบริษัทของคุณ",

      );

    }



    machineId = machine.machineId;



    lineId = machine.productionLine.lineId;



    departmentId =

      machine.productionLine.department.departmentId;



    buildingId =

      machine.productionLine.department.building.buildingId;



    factoryId =

      machine.productionLine.department.building.factory.factoryId;

  } else {

    const checkpoint =

      await prisma.checkpoint.findFirst({

        where: {

          checkpointId: input.checkpointId!,

          status: "ACTIVE",



          productionLine: {

            department: {

              building: {

                factory: {

                  companyId: input.companyId,

                },

              },

            },

          },

        },



        select: {

          checkpointId: true,



          productionLine: {

            select: {

              lineId: true,



              department: {

                select: {

                  departmentId: true,



                  building: {

                    select: {

                      buildingId: true,



                      factory: {

                        select: {

                          factoryId: true,

                        },

                      },

                    },

                  },

                },

              },

            },

          },

        },

      });



    if (!checkpoint) {

      throw new Error(

        "ไม่พบจุดตรวจนี้ในบริษัทของคุณ",

      );

    }



    checkpointId = checkpoint.checkpointId;



    lineId = checkpoint.productionLine.lineId;



    departmentId =

      checkpoint.productionLine.department.departmentId;



    buildingId =

      checkpoint.productionLine.department.building.buildingId;



    factoryId =

      checkpoint.productionLine.department.building.factory.factoryId;

  }



  /*

   * ถ้ามาจาก QR ต้องตรวจ scanId ด้วย

   */

  if (input.qrScanId) {

    const scan = await prisma.qRScanLog.findFirst({

      where: {

        scanId: input.qrScanId,

        userId: input.recordedBy,



        qrCode: {

          ...(machineId

            ? {

                machineId,

              }

            : {

                checkpointId,

              }),

        },

      },



      select: {

        scanId: true,

      },

    });



    if (!scan) {

      throw new Error(

        "ข้อมูลการสแกน QR Code ไม่ถูกต้อง",

      );

    }

  }



  const usageReference =

    `USG-${Date.now()}-${randomUUID()

      .replaceAll("-", "")

      .slice(0, 10)

      .toUpperCase()}`;



  const createdUsage = await prisma.resourceUsage.create({

    data: {

      usageReference,



      companyId: input.companyId,



      factoryId,

      buildingId,

      departmentId,

      lineId,



      machineId,

      checkpointId,



      resourceTypeId: input.resourceTypeId,

      unitId: input.unitId,



      qrScanId: input.qrScanId ?? null,



      scopeType: machineId

        ? "MACHINE"

        : "CHECKPOINT",



      quantity: input.quantity,



      usageAt: input.usageAt,



      sourceType: input.qrScanId

        ? "QR"

        : "MANUAL",



      evidenceFilePath:

        input.evidenceFilePath?.trim() || null,



      remark:

        input.remark?.trim() || null,



      recordedBy: input.recordedBy,



      processingStatus: "PENDING",



      status: "ACTIVE",

    },

  });



  /*
   * Processing pipeline หลังบันทึก ResourceUsage สำเร็จ
   *
   * Carbon และ Anomaly ทำงานแยกกัน:
   * - Carbon ใช้ EmissionFactor/CarbonResult จาก DB จริง
   * - Anomaly ใช้ engine เดิม
   * - valid carbon skip ไม่ถือเป็น processing failure
   */
  let processingFailed = false;

  try {
    const carbonResult = await processResourceUsageCarbon(
      createdUsage.usageId,
    );

    if (
      carbonResult.skipped &&
      carbonResult.reason === "NO_ACTIVE_EMISSION_FACTOR"
    ) {
      console.warn(
        `Carbon skipped for ResourceUsage ${createdUsage.usageId.toString()}: no active emission factor`,
      );
    }
  } catch (error) {
    processingFailed = true;
    console.error(
      "Resource carbon processing failed:",
      error,
    );
  }

  try {
    await analyzeResourceUsage(createdUsage.usageId);
  } catch (error) {
    processingFailed = true;
    console.error(
      "Resource anomaly analysis failed:",
      error,
    );
  }

  try {
    await prisma.resourceUsage.update({
      where: {
        usageId: createdUsage.usageId,
      },
      data: {
        processingStatus: processingFailed
          ? "FAILED"
          : "COMPLETED",
      },
    });
  } catch (error) {
    /*
     * ResourceUsage ถูกบันทึกสำเร็จแล้ว จึงไม่ throw กลับไปทำให้ Operator
     * เข้าใจว่าการบันทึกล้มเหลว แต่ log ไว้เพื่อให้ตรวจสอบ/repair ได้
     */
    console.error(
      "ResourceUsage processing status update failed:",
      error,
    );
  }

  return createdUsage;

}

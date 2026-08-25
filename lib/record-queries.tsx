import "server-only";

import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";

/**
 * ชื่อ interface ยังใช้ EquipmentListItem ชั่วคราว
 * เพื่อให้หน้า Operator เดิมไม่ import พัง
 *
 * แต่ข้อมูลทั้งหมดภายในมาจาก Machine แล้ว
 */
export interface EquipmentListItem {
  /**
   * Legacy alias
   * equipmentId = machineId
   */
  equipmentId: number;

  machineId: number;

  name: string;
  equipmentCode: string;
  equipmentType: string | null;

  productionLine: string | null;
  department: string | null;
  location: string;

  status: string;

  /**
   * Machine ใหม่ไม่ได้ผูก Resource Type แบบตายตัว
   * Operator จะเลือก Resource Type จาก Master Data ตอนบันทึก
   */
  resourceType: string;
  resourceUnit: string;

  factoryId: number;
  factoryName: string;

  buildingId: number;
  buildingName: string;

  departmentId: number;
  departmentName: string;

  lineId: number;
  lineName: string;
}

/**
 * Resource Type จาก Master Data
 *
 * ใช้สำหรับ dropdown ในหน้า Record
 * เมื่อเลือก Resource Type แล้วระบบจะรู้ Unit อัตโนมัติ
 */
export interface ResourceTypeOption {
  resourceTypeId: number;
  resourceCode: string;
  resourceName: string;

  categoryId: number;
  categoryName: string;

  defaultUnitId: number;
  unitCode: string;
  unitName: string;
  unitSymbol: string;

  carbonCalculable: boolean;
}

/**
 * ดึง Machine จริงทั้งหมดของบริษัท
 *
 * Scope:
 * Company
 *   → Factory
 *     → Building
 *       → Department
 *         → Production Line
 *           → Machine
 */
export async function getEquipmentList(
  companyId: number | null,
  search?: string,
): Promise<EquipmentListItem[]> {
  if (companyId === null) {
    return [];
  }

  const normalizedSearch = search?.trim();

  const machines = await prisma.machine.findMany({
    where: {
      status: "ACTIVE",

      productionLine: {
        department: {
          building: {
            factory: {
              companyId,
              status: "ACTIVE",
            },
          },
        },
      },

      ...(normalizedSearch
        ? {
            OR: [
              {
                machineName: {
                  contains: normalizedSearch,
                },
              },
              {
                machineCode: {
                  contains: normalizedSearch,
                },
              },
              {
                machineType: {
                  machineTypeName: {
                    contains: normalizedSearch,
                  },
                },
              },
            ],
          }
        : {}),
    },

    include: {
      machineType: true,

      productionLine: {
        include: {
          department: {
            include: {
              building: {
                include: {
                  factory: true,
                },
              },
            },
          },
        },
      },
    },

    orderBy: [
      {
        productionLine: {
          department: {
            building: {
              factory: {
                factoryName: "asc",
              },
            },
          },
        },
      },
      {
        machineName: "asc",
      },
    ],
  });

  return machines.map((machine) => {
    const line = machine.productionLine;
    const department = line.department;
    const building = department.building;
    const factory = building.factory;

    const location =
      machine.locationNote?.trim() ||
      `${building.buildingName} • ${line.lineName}`;

    return {
      /**
       * ชั่วคราวให้ UI เดิมใช้ equipmentId ต่อได้
       * แต่ค่าจริงคือ machineId
       */
      equipmentId: machine.machineId,

      machineId: machine.machineId,

      name: machine.machineName,
      equipmentCode: machine.machineCode,
      equipmentType:
        machine.machineType.machineTypeName ?? null,

      productionLine: line.lineName,
      department: department.departmentName,
      location,

      status: machine.operationalStatus,

      /**
       * Machine ใหม่ไม่ได้ล็อกว่าต้องใช้ Resource อะไร
       */
      resourceType: "",
      resourceUnit: "",

      factoryId: factory.factoryId,
      factoryName: factory.factoryName,

      buildingId: building.buildingId,
      buildingName: building.buildingName,

      departmentId: department.departmentId,
      departmentName: department.departmentName,

      lineId: line.lineId,
      lineName: line.lineName,
    };
  });
}

/**
 * ดึง Resource Type จาก Master Data
 *
 * เช่น
 * Electricity → kWh
 * Water       → m³
 * Natural Gas → m³
 * Compressed Air → m³
 */
export async function getResourceTypeOptions(): Promise<
  ResourceTypeOption[]
> {
  const resourceTypes =
    await prisma.resourceTypeMaster.findMany({
      where: {
        status: "ACTIVE",
      },

      include: {
        category: true,
        defaultUnit: true,
      },

      orderBy: [
        {
          category: {
            categoryName: "asc",
          },
        },
        {
          resourceName: "asc",
        },
      ],
    });

  return resourceTypes.map((resource) => ({
    resourceTypeId: resource.resourceTypeId,
    resourceCode: resource.resourceCode,
    resourceName: resource.resourceName,

    categoryId: resource.categoryId,
    categoryName: resource.category.categoryName,

    defaultUnitId: resource.defaultUnitId,
    unitCode: resource.defaultUnit.unitCode,
    unitName: resource.defaultUnit.unitName,
    unitSymbol: resource.defaultUnit.symbol,

    carbonCalculable: resource.carbonCalculable,
  }));
}

/**
 * ยอด Resource Usage วันนี้
 */
export interface TodayUsageTotal {
  key: string;
  label: string;
  unit: string;
  total: number;
  recordCount: number;

  resourceTypeId: number;
}

/**
 * ดึงยอดที่ Operator / บริษัทบันทึกวันนี้
 *
 * ใช้ ResourceUsage ใหม่แล้ว
 * ไม่อ่าน ResourceRecord legacy อีก
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
          unitId: true,
          symbol: true,
        },
      },
    },
  });

  const totals = new Map<
    string,
    {
      resourceTypeId: number;
      resourceCode: string;
      resourceName: string;
      unit: string;
      total: number;
      count: number;
    }
  >();

  for (const usage of usages) {
    const resource = usage.resourceType;

    /**
     * ปกติ Resource Type หนึ่งจะใช้ Default Unit เดียวกัน
     * แต่ใส่ unit ใน key ด้วยเพื่อป้องกันข้อมูลต่างหน่วยถ้ามีในอนาคต
     */
    const mapKey = `${resource.resourceTypeId}:${usage.unit.unitId}`;

    const current = totals.get(mapKey);

    const quantity = Number(usage.quantity);

    if (current) {
      current.total += quantity;
      current.count += 1;

      continue;
    }

    totals.set(mapKey, {
      resourceTypeId: resource.resourceTypeId,
      resourceCode: resource.resourceCode,
      resourceName: resource.resourceName,
      unit: usage.unit.symbol,
      total: quantity,
      count: 1,
    });
  }

  return Array.from(totals.values())
    .map((item) => ({
      key: item.resourceCode.toLowerCase(),
      label: item.resourceName,
      unit: item.unit,

      total:
        Math.round((item.total + Number.EPSILON) * 100) /
        100,

      recordCount: item.count,
      resourceTypeId: item.resourceTypeId,
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, "th"),
    );
}

/**
 * Input สำหรับ ResourceUsage ใหม่
 */
export interface CreateRecordInput {
  machineId: number;

  resourceTypeId: number;

  recordedById: number;
  companyId: number;

  quantity: number;
  usageAt: Date;

  qrScanId?: bigint | null;

  remark?: string;
  evidenceFilePath?: string | null;

  sourceType?: "MANUAL" | "QR_MANUAL";
}

/**
 * สร้าง ResourceUsage จริง
 *
 * Operator ส่งมาเพียง:
 *
 * machineId
 * resourceTypeId
 * quantity
 * usageAt
 * qrScanId (ถ้ามาจาก QR)
 * remark
 * evidenceFilePath
 *
 * ส่วน
 *
 * factoryId
 * buildingId
 * departmentId
 * lineId
 * unitId
 *
 * ระบบหาให้เองจาก Database
 */
export async function createResourceRecord(
  input: CreateRecordInput,
) {
  if (!Number.isInteger(input.machineId)) {
    throw new Error("รหัสเครื่องจักรไม่ถูกต้อง");
  }

  if (!Number.isInteger(input.resourceTypeId)) {
    throw new Error("ประเภททรัพยากรไม่ถูกต้อง");
  }

  if (
    !Number.isFinite(input.quantity) ||
    input.quantity < 0
  ) {
    throw new Error("ปริมาณการใช้ไม่ถูกต้อง");
  }

  if (Number.isNaN(input.usageAt.getTime())) {
    throw new Error("วันที่และเวลาไม่ถูกต้อง");
  }

  /**
   * ตรวจ Machine พร้อมหา Organization Scope ทั้งหมด
   */
  const machine = await prisma.machine.findFirst({
    where: {
      machineId: input.machineId,
      status: "ACTIVE",

      productionLine: {
        department: {
          building: {
            factory: {
              companyId: input.companyId,
              status: "ACTIVE",
            },
          },
        },
      },
    },

    include: {
      productionLine: {
        include: {
          department: {
            include: {
              building: {
                include: {
                  factory: true,
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

  const line = machine.productionLine;
  const department = line.department;
  const building = department.building;
  const factory = building.factory;

  /**
   * ตรวจ Resource Type จาก Master Data
   *
   * Unit ของการบันทึกจะใช้ defaultUnit ของ Resource Type
   */
  const resourceType =
    await prisma.resourceTypeMaster.findFirst({
      where: {
        resourceTypeId: input.resourceTypeId,
        status: "ACTIVE",
      },

      include: {
        defaultUnit: true,
      },
    });

  if (!resourceType) {
    throw new Error(
      "ไม่พบประเภททรัพยากรที่เลือก",
    );
  }

  /**
   * ตรวจ Operator
   *
   * ป้องกัน user จากบริษัทอื่นส่ง request ปลอมเข้ามา
   */
  const recorder = await prisma.user.findFirst({
    where: {
      userId: input.recordedById,
      companyId: input.companyId,
      status: "ACTIVE",
    },

    select: {
      userId: true,
    },
  });

  if (!recorder) {
    throw new Error(
      "ไม่พบผู้บันทึกข้อมูลในบริษัทนี้",
    );
  }

  /**
   * QR Scan เป็น optional
   *
   * ถ้ามี qrScanId ต้องเป็น QR ของ Machine นี้
   * และเป็นการสแกนของ User คนนี้
   */
  if (input.qrScanId !== null && input.qrScanId !== undefined) {
    const scan = await prisma.qRScanLog.findFirst({
      where: {
        scanId: input.qrScanId,
        userId: input.recordedById,

        qrCode: {
          machineId: machine.machineId,
        },
      },

      select: {
        scanId: true,
      },
    });

    if (!scan) {
      throw new Error(
        "ข้อมูล QR Scan ไม่ตรงกับเครื่องจักรที่เลือก",
      );
    }
  }

  /**
   * Reference ที่ไม่ซ้ำ
   *
   * ตัวอย่าง:
   * RU-c502f2d6-...
   */
  const usageReference = `RU-${randomUUID()}`;

  const sourceType =
    input.qrScanId !== null &&
    input.qrScanId !== undefined
      ? "QR_MANUAL"
      : input.sourceType ?? "MANUAL";

  /**
   * สร้าง ResourceUsage ใหม่
   */
  return prisma.resourceUsage.create({
    data: {
      usageReference,

      companyId: input.companyId,

      factoryId: factory.factoryId,
      buildingId: building.buildingId,
      departmentId: department.departmentId,
      lineId: line.lineId,

      machineId: machine.machineId,
      checkpointId: null,

      resourceTypeId:
        resourceType.resourceTypeId,

      unitId:
        resourceType.defaultUnitId,

      sensorDataId: null,

      qrScanId:
        input.qrScanId ?? null,

      scopeType: "MACHINE",

      quantity: input.quantity,
      usageAt: input.usageAt,

      sourceType,

      evidenceFilePath:
        input.evidenceFilePath?.trim() || null,

      remark:
        input.remark?.trim() || null,

      recordedBy:
        input.recordedById,

      processingStatus: "PENDING",
      status: "ACTIVE",
    },

    include: {
      machine: {
        select: {
          machineId: true,
          machineCode: true,
          machineName: true,
        },
      },

      resourceType: {
        select: {
          resourceTypeId: true,
          resourceCode: true,
          resourceName: true,
        },
      },

      unit: {
        select: {
          unitId: true,
          unitCode: true,
          unitName: true,
          symbol: true,
        },
      },
    },
  });
}

/**
 * ชื่อใหม่สำหรับ code ที่เราจะค่อย ๆ migrate
 *
 * ตอนนี้ createResourceRecord ยังเก็บไว้
 * เพื่อไม่ให้ import เก่าพังทันที
 */
export const createResourceUsage =
  createResourceRecord;
import "server-only";

import { prisma } from "@/lib/prisma";

export interface HistoryRecordItem {
  recordId: string;
  usageReference: string;
  recordedAt: string;
  targetType: "MACHINE" | "CHECKPOINT";
  equipmentId: number | null;
  equipmentName: string;
  equipmentCode: string | null;
  equipmentType: string | null;
  productionLine: string | null;
  department: string | null;
  resourceType: string;
  resourceLabel: string;
  unit: string;
  value: number;
  recordedById: number;
  recordedByName: string;
  status: "RECORDED" | "PENDING";
  processingStatus: string;
  note: string | null;
  attachmentUrl: string | null;
  qrScanId: string | null;
}

export interface HistoryFilterOptions {
  resourceTypes: { code: string; label: string }[];
  productionLines: string[];
  departments: string[];
  equipmentTypes: string[];
  units: string[];
  recorders: { id: number; name: string }[];
}

export async function getAllHistoryRecords(
  companyId: number | null,
): Promise<HistoryRecordItem[]> {
  if (companyId === null) return [];

  const records = await prisma.resourceUsage.findMany({
    where: { companyId, status: "ACTIVE" },
    orderBy: { usageAt: "desc" },
    select: {
      usageId: true,
      usageReference: true,
      usageAt: true,
      quantity: true,
      processingStatus: true,
      status: true,
      remark: true,
      evidenceFilePath: true,
      qrScanId: true,
      resourceType: {
        select: {
          resourceCode: true,
          resourceName: true,
        },
      },
      unit: {
        select: {
          symbol: true,
        },
      },
      recorder: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
        },
      },
      machine: {
        select: {
          machineId: true,
          machineCode: true,
          machineName: true,
          machineType: {
            select: {
              machineTypeName: true,
            },
          },
          productionLine: {
            select: {
              lineName: true,
              department: {
                select: {
                  departmentName: true,
                },
              },
            },
          },
        },
      },
      checkpoint: {
        select: {
          checkpointId: true,
          checkpointCode: true,
          checkpointName: true,
          checkpointType: true,
          productionLine: {
            select: {
              lineName: true,
              department: {
                select: {
                  departmentName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return records.map((record) => {
    const isMachine = Boolean(record.machine);

    return {
      recordId: record.usageId.toString(),
      usageReference: record.usageReference,
      recordedAt: record.usageAt.toISOString(),
      targetType: isMachine ? "MACHINE" : "CHECKPOINT",
      equipmentId:
        record.machine?.machineId ??
        record.checkpoint?.checkpointId ??
        null,
      equipmentName:
        record.machine?.machineName ??
        record.checkpoint?.checkpointName ??
        "ไม่ระบุ",
      equipmentCode:
        record.machine?.machineCode ??
        record.checkpoint?.checkpointCode ??
        null,
      equipmentType:
        record.machine?.machineType.machineTypeName ??
        record.checkpoint?.checkpointType ??
        (record.checkpoint ? "Checkpoint" : null),
      productionLine:
        record.machine?.productionLine.lineName ??
        record.checkpoint?.productionLine.lineName ??
        null,
      department:
        record.machine?.productionLine.department.departmentName ??
        record.checkpoint?.productionLine.department.departmentName ??
        null,
      resourceType: record.resourceType.resourceCode,
      resourceLabel: record.resourceType.resourceName,
      unit: record.unit.symbol,
      value: Number(record.quantity),
      recordedById: record.recorder.userId,
      recordedByName:
        `${record.recorder.firstName} ${record.recorder.lastName}`.trim(),
      status: record.status === "ACTIVE" ? "RECORDED" : "PENDING",
      processingStatus: record.processingStatus,
      note: record.remark,
      attachmentUrl: record.evidenceFilePath,
      qrScanId: record.qrScanId?.toString() ?? null,
    };
  });
}

export async function getHistoryFilterOptions(
  companyId: number | null,
): Promise<HistoryFilterOptions> {
  if (companyId === null) {
    return {
      resourceTypes: [],
      productionLines: [],
      departments: [],
      equipmentTypes: [],
      units: [],
      recorders: [],
    };
  }

  const records = await prisma.resourceUsage.findMany({
    where: { companyId, status: "ACTIVE" },
    select: {
      resourceType: {
        select: {
          resourceCode: true,
          resourceName: true,
        },
      },
      unit: {
        select: {
          symbol: true,
        },
      },
      recorder: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
        },
      },
      machine: {
        select: {
          machineType: {
            select: {
              machineTypeName: true,
            },
          },
          productionLine: {
            select: {
              lineName: true,
              department: {
                select: {
                  departmentName: true,
                },
              },
            },
          },
        },
      },
      checkpoint: {
        select: {
          checkpointType: true,
          productionLine: {
            select: {
              lineName: true,
              department: {
                select: {
                  departmentName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const resourceTypeMap = new Map<string, string>();
  const productionLineSet = new Set<string>();
  const departmentSet = new Set<string>();
  const equipmentTypeSet = new Set<string>();
  const unitSet = new Set<string>();
  const recorderMap = new Map<number, string>();

  for (const record of records) {
    resourceTypeMap.set(
      record.resourceType.resourceCode,
      record.resourceType.resourceName,
    );

    if (record.unit.symbol) unitSet.add(record.unit.symbol);

    const line =
      record.machine?.productionLine.lineName ??
      record.checkpoint?.productionLine.lineName;
    if (line) productionLineSet.add(line);

    const department =
      record.machine?.productionLine.department.departmentName ??
      record.checkpoint?.productionLine.department.departmentName;
    if (department) departmentSet.add(department);

    const equipmentType =
      record.machine?.machineType.machineTypeName ??
      record.checkpoint?.checkpointType ??
      (record.checkpoint ? "Checkpoint" : null);
    if (equipmentType) equipmentTypeSet.add(equipmentType);

    recorderMap.set(
      record.recorder.userId,
      `${record.recorder.firstName} ${record.recorder.lastName}`.trim(),
    );
  }

  return {
    resourceTypes: Array.from(resourceTypeMap.entries()).map(
      ([code, label]) => ({ code, label }),
    ),
    productionLines: Array.from(productionLineSet),
    departments: Array.from(departmentSet),
    equipmentTypes: Array.from(equipmentTypeSet),
    units: Array.from(unitSet),
    recorders: Array.from(recorderMap.entries()).map(([id, name]) => ({
      id,
      name,
    })),
  };
}
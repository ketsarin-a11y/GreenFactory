import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  RecentRecord,
  ResourceIcon,
  TaskCategory,
  TodayTaskSummary,
} from "@/constants/dashboard";

const RESOURCE_ICON_BY_CODE: Record<string, ResourceIcon> = {
  ELECTRICITY: "zap",
  WATER: "droplet",
  DI_WATER: "droplets",
  CHILLED_WATER: "snowflake",
  COMPRESSED_AIR: "wind",
  NITROGEN: "atom",
  GAS: "flame",
  LPG: "flame",
  STEAM: "waves",
  DIESEL: "fuel",
};

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Dashboard ใหม่:
 * - ใช้ ResourceUsage เป็น source of truth
 * - ไม่อ่าน ResourceRecord / Equipment legacy
 * - card นี้สรุป "รายการที่บันทึกวันนี้" ตาม Resource Type จริง
 */
export async function getTodayTaskSummary(
  companyId: number | null,
): Promise<TodayTaskSummary> {
  if (companyId === null) {
    return {
      totalCount: 0,
      categories: [],
    };
  }

  const usages = await prisma.resourceUsage.findMany({
    where: {
      companyId,
      status: "ACTIVE",
      usageAt: {
        gte: startOfToday(),
        lte: endOfToday(),
      },
    },
    select: {
      resourceType: {
        select: {
          resourceCode: true,
          resourceName: true,
        },
      },
    },
  });

  const counts = new Map<
    string,
    {
      label: string;
      count: number;
      icon: ResourceIcon;
    }
  >();

  for (const usage of usages) {
    const code = usage.resourceType.resourceCode;

    const current = counts.get(code) ?? {
      label: usage.resourceType.resourceName,
      count: 0,
      icon:
        RESOURCE_ICON_BY_CODE[code] ??
        "zap",
    };

    current.count += 1;
    counts.set(code, current);
  }

  const categories: TaskCategory[] =
    Array.from(counts.entries())
      .map(([code, item]) => ({
        key: code.toLowerCase(),
        label: item.label,
        icon: item.icon,
        count: item.count,
      }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.label.localeCompare(
            b.label,
            "th",
          ),
      );

  return {
    totalCount: usages.length,
    categories,
  };
}

export async function getRecentRecords(
  userId: number,
  limit = 5,
): Promise<RecentRecord[]> {
  const records =
    await prisma.resourceUsage.findMany({
      where: {
        recordedBy: userId,
        status: "ACTIVE",
      },
      orderBy: {
        usageAt: "desc",
      },
      take: limit,
      select: {
        usageId: true,
        usageAt: true,
        processingStatus: true,

        resourceType: {
          select: {
            resourceCode: true,
          },
        },

        machine: {
          select: {
            machineName: true,
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
            checkpointName: true,
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
    const resourceCode =
      record.resourceType.resourceCode;

    const icon =
      RESOURCE_ICON_BY_CODE[
        resourceCode
      ] ?? "zap";

    const equipment =
      record.machine?.machineName ??
      record.checkpoint
        ?.checkpointName ??
      "ไม่ระบุ";

    const lineName =
      record.machine?.productionLine
        .lineName ??
      record.checkpoint
        ?.productionLine.lineName ??
      null;

    const departmentName =
      record.machine?.productionLine
        .department.departmentName ??
      record.checkpoint
        ?.productionLine.department
        .departmentName ??
      null;

    const location = [
      lineName,
      departmentName,
    ]
      .filter(Boolean)
      .join(" • ");

    return {
      id: record.usageId.toString(),
      equipment,
      location:
        location || "ไม่ระบุตำแหน่ง",
      icon,
      iconColor: iconColorFor(icon),
      dateLabel: formatThaiDateTime(
        record.usageAt,
      ),
      status:
        record.processingStatus ===
        "PENDING"
          ? "กำลังประมวลผล"
          : "บันทึกแล้ว",
    };
  });
}

function iconColorFor(
  icon: ResourceIcon,
): RecentRecord["iconColor"] {
  switch (icon) {
    case "zap":
      return "amber";

    case "droplet":
    case "droplets":
    case "snowflake":
      return "blue";

    case "flame":
    case "waves":
    case "fuel":
      return "purple";

    default:
      return "slate";
  }
}

function formatThaiDateTime(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "th-TH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(date);
}
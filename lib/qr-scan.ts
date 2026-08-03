import "server-only";

import { prisma } from "@/lib/prisma";

export async function findActiveQRByToken(token: string) {
  return prisma.qRCode.findFirst({
    where: {
      qrToken: token,
      qrStatus: "ACTIVE",
    },
    include: {
      machine: {
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
      },
      checkpoint: {
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
      },
    },
  });
}

export async function createQRScanLog(input: {
  qrId: bigint;
  userId: number;
  scanResult: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  return prisma.qRScanLog.create({
    data: {
      qrId: input.qrId,
      userId: input.userId,
      scanResult: input.scanResult,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}
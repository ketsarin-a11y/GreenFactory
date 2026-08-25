import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | string;

type WriteAuditLogInput = {
  request?: Request;
  tableName: string;
  recordId: number | bigint;
  action: AuditAction;
  oldData?: unknown;
  newData?: unknown;
};

function toJsonSafe(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value, (_key, currentValue) => {
      if (typeof currentValue === "bigint") {
        return currentValue.toString();
      }

      if (currentValue instanceof Date) {
        return currentValue.toISOString();
      }

      return currentValue;
    }),
  );
}

function getIpAddress(request?: Request) {
  if (!request) {
    return null;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    null
  );
}

export async function writeAuditLog({
  request,
  tableName,
  recordId,
  action,
  oldData,
  newData,
}: WriteAuditLogInput) {
  try {
    const session = await getSession();

    await prisma.auditLog.create({
      data: {
        userId: session?.userId ?? null,
        tableName,
        recordId: BigInt(recordId),
        action: action.toUpperCase(),
        oldData: toJsonSafe(oldData),
        newData: toJsonSafe(newData),
        ipAddress: getIpAddress(request),
        userAgent: request?.headers.get("user-agent") ?? null,
      },
    });

    return true;
  } catch (error) {
    // Audit Log ไม่ควรทำให้ CRUD หลักล้มเหลว
    console.error("writeAuditLog failed:", error);
    return false;
  }
}
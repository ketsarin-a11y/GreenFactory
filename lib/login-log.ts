import { prisma } from "@/lib/prisma";

type LoginStatus = "SUCCESS" | "FAILED";

type CreateLoginLogInput = {
  request: Request;
  userId?: number | null;
  attemptedEmail?: string | null;
  loginStatus: LoginStatus;
  failureReason?: string | null;
  loginMethod?: string | null;
};

function getIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    null
  );
}

function detectDevice(userAgent: string | null) {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();

  if (ua.includes("ipad") || ua.includes("tablet")) return "Tablet";
  if (
    ua.includes("iphone") ||
    ua.includes("android") ||
    ua.includes("mobile")
  ) {
    return "Mobile";
  }

  return "Desktop";
}

export async function createLoginLog({
  request,
  userId = null,
  attemptedEmail = null,
  loginStatus,
  failureReason = null,
  loginMethod = "PASSWORD",
}: CreateLoginLogInput) {
  try {
    const userAgent = request.headers.get("user-agent");

    const log = await prisma.loginLog.create({
      data: {
        userId,
        attemptedEmail,
        ipAddress: getIpAddress(request),
        userAgent,
        device: detectDevice(userAgent),
        loginMethod,
        loginStatus,
        failureReason,
      },
      select: { loginLogId: true },
    });

    return log.loginLogId;
  } catch (error) {
    console.error("createLoginLog failed:", error);
    return null;
  }
}

export async function markLatestSuccessfulLoginAsLoggedOut(userId: number) {
  try {
    const latest = await prisma.loginLog.findFirst({
      where: {
        userId,
        loginStatus: "SUCCESS",
        logoutAt: null,
      },
      orderBy: { loginAt: "desc" },
      select: { loginLogId: true },
    });

    if (!latest) return false;

    await prisma.loginLog.update({
      where: { loginLogId: latest.loginLogId },
      data: { logoutAt: new Date() },
    });

    return true;
  } catch (error) {
    console.error("markLatestSuccessfulLoginAsLoggedOut failed:", error);
    return false;
  }
}
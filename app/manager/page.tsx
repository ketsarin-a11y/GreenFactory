import { redirect } from "next/navigation";
import ManagerHomePage from "@/components/manager/Managerhomepage";
import {
  getCarbonFootprint,
  getManagerResourceDashboard,
} from "@/lib/manager queries";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type ManagerPageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00+07:00`);
  return !Number.isNaN(date.getTime());
}

function startOfBangkokDate(value: string) {
  return new Date(`${value}T00:00:00+07:00`);
}

function endOfBangkokDate(value: string) {
  return new Date(`${value}T23:59:59.999+07:00`);
}

function toBangkokDateOnly(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

function getSevenDayRange(anchor: Date) {
  const anchorDate = toBangkokDateOnly(anchor);
  const endDate = endOfBangkokDate(anchorDate);
  const startDate = startOfBangkokDate(anchorDate);
  startDate.setDate(startDate.getDate() - 6);
  return { startDate, endDate };
}

export default async function ManagerPage({
  searchParams,
}: ManagerPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "MANAGER") {
    redirect("/");
  }

  if (!session.companyId) {
    throw new Error("Manager account does not have a companyId");
  }

  const params = await searchParams;
  const from = isValidDateOnly(params.from) ? params.from : null;
  const to = isValidDateOnly(params.to) ? params.to : null;

  let startDate: Date;
  let endDate: Date;
  let isUsingLatestAvailable = false;

  if (from !== null && to !== null && from <= to) {
    startDate = startOfBangkokDate(from);
    endDate = endOfBangkokDate(to);
  } else {
    const latestUsage = await prisma.resourceUsage.findFirst({
      where: {
        companyId: session.companyId,
        status: "ACTIVE",
      },
      orderBy: {
        usageAt: "desc",
      },
      select: {
        usageAt: true,
      },
    });

    const anchorDate = latestUsage?.usageAt ?? new Date();
    const defaultRange = getSevenDayRange(anchorDate);

    startDate = defaultRange.startDate;
    endDate = defaultRange.endDate;
    isUsingLatestAvailable = latestUsage !== null;
  }

  const [resourceDashboard, carbon] = await Promise.all([
    getManagerResourceDashboard(
      session.companyId,
      startDate,
      endDate,
    ),
    getCarbonFootprint(
      session.companyId,
      startDate,
      endDate,
    ),
  ]);

  const latestDataAt = resourceDashboard.lastUpdatedAt ?? null;

  const dataAgeDays = latestDataAt
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(latestDataAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const analysisContext = {
    latestDataAt,
    rangeStart: toBangkokDateOnly(startDate),
    rangeEnd: toBangkokDateOnly(endDate),
    dataAgeDays,
    isUsingLatestAvailable,
  };

  return (
    <ManagerHomePage
      resourceDashboard={resourceDashboard}
      carbon={carbon}
      currentUserName=""
      analysisContext={analysisContext}
    />
  );
}
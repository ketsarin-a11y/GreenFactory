import { NextRequest, NextResponse } from "next/server";

import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "เธเธฃเธธเธ“เธฒเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ",
      },
      { status: 401 },
    );
  }

  if (session.roleName !== "OPERATOR") {
    return NextResponse.json(
      {
        success: false,
        message: "เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเนเธเนเธเธฒเธเธชเนเธงเธเธเธตเน",
      },
      { status: 403 },
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as ChangePasswordBody | null;

  const currentPassword = body?.currentPassword?.trim() ?? "";
  const newPassword = body?.newPassword ?? "";
  const confirmPassword = body?.confirmPassword ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเนเธญเธกเธนเธฅเนเธซเนเธเธฃเธเธ–เนเธงเธ",
      },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "เธฃเธซเธฑเธชเธเนเธฒเธเนเธซเธกเนเนเธฅเธฐเธเธฒเธฃเธขเธทเธเธขเธฑเธเนเธกเนเธ•เธฃเธเธเธฑเธ",
      },
      { status: 400 },
    );
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        message: `เธฃเธซเธฑเธชเธเนเธฒเธเนเธซเธกเนเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข ${MIN_PASSWORD_LENGTH} เธ•เธฑเธงเธญเธฑเธเธฉเธฃ`,
      },
      { status: 400 },
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "เธฃเธซเธฑเธชเธเนเธฒเธเนเธซเธกเนเธ•เนเธญเธเนเธกเนเธเนเธณเธเธฑเธเธฃเธซเธฑเธชเธเนเธฒเธเธเธฑเธเธเธธเธเธฑเธ",
      },
      { status: 400 },
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      userId: true,
      passwordHash: true,
      status: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json(
      {
        success: false,
        message: "เนเธกเนเธเธเธเธนเนเนเธเนเธเธฒเธ",
      },
      { status: 404 },
    );
  }

  if (dbUser.status !== "ACTIVE") {
    return NextResponse.json(
      {
        success: false,
        message: "เธเธฑเธเธเธตเธเธนเนเนเธเนเธเธฒเธเธ–เธนเธเธฃเธฐเธเธฑเธ",
      },
      { status: 403 },
    );
  }

  const currentPasswordIsValid = await verifyPassword(
    currentPassword,
    dbUser.passwordHash,
  );

  if (!currentPasswordIsValid) {
    return NextResponse.json(
      {
        success: false,
        message: "เธฃเธซเธฑเธชเธเนเธฒเธเธเธฑเธเธเธธเธเธฑเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ",
      },
      { status: 401 },
    );
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      userId: session.userId,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return NextResponse.json({
    success: true,
    message: "เน€เธเธฅเธตเนเธขเธเธฃเธซเธฑเธชเธเนเธฒเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง",
  });
}


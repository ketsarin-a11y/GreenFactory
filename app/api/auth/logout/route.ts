import { NextResponse } from "next/server";

import { markLatestSuccessfulLoginAsLoggedOut } from "@/lib/login-log";
import { clearSessionCookie, getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();

  if (session) {
    await markLatestSuccessfulLoginAsLoggedOut(session.userId);
  }

  await clearSessionCookie();

  return NextResponse.json({
    success: true,
  });
}
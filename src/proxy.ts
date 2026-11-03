import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/server/auth/session";

// Optimistic check only (no DB here). Real authorization happens in requireUser().
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/platform/:path*", "/company/:path*", "/manager/:path*", "/operator/:path*", "/scan/:path*"],
};

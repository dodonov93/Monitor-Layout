import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (!sessionCookie && (pathname.startsWith("/gallery") || pathname.startsWith("/admin") || pathname.startsWith("/pending"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/gallery", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gallery/:path*", "/admin/:path*", "/pending/:path*", "/login"],
};
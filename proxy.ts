import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";

const AUTH_ROUTES = ["/forgot-password", "/login", "/register"];

function isDashboardRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSessionCookie =
    Boolean(request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value) ||
    Boolean(request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value);

  if (!hasSessionCookie && isDashboardRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);

    return NextResponse.redirect(redirectUrl);
  }

  if (hasSessionCookie && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/forgot-password",
    "/login",
    "/register",
  ],
};

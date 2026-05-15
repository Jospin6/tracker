import { NextResponse, type NextRequest } from "next/server";

import {
  clearAuthCookies,
  clearWorkspaceCookie,
  readAuthCookies,
  setAuthCookies,
  type WritableCookies,
} from "@/lib/auth/cookies";
import { resolveSessionFromTokens } from "@/lib/auth/session";

const AUTH_ROUTES = ["/auth/forgot-password", "/auth/login", "/auth/register"];

function isDashboardRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isProtectedApiRoute(pathname: string) {
  return pathname === "/api/workspaces" || pathname.startsWith("/api/workspaces/");
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function clearSessionCookies(cookieStore: WritableCookies) {
  clearAuthCookies(cookieStore);
  clearWorkspaceCookie(cookieStore);
}

function createLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/login";
  redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);

  return redirectUrl;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresAuth = isDashboardRoute(pathname) || isProtectedApiRoute(pathname);
  const { accessToken, refreshToken } = readAuthCookies(request.cookies);
  const hasSessionCookie = Boolean(accessToken || refreshToken);

  let activeSession: Awaited<
    ReturnType<typeof resolveSessionFromTokens>
  >["session"] = null;
  let hasAuthenticatedUser = false;

  if (hasSessionCookie) {
    const resolvedSession = await resolveSessionFromTokens({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (resolvedSession.session && resolvedSession.user) {
      activeSession = resolvedSession.session;
      hasAuthenticatedUser = true;
      setAuthCookies(request.cookies as WritableCookies, resolvedSession.session);
    } else {
      clearSessionCookies(request.cookies as WritableCookies);
    }
  }

  if (!hasAuthenticatedUser && requiresAuth) {
    if (isProtectedApiRoute(pathname)) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      clearSessionCookies(response.cookies as WritableCookies);
      return response;
    }

    const response = NextResponse.redirect(createLoginRedirect(request));
    clearSessionCookies(response.cookies as WritableCookies);
    return response;
  }

  if (hasAuthenticatedUser && isAuthRoute(pathname)) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    if (activeSession) {
      setAuthCookies(response.cookies as WritableCookies, activeSession);
    }

    return response;
  }

  const response = NextResponse.next();

  if (activeSession) {
    setAuthCookies(response.cookies as WritableCookies, activeSession);
  } else if (hasSessionCookie) {
    clearSessionCookies(response.cookies as WritableCookies);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/workspaces/:path*",
    "/auth/forgot-password",
    "/auth/login",
    "/auth/register",
  ],
};

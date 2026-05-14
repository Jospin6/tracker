import { NextResponse } from "next/server";

import {
  clearAuthCookies,
  clearWorkspaceCookie,
  setAuthCookies,
  type WritableCookies,
} from "@/lib/auth/cookies";
import { resolveSessionFromTokens } from "@/lib/auth/session";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const accessToken = payload?.accessToken?.toString() ?? "";
  const refreshToken = payload?.refreshToken?.toString() ?? "";

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Missing session payload." },
      { status: 400 }
    );
  }

  const { session, user } = await resolveSessionFromTokens({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (!session || !user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response.cookies as WritableCookies, session);

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response.cookies as WritableCookies);
  clearWorkspaceCookie(response.cookies as WritableCookies);

  return response;
}

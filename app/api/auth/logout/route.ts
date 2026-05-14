import { NextResponse } from "next/server";

import {
  clearAuthCookies,
  clearWorkspaceCookie,
  type WritableCookies,
} from "@/lib/auth/cookies";

function clearSessionCookies(cookieStore: WritableCookies) {
  clearAuthCookies(cookieStore);
  clearWorkspaceCookie(cookieStore);
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response.cookies as WritableCookies);
  return response;
}

export async function DELETE() {
  return POST();
}

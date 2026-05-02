import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  clearAuthCookies,
  clearWorkspaceCookie,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const accessToken = payload?.accessToken?.toString() ?? "";
  const refreshToken = payload?.refreshToken?.toString() ?? "";
  const expiresAt =
    typeof payload?.expiresAt === "number" ? payload.expiresAt : null;

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { error: "Missing session payload." },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, {
    access_token: accessToken,
    expires_at: expiresAt,
    refresh_token: refreshToken,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);
  clearWorkspaceCookie(cookieStore);

  return NextResponse.json({ ok: true });
}

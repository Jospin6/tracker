import { NextResponse } from "next/server";

import {
  clearWorkspaceCookie,
  setAuthCookies,
  type WritableCookies,
} from "@/lib/auth/cookies";
import {
  getSupabaseConnectionErrorMessage,
  isSupabaseConnectionError,
} from "@/lib/supabase/errors";
import { createServerClient } from "@/lib/supabase/server";

function getLoginErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("email not confirmed") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "Email ou mot de passe invalide.";
  }

  if (normalizedMessage.includes("too many requests")) {
    return "Trop de tentatives. Reessaie dans quelques minutes.";
  }

  return "Impossible de se connecter.";
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const email = payload?.email?.toString().trim().toLowerCase() ?? "";
  const password = payload?.password?.toString() ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email et mot de passe obligatoires." },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (isSupabaseConnectionError(error)) {
      return NextResponse.json(
        { error: getSupabaseConnectionErrorMessage() },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: getLoginErrorMessage(error.message) },
      { status: 401 }
    );
  }

  if (!data.session) {
    return NextResponse.json(
      { error: "Impossible de se connecter." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response.cookies as WritableCookies, data.session);
  clearWorkspaceCookie(response.cookies as WritableCookies);

  return response;
}

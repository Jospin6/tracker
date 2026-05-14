import type { Session, User } from "@supabase/supabase-js";

import { createServerClient } from "@/lib/supabase/server";

export type SessionTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
};

type SessionResolution = {
  error: Error | null;
  session: Session | null;
  user: User | null;
};

function withNoSession(): SessionResolution {
  return {
    error: null,
    session: null,
    user: null,
  };
}

export async function resolveSessionFromTokens(
  tokens: SessionTokens
): Promise<SessionResolution> {
  const accessToken = tokens.access_token?.trim() ?? "";
  const refreshToken = tokens.refresh_token?.trim() ?? "";

  if (!refreshToken) {
    return withNoSession();
  }

  const supabase = createServerClient();

  if (accessToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error && data.session && data.user) {
      return {
        error: null,
        session: data.session,
        user: data.user,
      };
    }
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    return {
      error: error ?? null,
      session: null,
      user: null,
    };
  }

  return {
    error: null,
    session: data.session,
    user: data.user,
  };
}

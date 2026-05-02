"use client";

import { useEffect } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

async function syncSession(session: {
  access_token: string;
  expires_at?: number;
  refresh_token: string;
} | null) {
  if (!session) {
    await fetch("/api/auth/session", {
      credentials: "include",
      method: "DELETE",
    });

    return;
  }

  await fetch("/api/auth/session", {
    body: JSON.stringify({
      accessToken: session.access_token,
      expiresAt: session.expires_at,
      refreshToken: session.refresh_token,
    }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

export function AuthSessionSync() {
  useEffect(() => {
    const supabase = createBrowserClient();
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      void syncSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

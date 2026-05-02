import { createBrowserClient } from "@/lib/supabase/client";

export const authService = {
  register: async (data: { email: string; password: string; full_name: string }) => {
    return fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  login: async (email: string, password: string) => {
    const supabase = createBrowserClient();
    return supabase.auth.signInWithPassword({ email, password });
  },
  logout: async () => {
    const supabase = createBrowserClient();
    return supabase.auth.signOut();
  },
  resetPassword: async (email: string) => {
    const supabase = createBrowserClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
  },
};

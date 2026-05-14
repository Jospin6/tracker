import { createBrowserClient } from "@/lib/supabase/client";

export const authService = {
  register: async (data: { email: string; password: string; full_name: string }) => {
    return fetch("/api/auth/register", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  login: async (email: string, password: string) => {
    return fetch("/api/auth/login", {
      body: JSON.stringify({ email, password }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  },
  logout: async () => {
    return fetch("/api/auth/logout", {
      credentials: "include",
      method: "POST",
    });
  },
  resetPassword: async (email: string) => {
    const supabase = createBrowserClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
  },
};

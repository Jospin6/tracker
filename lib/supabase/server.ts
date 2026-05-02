import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return value;
}

function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return value;
}

function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!value) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return value;
}

const authOptions = {
  autoRefreshToken: false,
  detectSessionInUrl: false,
  persistSession: false,
};

export function createServerClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: authOptions,
  });
}

export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: authOptions,
  });
}

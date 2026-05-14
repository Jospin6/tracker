import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const value =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (!value) {
    throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  }

  return value;
}

function getSupabasePublishableKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  if (!value) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return value;
}

function getSupabaseAdminKey() {
  const value =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!value) {
    throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (value === getSupabasePublishableKey()) {
    throw new Error(
      "Invalid Supabase admin key. Expected a secret/service role key, received the publishable/anon key."
    );
  }

  return value;
}

const authOptions = {
  autoRefreshToken: false,
  detectSessionInUrl: false,
  persistSession: false,
};

export function createServerClient() {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: authOptions,
  });
}

export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseAdminKey(), {
    auth: authOptions,
  });
}

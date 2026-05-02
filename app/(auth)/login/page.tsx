"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const supabase = createBrowserClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.session) {
      setError(signInError?.message ?? "Impossible de se connecter.");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/auth/session", {
      body: JSON.stringify({
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at,
        refreshToken: data.session.refresh_token,
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      setError("La session serveur n'a pas pu etre synchronisee.");
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectedFrom);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Connexion
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Bienvenue dans NuruTrack
        </h1>
        <p className="max-w-xl text-slate-400">
          Accede a ton cockpit, a ton workspace personnel et a toutes tes
          donnees metier.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
          />
        </label>

        {error ? (
          <p className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link href="/forgot-password" className="transition hover:text-white">
            Mot de passe oublie ?
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}

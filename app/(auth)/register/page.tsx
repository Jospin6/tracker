"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
    const fullName = formData.get("full_name")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    // Validation basique côté client
    if (!email || !password || !fullName) {
      setError("Tous les champs sont obligatoires.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsSubmitting(false);
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Adresse email invalide.");
      setIsSubmitting(false);
      return;
    }

    const payload = { email, full_name: fullName, password };

    const registerResponse = await fetch("/api/auth/register", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!registerResponse.ok) {
      const body = await registerResponse.json().catch(() => null);
      setError(body?.error ?? "Impossible de creer le compte.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (signInError || !data.session) {
      setError(
        signInError?.message ??
          "Compte cree, mais la connexion automatique a echoue."
      );
      setIsSubmitting(false);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session", {
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

    if (!sessionResponse.ok) {
      setError("Le compte existe, mais la session serveur a echoue.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Inscription
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Cree ton workspace NuruTrack
        </h1>
        <p className="max-w-xl text-slate-400">
          Ton compte personnel est cree avec un workspace et des permissions
          owner.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Nom complet</span>
          <input
            name="full_name"
            type="text"
            required
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
          />
        </label>

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
            minLength={8}
            required
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
          />
        </label>

        {error ? (
          <p className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creation..." : "Creer un compte"}
        </button>
      </form>

      <p className="text-sm text-slate-400">
        Deja un compte ?{" "}
        <Link href="/login" className="text-white underline">
          Connexion
        </Link>
      </p>
    </div>
  );
}

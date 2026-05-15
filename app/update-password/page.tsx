"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const response = await fetch("/api/auth/session", {
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

      if (!response.ok) {
        setError("Le mot de passe a ete mis a jour mais la session serveur a echoue.");
        setIsSubmitting(false);
        return;
      }
    }

    setMessage("Mot de passe mis a jour.");
    router.replace("/dashboard");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
      <div className="app-panel w-full p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Recuperation
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
          Nouveau mot de passe
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Nouveau mot de passe</span>
            <input
              name="password"
              type="password"
              minLength={8}
              required
              className="app-input focus:border-brand-400"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            <span>Confirmation</span>
            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              required
              className="app-input focus:border-brand-400"
            />
          </label>

          {message ? (
            <p className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="app-button-primary w-full hover:brightness-[1.04]"
          >
            {isSubmitting ? "Mise a jour..." : "Mettre a jour"}
          </button>
        </form>
      </div>
    </main>
  );
}

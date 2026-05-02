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

    setMessage("Ton mot de passe a ete mis a jour.");
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
      <div className="w-full rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-soft sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Recuperation
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Definis un nouveau mot de passe
        </h1>
        <p className="mt-2 text-slate-400">
          Choisis un nouveau mot de passe puis retourne dans ton dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Nouveau mot de passe</span>
            <input
              name="password"
              type="password"
              minLength={8}
              required
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            <span>Confirmation</span>
            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              required
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
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
            className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Mise a jour..." : "Mettre a jour"}
          </button>
        </form>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() ?? "";
    const supabase = createBrowserClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/update-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Le lien de reinitialisation a ete envoye.");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Mot de passe oublie
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Reinitialise ton mot de passe
        </h1>
        <p className="max-w-xl text-slate-400">
          Nous t&apos;enverrons un lien de reinitialisation sur ton email.
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
          {isSubmitting ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>

      <p className="text-sm text-slate-400">
        Retour a{" "}
        <Link href="/login" className="text-white underline">
          connexion
        </Link>
        .
      </p>
    </div>
  );
}

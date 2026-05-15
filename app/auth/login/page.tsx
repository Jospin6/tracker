"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";
  const isRegistered = searchParams.get("registered") === "1";
  const requiresConfirmation = searchParams.get("confirmation") === "1";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const response = await fetch("/api/auth/login", {
      body: JSON.stringify({
        email,
        password,
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Impossible de se connecter.");
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectedFrom);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Connexion
        </p>
        <h1 className="font-heading text-3xl font-semibold text-white">
          Acces securise
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isRegistered ? (
          <p className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {requiresConfirmation
              ? "Compte cree. Verifie ton email avant de te connecter."
              : "Compte cree. Connecte-toi pour acceder au dashboard."}
          </p>
        ) : null}

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            className="app-input focus:border-brand-400"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            className="app-input focus:border-brand-400"
          />
        </label>

        {error ? (
          <p className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/auth/forgot-password"
            className="transition hover:text-white"
          >
            Mot de passe oublie ?
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="app-button-primary hover:brightness-[1.04]"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="space-y-8" />}>
      <LoginPageContent />
    </Suspense>
  );
}

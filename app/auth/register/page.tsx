"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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

    if (!email || !password || !fullName) {
      setError("Tous les champs sont obligatoires.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres.");
      setIsSubmitting(false);
      return;
    }

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

    const body = await registerResponse.json().catch(() => null);

    if (body?.requiresEmailConfirmation) {
      router.replace("/auth/login?registered=1&confirmation=1");
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Inscription
        </p>
        <h1 className="font-heading text-3xl font-semibold text-white">
          Creer un compte
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Nom complet</span>
          <input
            name="full_name"
            type="text"
            required
            className="app-input focus:border-brand-400"
          />
        </label>

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
            minLength={8}
            required
            className="app-input focus:border-brand-400"
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
          className="app-button-primary w-full hover:brightness-[1.04]"
        >
          {isSubmitting ? "Creation..." : "Creer un compte"}
        </button>
      </form>

      <p className="text-sm text-slate-400">
        Deja un compte ?{" "}
        <Link href="/auth/login" className="text-white underline">
          Connexion
        </Link>
      </p>
    </div>
  );
}

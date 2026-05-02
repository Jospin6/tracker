import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "NuruTrack • Auth",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12 sm:px-10">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            NuruTrack
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/login" className="transition hover:text-white">
              Connexion
            </Link>
            <Link href="/register" className="transition hover:text-white">
              Inscription
            </Link>
          </nav>
        </header>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-soft sm:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}

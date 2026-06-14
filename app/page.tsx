import Link from "next/link";

const focusItems = [
  {
    label: "Projets",
    value: "Suivi clair",
  },
  {
    label: "Taches",
    value: "Execution",
  },
  {
    label: "Finances",
    value: "Cash",
  },
];

export default function Home() {
  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <section className="w-full max-w-sm text-center">
        <p className="font-heading text-xs font-medium uppercase tracking-[0.4em] text-white/55">
          NuruTrack
        </p>

        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
          Projets, taches, finances.
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
          Un espace unique pour suivre l&apos;essentiel, sans surcharge.
        </p>

        <div className="mt-6 grid gap-2">
          {focusItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-full border border-white/10 px-4 py-3 text-sm"
            >
              <span className="text-white/85">{item.label}</span>
              <span className="text-white/45">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/80 transition hover:border-white/20 hover:text-white"
          >
            Ouvrir le dashboard
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/auth/login" className="text-white/45 transition hover:text-white/75">
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="text-white/45 transition hover:text-white/75"
            >
              Inscription
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

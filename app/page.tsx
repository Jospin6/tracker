import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1 text-sm font-semibold text-brand-200">
            NuruTrack
          </span>
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
            Pilotage business.
          </h1>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="app-button-primary hover:brightness-[1.04]"
            >
              Creer un compte
            </Link>
            <Link
              href="/auth/login"
              className="app-button-secondary hover:border-white/20 hover:bg-white/8"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="app-panel p-8">
          <div className="space-y-4">
            <div className="app-card rounded-3xl p-5">
              <h2 className="font-heading text-base font-semibold text-white">
                Portefeuille
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {["Projets", "Taches", "Revenus", "Encours"].map((item) => (
                  <div key={item} className="app-tile rounded-3xl p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                      {item}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">---</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-brand-500/16 bg-brand-500/10 p-5">
                <p className="text-sm font-medium text-brand-200">
                  Progression moyenne
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">68%</p>
              </div>

              <div className="app-tile rounded-3xl p-5">
                <p className="text-sm font-medium text-slate-400">
                  Cash disponible
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">EUR 24.6k</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

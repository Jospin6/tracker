import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:px-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-brand-500/15 px-4 py-1 text-sm font-semibold text-brand-200">
            SaaS multi-utilisateur • Tableau de bord business
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            NuruTrack, cockpit de pilotage pour entrepreneurs et petites équipes.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Organise tes activités, projets, objectifs, finances, factures et publications depuis un workspace sécurisé avec Supabase, Drizzle et Next.js.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            >
              Se connecter
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-soft">
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <h2 className="text-base font-semibold text-white">Aperçu du dashboard</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  "Projets en cours",
                  "Tâches du jour",
                  "Revenus du mois",
                  "Factures impayées",
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-white/5 bg-slate-900 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">•••</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-brand-500/10 p-5">
                <p className="text-sm font-medium text-brand-200">Progression moyenne</p>
                <p className="mt-3 text-3xl font-semibold text-white">68%</p>
              </div>
              <div className="rounded-3xl bg-slate-800 p-5">
                <p className="text-sm font-medium text-slate-400">Membre du workspace</p>
                <p className="mt-3 text-3xl font-semibold text-white">Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: "Workspaces", description: "Prépare la gestion multi-workspace et les rôles owner/admin." },
          { title: "Activités", description: "Suivi centralisé des activités, projets, tâches et clients." },
          { title: "Budget", description: "Transactions, enveloppes et visualisation budgetaire integrées." },
        ].map((card) => (
          <article key={card.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-white">{card.title}</h3>
            <p className="mt-3 text-slate-300">{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

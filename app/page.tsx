import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  ShieldCheck,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUserOrNull, getWorkspaceContext } from "@/lib/auth/server";
import {
  getLandingWorkspaceSnapshot,
  type LandingWorkspaceSnapshot,
} from "@/lib/data/landing";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

type FeatureItem = {
  description: string;
  icon: LucideIcon;
  title: string;
};

type ModuleItem = {
  description: string;
  icon: LucideIcon;
  title: string;
};

type SnapshotMetricItem = {
  label: string;
  tone?: "brand" | "default";
  value: string;
};

const featureItems: FeatureItem[] = [
  {
    description: "Activites, projets, clients et objectifs restent relies.",
    icon: FolderKanban,
    title: "Structure claire",
  },
  {
    description: "Les priorites, retards et taches ouvertes restent visibles.",
    icon: ListTodo,
    title: "Execution lisible",
  },
  {
    description: "Budget, flux et encours client restent dans le meme cockpit.",
    icon: BadgeDollarSign,
    title: "Cash sous controle",
  },
];

const moduleItems: ModuleItem[] = [
  {
    description: "Le point d'entree de chaque ligne de business.",
    icon: BriefcaseBusiness,
    title: "Activites",
  },
  {
    description: "Le decoupage concret du travail et des livrables.",
    icon: FolderKanban,
    title: "Projets et taches",
  },
  {
    description: "Le suivi des clients, factures et soldes a encaisser.",
    icon: UsersRound,
    title: "Relation client",
  },
  {
    description: "Le contenu social reste rattache aux vraies priorites.",
    icon: Megaphone,
    title: "Communication",
  },
];

const workflowItems: ModuleItem[] = [
  {
    description: "Clarifier ce qui compte et pour qui.",
    icon: Target,
    title: "Cadrer",
  },
  {
    description: "Lier projets, taches et echeances.",
    icon: ListTodo,
    title: "Executer",
  },
  {
    description: "Suivre revenus, factures et balance.",
    icon: BadgeDollarSign,
    title: "Encaisser",
  },
  {
    description: "Coordonner vos prises de parole sans perdre le fil.",
    icon: Megaphone,
    title: "Communiquer",
  },
];

const publicSignals = [
  "Une seule base de travail",
  "Moins de dispersion",
  "Des decisions plus rapides",
  "Un dashboard clair",
];

function FeatureCard({ description, icon: Icon, title }: FeatureItem) {
  return (
    <article className="app-card h-full p-6">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-200 ring-1 ring-brand-500/16">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-heading text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </article>
  );
}

function ModuleCard({ description, icon: Icon, title }: ModuleItem) {
  return (
    <article className="app-tile h-full rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-brand-200 ring-1 ring-white/8">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

function SnapshotMetricCard({ label, tone = "default", value }: SnapshotMetricItem) {
  const toneClassName =
    tone === "brand"
      ? "border-brand-500/16 bg-brand-500/10"
      : "border-white/8 bg-black/30";

  return (
    <article className={`rounded-[1.5rem] border p-5 ${toneClassName}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p>
    </article>
  );
}

function PublicProductPreview() {
  return (
    <div className="app-panel relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/45 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-brand-200">
            Vue produit
          </p>
          <h2 className="mt-4 font-heading text-2xl font-semibold text-white">
            Un cockpit simple a prendre en main.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            La page d&apos;accueil pose le cadre. Le dashboard prend ensuite le relais
            avec les vraies donnees du workspace.
          </p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-200 ring-1 ring-brand-500/16">
          <LayoutDashboard className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {moduleItems.map((item) => (
          <ModuleCard key={item.title} {...item} />
        ))}
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-white/8 bg-black/25 p-5">
        <div className="flex flex-wrap gap-2">
          {publicSignals.map((signal) => (
            <span
              key={signal}
              className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-200" />
              {signal}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthenticatedProductPreview({
  displayName,
  snapshot,
  workspaceName,
}: {
  displayName: string | null;
  snapshot: LandingWorkspaceSnapshot;
  workspaceName: string;
}) {
  const metrics: SnapshotMetricItem[] = [
    {
      label: "Projets actifs",
      value: String(snapshot.activeProjects),
    },
    {
      label: "Taches ouvertes",
      value: String(snapshot.openTasks),
    },
    {
      label: "Revenus du mois",
      tone: "brand",
      value: formatCurrency(snapshot.monthlyIncome),
    },
    {
      label: "Encours client",
      value: formatCurrency(snapshot.outstandingInvoices),
    },
    {
      label: "Progression moyenne",
      value: formatPercent(snapshot.goalAverageProgress),
    },
    {
      label: "Balance suivie",
      value: formatCurrency(snapshot.availableCash),
    },
  ];

  return (
    <div className="app-panel relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/45 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-sm">
          <h2 className="mt-4 font-heading text-2xl font-semibold text-white">
            {workspaceName}
          </h2>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-200 ring-1 ring-brand-500/16">
          <LayoutDashboard className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <SnapshotMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-[1.75rem] border border-white/8 bg-black/25 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          
        </div>
        <Link
          href="/dashboard"
          className="app-button-primary whitespace-nowrap hover:brightness-[1.04]"
        >
          Ouvrir le dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default async function Home() {
  const user = await getCurrentUserOrNull();

  let displayName: string | null = null;
  let snapshot: LandingWorkspaceSnapshot | null = null;
  let workspaceName: string | null = null;

  if (user) {
    const workspaceContext = await getWorkspaceContext();

    displayName =
      workspaceContext.profile?.firstName ??
      workspaceContext.profile?.fullName?.split(" ")[0] ??
      null;
    workspaceName = workspaceContext.activeWorkspace.name;
    snapshot = await getLandingWorkspaceSnapshot(workspaceContext.activeWorkspace.id);
  }

  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(214,179,107,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(125,183,173,0.14),transparent_28%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-heading text-xl font-semibold tracking-tight text-white"
          >
            NuruTrack
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {snapshot ? (
              <>
                <span className="inline-flex rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-200">
                  Espace actif: {workspaceName}
                </span>
                <Link
                  href="/dashboard"
                  className="app-button-primary hover:brightness-[1.04]"
                >
                  Aller au dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="app-button-secondary hover:border-white/20 hover:bg-white/8"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="app-button-primary hover:brightness-[1.04]"
                >
                  Creer un compte
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="grid flex-1 gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">

              <div className="space-y-4">
                <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
                  Activites, execution et cash dans un seul espace.
                </h1>

                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  NuruTrack centralise le pilotage quotidien: activites, projets,
                  taches, objectifs, budget, factures et contenu social.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              {snapshot ? (
                <>
                  <Link
                    href="/dashboard"
                    className="app-button-primary hover:brightness-[1.04]"
                  >
                    Reprendre le dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard/projects"
                    className="app-button-secondary hover:border-white/20 hover:bg-white/8"
                  >
                    Voir les projets
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="app-button-primary hover:brightness-[1.04]"
                  >
                    Creer un compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="app-button-secondary hover:border-white/20 hover:bg-white/8"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Portefeuille structure",
                "Priorites visibles",
                "Encaissements suivis",
                "Decision plus rapide",
              ].map((item) => (
                <div key={item} className="app-tile rounded-[1.5rem] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-brand-200" />
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {snapshot && workspaceName ? (
            <AuthenticatedProductPreview
              displayName={displayName}
              snapshot={snapshot}
              workspaceName={workspaceName}
            />
          ) : (
            <PublicProductPreview />
          )}
        </section>

        <section className="grid gap-4 py-4 md:grid-cols-3">
          {featureItems.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </section>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="app-panel p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-200">
              Fonctionnement
            </p>
            <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
              Du cadrage au suivi financier, sans changer d&apos;outil.
            </h2>
            <div className="mt-8 grid gap-3">
              {workflowItems.map((item, index) => (
                <article key={item.title} className="app-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-200 ring-1 ring-brand-500/16">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-brand-200" />
                        <h3 className="font-heading text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="app-panel p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-200">
              Modules relies
            </p>
            <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
              L&apos;application reste simple, mais couvre tout le cycle de travail.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {moduleItems.map((item) => (
                <ModuleCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="app-panel relative overflow-hidden p-8 sm:p-10">
            <div className="absolute -right-16 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-brand-500/12 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.22em] text-brand-200">
                  NuruTrack
                </p>
                <h2 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  {snapshot
                    ? "Votre espace est pret."
                    : "Une entree claire, puis un dashboard alimente par vos donnees."}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  {snapshot
                    ? "Passez directement a l'action avec vos vraies donnees de travail."
                    : "La page d'accueil explique simplement le produit. Les donnees reelles apparaissent des que la session existe."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {snapshot ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="app-button-primary hover:brightness-[1.04]"
                    >
                      Ouvrir le dashboard
                    </Link>
                    <Link
                      href="/dashboard/finances"
                      className="app-button-secondary hover:border-white/20 hover:bg-white/8"
                    >
                      Voir les finances
                    </Link>
                  </>
                ) : (
                  <>
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
                      Connexion
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

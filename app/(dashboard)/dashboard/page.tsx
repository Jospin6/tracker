import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  FileText,
  ListTodo,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { FinanceAreaChart } from "@/components/charts/finance-area-chart";
import {
  EmptyState,
  MetricCard,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Dashboard"
        title="Vue portefeuille"
        description="Toutes les activites et leurs projets."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Activity className="h-5 w-5" />}
          label="Activites actives"
          value={String(data.metrics.activeActivities)}
          hint={`${data.activities.length} au total`}
        />
        <MetricCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          label="Projets actifs"
          value={String(data.metrics.activeProjects)}
          hint={`${data.orphanProjects.length} hors activite`}
        />
        <MetricCard
          icon={<BadgeDollarSign className="h-5 w-5" />}
          label="Balance du mois"
          value={formatCurrency(data.metrics.monthlyBalance)}
          hint={`${formatCurrency(data.metrics.monthlyIncome)} revenus`}
        />
        <MetricCard
          icon={<FileText className="h-5 w-5" />}
          label="Encours"
          value={formatCurrency(data.metrics.unpaidInvoices)}
          hint={`${data.upcomingInvoices.length} a suivre`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel>
          <SectionTitle icon={TrendingUp} title="Cashflow" description="Flux net sur six mois." />
          <div className="h-72">
            <FinanceAreaChart data={data.trendData} />
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            icon={AlertTriangle}
            title="Points de structure"
            description="Ce qui demande une correction."
          />
          <div className="grid gap-3">
            <div className="rounded-xl bg-black px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Projets hors activite
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.orphanProjects.length}
              </p>
            </div>
            <div className="rounded-xl bg-black px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Taches ouvertes
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.metrics.openTasks}
              </p>
            </div>
            <div className="rounded-xl bg-black px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Clients suivis
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.metrics.clients}
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionTitle
            icon={Activity}
            title="Activites"
            description="Point d'entree du travail."
          />
          <div className="space-y-3">
            {data.activities.length ? (
              data.activities.map((activity) => (
                <article key={activity.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{activity.name}</h3>
                        <StatusBadge value={activity.status} />
                      </div>
                      <p className="text-sm text-zinc-500">
                        {activity.clientCount} client(s) | {activity.projectsCount} projet(s)
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/activities/${activity.id}`}
                      className={secondaryButtonClassName}
                    >
                      Ouvrir
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Balance
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatCurrency(activity.balance)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Objectifs
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatPercent(activity.goalAverageProgress)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Execution
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {activity.openTasks} ouvertes
                      </p>
                    </div>
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Encours
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatCurrency(activity.outstanding)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune activite"
                description="Commence par creer une activite."
              />
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <SectionTitle
              icon={AlertTriangle}
              title="Projets a risque"
              description="Retards, blocages, encours."
            />
            <div className="space-y-3">
              {data.attentionProjects.length ? (
                data.attentionProjects.map((project) => (
                  <article key={project.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-medium text-white">{project.name}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {project.activityName || "Sans activite"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge value={project.status} />
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className={secondaryButtonClassName}
                        >
                          Ouvrir
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-300">
                      <span>{project.overdueTasks} retard(s)</span>
                      <span>{formatCurrency(project.outstanding)} encours</span>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Rien de critique" description="Aucun projet en zone rouge." />
              )}
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              icon={UsersRound}
              title="Flux recents"
              description="Dernieres operations."
            />
            <div className="space-y-3">
              {data.recentTransactions.length ? (
                data.recentTransactions.map((transaction) => (
                  <article
                    key={transaction.id}
                    className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">
                          {transaction.description || transaction.category || "Operation"}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {transaction.activityName || "Sans activite"} |{" "}
                          {transaction.projectName || "Sans projet"}
                        </p>
                      </div>
                      <StatusBadge value={transaction.type} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun flux" description="Aucune operation recente." />
              )}
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <SectionTitle
            icon={ListTodo}
            title="Taches en retard"
            description="Execution a reprendre."
          />
          <div className="space-y-3">
            {data.overdueTasks.length ? (
              data.overdueTasks.map((task) => (
                <article key={task.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        {task.activityName || "Sans activite"} |{" "}
                        {task.projectName || "Sans projet"}
                      </p>
                    </div>
                    <StatusBadge value={task.status} />
                  </div>
                  <p className="mt-3 text-sm text-white">{formatDate(task.dueDate)}</p>
                </article>
              ))
            ) : (
              <EmptyState title="Aucun retard" description="Aucune tache critique." />
            )}
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            icon={FileText}
            title="Factures a suivre"
            description="Encaissements proches."
          />
          <div className="space-y-3">
            {data.upcomingInvoices.length ? (
              data.upcomingInvoices.map((invoice) => (
                <article key={invoice.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{invoice.invoiceNumber}</h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        {invoice.clientName || "Sans client"} |{" "}
                        {invoice.projectName || "Sans projet"}
                      </p>
                    </div>
                    <StatusBadge value={invoice.status} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">
                    Reste {formatCurrency(invoice.outstanding, invoice.currency)} |{" "}
                    {formatDate(invoice.dueAt)}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState title="Aucune facture" description="Aucun encours a surveiller." />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

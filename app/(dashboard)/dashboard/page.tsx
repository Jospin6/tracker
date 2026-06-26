import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  FileText,
  ListTodo,
  Building2,
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
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* <PageIntro
        eyebrow="Dashboard"
        title="Vue portefeuille"
        description="Toutes les activites et leurs projets."
      /> */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Building2 className="h-5 w-5" />}
          label="Entreprises"
          value={String(data.metrics.companies)}
          hint={`${data.companies.length} suivies`}
        />
        <MetricCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          label="Projets actifs"
          value={String(data.metrics.activeProjects)}
          hint={`${data.orphanProjects.length} sans entreprise`}
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
                Projets sans entreprise
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
                Contacts suivis
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.metrics.contacts}
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionTitle
            icon={Building2}
            title="Entreprises"
            description="Point d'entree du travail."
          />
          <div className="space-y-3">
            {data.companies.length ? (
              data.companies.map((company) => (
                <article key={company.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                        <StatusBadge value={company.status} />
                      </div>
                      <p className="text-sm text-zinc-500">
                        {company.contactCount} contact(s) | {company.projectCount} projet(s)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Balance
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatCurrency(company.balance)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Projets
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {company.projectCount}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Execution
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {company.projectNames.join(" | ") || "Aucun projet"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Encours
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatCurrency(company.outstanding)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune entreprise"
                description="Commence par creer une entreprise."
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
                          {project.companyName || "Sans entreprise"}
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
                          {transaction.companyName || "Sans entreprise"} |{" "}
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
                        {task.companyName || "Sans entreprise"} |{" "}
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
                        {invoice.companyName || "Sans entreprise"} |{" "}
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

import { getDashboardData } from "@/lib/data/mvp";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";
import { FinanceAreaChart } from "@/components/charts/finance-area-chart";
import {
  EmptyState,
  MetricCard,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="MVP"
        title="Pilotage global"
        description="Vue d'ensemble de tes projets, objectifs, finances et factures pour le workspace actif."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Projets actifs"
          value={String(data.metrics.activeProjects)}
          hint={`${data.metrics.openTasks} taches ouvertes`}
        />
        <MetricCard
          label="Balance du mois"
          value={formatCurrency(data.metrics.monthlyBalance)}
          hint={`${formatCurrency(data.metrics.monthlyIncome)} revenus / ${formatCurrency(
            data.metrics.monthlyExpense
          )} depenses`}
        />
        <MetricCard
          label="Progression objectifs"
          value={formatPercent(data.metrics.goalAverageProgress)}
          hint={`${data.goals.length} objectifs suivis`}
        />
        <MetricCard
          label="Factures a encaisser"
          value={formatCurrency(data.metrics.unpaidInvoices)}
          hint={`${data.upcomingInvoices.length} facture(s) a surveiller`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <SectionTitle
            title="Tendance de tresorerie"
            description="Flux net mensuel sur les six derniers mois."
          />
          <div className="h-72">
            <FinanceAreaChart data={data.trendData} />
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            title="Vue rapide"
            description="Ce qui demande ton attention en premier."
          />
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Clients actifs
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {data.metrics.clients}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Posts planifies
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {data.metrics.scheduledPosts}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Activites
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {data.activities.length}
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel>
          <SectionTitle
            title="Projets recents"
            description="Les derniers chantiers ou missions mis a jour."
          />
          <div className="space-y-4">
            {data.projects.length ? (
              data.projects.map((project) => (
                <article key={project.id} className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Budget: {formatCurrency(project.budgetUsed)} /{" "}
                        {formatCurrency(project.budgetPlanned)}
                      </p>
                    </div>
                    <StatusBadge value={project.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    Progression: {formatPercent(project.progress)}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucun projet"
                description="Cree ton premier projet pour suivre budget et progression."
              />
            )}
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            title="Taches en retard"
            description="Les actions a cloturer rapidement."
          />
          <div className="space-y-4">
            {data.overdueTasks.length ? (
              data.overdueTasks.map((task) => (
                <article key={task.id} className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{task.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Echeance: {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <StatusBadge value={task.status} />
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Rien d'urgent"
                description="Aucune tache en retard pour le moment."
              />
            )}
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            title="Factures a relancer"
            description="Le suivi des encaissements a surveiller."
          />
          <div className="space-y-4">
            {data.upcomingInvoices.length ? (
              data.upcomingInvoices.map((invoice) => (
                <article key={invoice.id} className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {invoice.invoiceNumber}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Echeance: {formatDate(invoice.dueAt)}
                      </p>
                    </div>
                    <StatusBadge value={invoice.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    Reste a encaisser:{" "}
                    {formatCurrency(invoice.total - invoice.paidAmount)}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune alerte"
                description="Les factures de ce workspace sont a jour."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

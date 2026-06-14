import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Plus,
  TrendingUp,
} from "lucide-react";

import {
  createBudgetAction,
  createTransactionAction,
} from "@/app/actions";
import { BudgetBreakdownChart } from "@/components/charts/budget-breakdown-chart";
import { BudgetEvolutionChart } from "@/components/charts/budget-evolution-chart";
import { ResponsiveFormDialog } from "@/components/dashboard/responsive-form-dialog";
import {
  EmptyState,
  FormField,
  MetricCard,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SubmitButton } from "@/components/shared/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBudgetPageData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils/format";

function TransactionForm({
  activities,
  clients,
  projects,
}: {
  activities: Array<{ id: string; label: string }>;
  clients: Array<{ id: string; label: string }>;
  projects: Array<{ id: string; label: string }>;
}) {
  return (
    <form action={createTransactionAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Type">
          <select name="type" defaultValue="expense" className={formSelectClassName}>
            <option value="expense">Depense</option>
            <option value="income">Gain</option>
            <option value="investment">Investissement</option>
            <option value="debt">Dette</option>
          </select>
        </FormField>

        <FormField label="Montant">
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Categorie">
          <input
            name="category"
            placeholder="Loyer, Ads, Salaire, Courses..."
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Date">
          <input
            name="transactionDate"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Mode de paiement">
          <input
            name="paymentMethod"
            placeholder="Carte, virement, cash..."
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Devise">
          <input name="currency" defaultValue="EUR" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Activite">
          <select
            name="activityId"
            required
            defaultValue={activities[0]?.id ?? ""}
            className={formSelectClassName}
          >
            <option value="">Choisir une activite</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Projet">
          <select name="projectId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans projet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Client">
        <select name="clientId" defaultValue="" className={formSelectClassName}>
          <option value="">Sans client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Libelle">
        <input
          name="description"
          placeholder="Achat materiel, paiement client..."
          className={formControlClassName}
        />
      </FormField>

      <FormField label="Notes">
        <textarea
          name="notes"
          rows={4}
          placeholder="Details utiles"
          className={formTextareaClassName}
        />
      </FormField>

      <SubmitButton
        idleLabel="Enregistrer l&apos;operation"
        className={`w-full ${primaryButtonClassName}`}
      />
    </form>
  );
}

function BudgetForm({
  activities,
  projects,
}: {
  activities: Array<{ id: string; label: string }>;
  projects: Array<{ id: string; label: string }>;
}) {
  return (
    <form action={createBudgetAction} className="space-y-4">
      <FormField
        label="Nom du budget"
        description="Utilise le meme nom que la categorie de depense pour le suivi automatique."
      >
        <input
          name="name"
          required
          placeholder="Loyer, Marketing, Transport..."
          className={formControlClassName}
        />
      </FormField>

      <FormField label="Montant planifie">
        <input
          name="totalAmount"
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="0"
          className={formControlClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Debut de periode">
          <input name="periodStart" type="date" className={formControlClassName} />
        </FormField>

        <FormField label="Fin de periode">
          <input name="periodEnd" type="date" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Activite">
          <select
            name="activityId"
            required
            defaultValue={activities[0]?.id ?? ""}
            className={formSelectClassName}
          >
            <option value="">Choisir une activite</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Projet">
          <select name="projectId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans projet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <SubmitButton
        idleLabel="Creer l'enveloppe"
        className={`w-full ${primaryButtonClassName}`}
      />
    </form>
  );
}

export default async function BudgetPage() {
  const data = await getBudgetPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Budget"
        title="Pilotage budgetaire"
        description="Gains, depenses, enveloppes et evolution du budget."
      />

      <div className="flex flex-wrap gap-3">
        <ResponsiveFormDialog
          title="Nouvelle operation"
          description="Ajoute un gain ou une depense."
          triggerLabel="Nouvelle operation"
          triggerClassName={primaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle
                icon={Plus}
                title="Nouvelle operation"
                description="Ajoute un gain ou une depense."
              />
              <TransactionForm
                activities={data.activities}
                clients={data.clients}
                projects={data.projects}
              />
            </Panel>
          }
        >
          <TransactionForm
            activities={data.activities}
            clients={data.clients}
            projects={data.projects}
          />
        </ResponsiveFormDialog>

        <ResponsiveFormDialog
          title="Nouvelle enveloppe"
          description="Cree un budget a suivre automatiquement."
          triggerLabel="Nouvelle enveloppe"
          triggerClassName={secondaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle
                icon={BriefcaseBusiness}
                title="Nouvelle enveloppe"
                description="Cree un budget a suivre automatiquement."
              />
              <BudgetForm activities={data.activities} projects={data.projects} />
            </Panel>
          }
        >
          <BudgetForm activities={data.activities} projects={data.projects} />
        </ResponsiveFormDialog>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<BadgeDollarSign className="h-5 w-5" />}
          label="Solde du mois"
          value={formatCurrency(data.summary.currentMonthBalance)}
          hint={`${data.summary.savingsRate}% d'epargne`}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Gains du mois"
          value={formatCurrency(data.summary.currentMonthIncome)}
          hint={`${data.summary.transactionCount} operations`}
        />
        <MetricCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Sorties du mois"
          value={formatCurrency(data.summary.currentMonthExpense)}
          hint={`Ticket moyen ${formatCurrency(data.summary.averageExpenseTicket)}`}
        />
        <MetricCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          label="Budget restant"
          value={formatCurrency(data.summary.currentBudgetRemaining)}
          hint={`${data.summary.activeBudgetCount} enveloppe(s) active(s)`}
        />
      </section>

      <Tabs defaultValue="overview">
        <TabsList className="max-w-4xl">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Enveloppes</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Panel>
                <SectionTitle
                  icon={TrendingUp}
                  title="Evolution budgetaire"
                  description="Six derniers mois."
                />
                <div className="h-80">
                  <BudgetEvolutionChart data={data.trendData} />
                </div>
              </Panel>

              <Panel>
                <SectionTitle
                  icon={BadgeDollarSign}
                  title="Depenses par categorie"
                  description="90 derniers jours."
                />
                <div className="h-80">
                  {data.expenseCategories.length ? (
                    <BudgetBreakdownChart data={data.expenseCategories} />
                  ) : (
                    <EmptyState
                      title="Aucune categorie"
                      description="Aucune depense assez recente pour faire un breakdown."
                    />
                  )}
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Panel>
                <SectionTitle
                  icon={BriefcaseBusiness}
                  title="Enveloppes actives"
                  description="Suivi du mois en cours."
                />
                <div className="space-y-4">
                  {data.budgets.filter((budget) => budget.isActiveThisMonth).length ? (
                    data.budgets
                      .filter((budget) => budget.isActiveThisMonth)
                      .slice(0, 5)
                      .map((budget) => (
                        <article key={budget.id} className="rounded-xl bg-black p-4 ring-1 ring-white/8">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-medium text-white">{budget.name}</h3>
                              <p className="mt-2 text-sm text-zinc-500">
                                {budget.scopeLabel} | {formatDate(budget.periodStart)} - {formatDate(budget.periodEnd)}
                              </p>
                            </div>
                            <StatusBadge value={budget.status} />
                          </div>
                          <div className="mt-4">
                            <ProgressBar
                              label="Utilisation"
                              value={budget.progressValue}
                              displayValue={budget.utilization}
                            />
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-black px-3 py-3 ring-1 ring-white/8">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Planifie</p>
                              <p className="mt-2 text-sm font-medium text-white">
                                {formatCurrency(budget.totalAmount)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-black px-3 py-3 ring-1 ring-white/8">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Utilise</p>
                              <p className="mt-2 text-sm font-medium text-white">
                                {formatCurrency(budget.actualUsed)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-black px-3 py-3 ring-1 ring-white/8">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Reste</p>
                              <p className="mt-2 text-sm font-medium text-white">
                                {formatCurrency(budget.remaining)}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))
                  ) : (
                    <EmptyState
                      title="Aucune enveloppe active"
                      description="Cree un budget pour suivre automatiquement tes categories."
                    />
                  )}
                </div>
              </Panel>

              <Panel>
                <SectionTitle
                  icon={FileText}
                  title="Plus grosses sorties"
                  description="Ce mois."
                />
                <div className="space-y-3">
                  {data.largestOutflows.length ? (
                    data.largestOutflows.map((transaction) => (
                      <article key={transaction.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-white">
                              {transaction.description || transaction.category || "Operation"}
                            </h3>
                            <p className="mt-2 text-sm text-zinc-500">
                              {transaction.category || "Non classe"} | {transaction.paymentMethod || "Non precise"}
                            </p>
                            <p className="mt-2 text-sm text-zinc-500">
                              {transaction.activityName || "Sans activite"} | {transaction.projectName || "Sans projet"}
                            </p>
                          </div>
                          <div className="text-right">
                            <StatusBadge value={transaction.type} />
                            <p className="mt-3 text-sm font-medium text-white">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <EmptyState
                      title="Aucune sortie"
                      description="Ajoute des depenses pour suivre leur evolution."
                    />
                  )}
                </div>
              </Panel>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Panel>
            <SectionTitle
              icon={CreditCard}
              title="Historique"
              description="Tous les gains et depenses."
            />
            <div className="space-y-3">
              {data.transactions.length ? (
                data.transactions.map((transaction) => (
                  <article key={transaction.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-white">
                            {transaction.description || transaction.category || "Operation"}
                          </h3>
                          <StatusBadge value={transaction.type} />
                        </div>
                        <p className="text-sm text-zinc-500">
                          {transaction.activityName || "Sans activite"} | {transaction.projectName || "Sans projet"} | {transaction.clientName || "Sans client"}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Date</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatDate(transaction.transactionDate)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Categorie</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {transaction.category || "-"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Paiement</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {transaction.paymentMethod || "-"}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Aucune operation"
                  description="Commence a enregistrer tes gains et depenses."
                />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="budgets">
          <Panel>
            <SectionTitle
              icon={BriefcaseBusiness}
              title="Enveloppes budgetaires"
              description="Chaque enveloppe suit une categorie de depense."
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {data.budgets.length ? (
                data.budgets.map((budget) => (
                  <article key={budget.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{budget.name}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {budget.scopeLabel} | {formatDate(budget.periodStart)} - {formatDate(budget.periodEnd)}
                        </p>
                      </div>
                      <StatusBadge value={budget.status} />
                    </div>

                    <div className="mt-4">
                      <ProgressBar
                        label="Utilisation"
                        value={budget.progressValue}
                        displayValue={budget.utilization}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Planifie</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(budget.totalAmount)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Utilise</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(budget.actualUsed)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Reste</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(budget.remaining)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-zinc-500">
                      {budget.matchingTransactionCount} operation(s) rattachee(s)
                    </p>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Aucune enveloppe"
                  description="Cree des budgets par categorie pour suivre automatiquement les depenses."
                />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-2">
              <Panel>
                <SectionTitle
                  icon={TrendingUp}
                  title="Gains par categorie"
                  description="90 derniers jours."
                />
                <div className="h-80">
                  {data.incomeCategories.length ? (
                    <BudgetBreakdownChart data={data.incomeCategories} />
                  ) : (
                    <EmptyState
                      title="Aucun gain categorie"
                      description="Ajoute des gains classes pour voir la repartition."
                    />
                  )}
                </div>
              </Panel>

              <Panel>
                <SectionTitle
                  icon={CreditCard}
                  title="Modes de paiement"
                  description="Sorties sur 90 jours."
                />
                <div className="h-80">
                  {data.paymentMethods.length ? (
                    <BudgetBreakdownChart data={data.paymentMethods} />
                  ) : (
                    <EmptyState
                      title="Aucun mode de paiement"
                      description="Ajoute des sorties pour voir la repartition."
                    />
                  )}
                </div>
              </Panel>
            </section>

            <Panel>
              <SectionTitle
                icon={FileText}
                title="Lecture mensuelle"
                description="Revenus, sorties et net par mois."
              />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.monthlySnapshots.map((month) => (
                  <article key={month.name} className="rounded-xl bg-black p-4 ring-1 ring-white/8">
                    <h3 className="font-medium text-white">{month.name}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Revenus</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(month.income)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Sorties</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(month.expense)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Net</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(month.net)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

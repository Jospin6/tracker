import { createTransactionAction } from "@/app/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  MetricCard,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getFinancesPageData } from "@/lib/data/mvp";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function FinancesPage() {
  const { clients, projects, summary, transactions } = await getFinancesPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Finances"
        title="Flux financiers"
        description="Note tes revenus, depenses, investissements et avances pour garder une vision de tresorerie."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Revenus" value={formatCurrency(summary.income)} />
        <MetricCard label="Depenses" value={formatCurrency(summary.expense)} />
        <MetricCard label="Balance" value={formatCurrency(summary.balance)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Panel>
          <SectionTitle
            title="Nouvelle operation"
            description="Chaque ligne peut etre reliee a un client ou a un projet."
          />
          <form action={createTransactionAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="type"
                defaultValue="income"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
                <option value="debt">Debt</option>
              </select>
              <input
                name="amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="Montant"
                required
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="currency"
                defaultValue="EUR"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="transactionDate"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="clientId"
                defaultValue=""
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Sans client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.label}
                  </option>
                ))}
              </select>
              <select
                name="projectId"
                defaultValue=""
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Sans projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              name="category"
              placeholder="Categorie"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <input
              name="paymentMethod"
              placeholder="Moyen de paiement"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <textarea
              name="description"
              rows={3}
              placeholder="Description"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <SubmitButton
              idleLabel="Enregistrer l'operation"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Historique"
            description="Les dernieres operations enregistrees dans le workspace."
          />
          <div className="space-y-4">
            {transactions.length ? (
              transactions.map((transaction) => (
                <article key={transaction.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-white">
                          {transaction.description || transaction.category || "Operation"}
                        </h3>
                        <StatusBadge value={transaction.type} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Client: {transaction.clientName || "Sans client"} | Projet:{" "}
                        {transaction.projectName || "Sans projet"}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <span>{formatDate(transaction.transactionDate)}</span>
                    <span>{transaction.category || "Sans categorie"}</span>
                    <span>{transaction.paymentMethod || "Sans moyen"}</span>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune operation"
                description="Ajoute un revenu ou une depense pour suivre ta tresorerie."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

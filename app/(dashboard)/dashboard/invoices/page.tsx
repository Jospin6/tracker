import {
  createInvoiceAction,
  updateInvoicePaymentAction,
} from "@/app/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getInvoicesPageData } from "@/lib/data/mvp";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function InvoicesPage() {
  const { clients, invoices, projects } = await getInvoicesPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Factures"
        title="Emission et encaissement"
        description="Cree tes factures et mets a jour les paiements directement dans le dashboard."
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel>
          <SectionTitle
            title="Nouvelle facture"
            description="Un format simple pour expedier une facture MVP sans quitter l'app."
          />
          <form action={createInvoiceAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="invoiceNumber"
                required
                placeholder="Numero"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <select
                name="status"
                defaultValue="sent"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="currency"
                defaultValue="EUR"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="quantity"
                type="number"
                min={1}
                step="1"
                defaultValue={1}
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <input
              name="itemDescription"
              required
              placeholder="Description de ligne"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                name="subtotal"
                type="number"
                min={0}
                step="0.01"
                placeholder="Sous-total"
                required
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="taxAmount"
                type="number"
                min={0}
                step="0.01"
                defaultValue={0}
                placeholder="Taxes"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="paidAmount"
                type="number"
                min={0}
                step="0.01"
                defaultValue={0}
                placeholder="Encaisse"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="issuedAt"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="dueAt"
                type="date"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <textarea
              name="notes"
              rows={3}
              placeholder="Notes"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <SubmitButton
              idleLabel="Creer la facture"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Factures emises"
            description="Ajuste le montant encaisse et le statut a mesure des paiements."
          />
          <div className="space-y-4">
            {invoices.length ? (
              invoices.map((invoice) => (
                <article key={invoice.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {invoice.invoiceNumber}
                        </h3>
                        <StatusBadge value={invoice.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Client: {invoice.clientName || "Sans client"} | Projet:{" "}
                        {invoice.projectName || "Sans projet"}
                      </p>
                    </div>

                    <form action={updateInvoicePaymentAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <input
                        name="paidAmount"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={invoice.paidAmount}
                        className="w-28 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-brand-500"
                      />
                      <select
                        name="status"
                        defaultValue={invoice.status}
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-brand-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="partially_paid">Partially paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <SubmitButton
                        idleLabel="Maj"
                        pendingLabel="..."
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </form>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-900/70 px-4 py-3">
                      Total: {formatCurrency(invoice.total, invoice.currency)}
                    </div>
                    <div className="rounded-3xl bg-slate-900/70 px-4 py-3">
                      Encaisse: {formatCurrency(invoice.paidAmount, invoice.currency)}
                    </div>
                    <div className="rounded-3xl bg-slate-900/70 px-4 py-3">
                      Reste: {formatCurrency(invoice.outstanding, invoice.currency)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <span>Emise: {formatDate(invoice.issuedAt)}</span>
                    <span>Echeance: {formatDate(invoice.dueAt)}</span>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune facture"
                description="Cree ta premiere facture pour suivre emission et encaissement."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

import { FileText } from "lucide-react";

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
import { getInvoicesPageData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function InvoicesPage() {
  const { invoices, projects } = await getInvoicesPageData();

  return (
    <div className="space-y-8">

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Panel>
          <SectionTitle title="Nouvelle facture" description="Simple et contextualisee." />
          <form action={createInvoiceAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="invoiceNumber"
                required
                placeholder="Numero"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <select
                name="status"
                defaultValue="sent"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="grid gap-4">
              <select
                name="projectId"
                required
                defaultValue=""
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              >
                <option value="">Choisir un projet</option>
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
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <input
                name="quantity"
                type="number"
                min={1}
                step="1"
                defaultValue={1}
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
            </div>
            <input
              name="itemDescription"
              required
              placeholder="Description de ligne"
              className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                name="subtotal"
                type="number"
                min={0}
                step="0.01"
                placeholder="Sous-total"
                required
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <input
                name="taxAmount"
                type="number"
                min={0}
                step="0.01"
                defaultValue={0}
                placeholder="Taxes"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <input
                name="paidAmount"
                type="number"
                min={0}
                step="0.01"
                defaultValue={0}
                placeholder="Encaisse"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="issuedAt"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <input
                name="dueAt"
                type="date"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
            </div>
            <textarea
              name="notes"
              rows={3}
              placeholder="Notes"
              className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
            />
            <SubmitButton
              idleLabel="Creer la facture"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle icon={FileText} title="Factures" description="Projet, entreprise, encours." />
          <div className="space-y-4">
            {invoices.length ? (
              invoices.map((invoice) => (
                <article
                  key={invoice.id}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
                        <StatusBadge value={invoice.status} />
                      </div>
                      <p className="text-sm text-slate-400">
                        {invoice.companyName || "Sans entreprise"} | {invoice.projectName || "Sans projet"}
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
                        className="w-28 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-brand-500"
                      />
                      <select
                        name="status"
                        defaultValue={invoice.status}
                        className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-brand-500"
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
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </form>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Total</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Encaisse</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatCurrency(invoice.paidAmount, invoice.currency)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Reste</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatCurrency(invoice.outstanding, invoice.currency)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Echeance</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatDate(invoice.dueAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune facture"
                description="La facturation apparait ici des qu'elle est liee a un projet."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

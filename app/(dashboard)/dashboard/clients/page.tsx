import { createClientAction } from "@/app/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getClientsPageData } from "@/lib/data/mvp";

export default async function ClientsPage() {
  const { clients } = await getClientsPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Clients"
        title="Relations commerciales"
        description="Centralise les prospects, clients actifs et notes de suivi."
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Panel>
          <SectionTitle
            title="Nouveau client"
            description="Garde une trace propre de chaque contact et du statut commercial."
          />
          <form action={createClientAction} className="space-y-4">
            <input
              name="name"
              required
              placeholder="Nom"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="company"
                placeholder="Societe"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <select
                name="status"
                defaultValue="prospect"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="prospect">Prospect</option>
                <option value="contacted">Contacted</option>
                <option value="negotiating">Negotiating</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="phone"
                placeholder="Telephone"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="website"
                placeholder="Site web"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="source"
                placeholder="Source"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <textarea
              name="notes"
              rows={4}
              placeholder="Notes"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <SubmitButton
              idleLabel="Ajouter le client"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Base clients"
            description="Un point d'entree simple pour retrouver informations et contexte."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {clients.length ? (
              clients.map((client) => (
                <article key={client.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {client.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        {client.company || "Sans societe"}
                      </p>
                    </div>
                    <StatusBadge value={client.status} />
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <p>{client.email || "Pas d'email"}</p>
                    <p>{client.phone || "Pas de telephone"}</p>
                    <p>{client.website || "Pas de site web"}</p>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">
                    {client.notes || "Aucune note."}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucun client"
                description="Ajoute un premier contact pour structurer ton suivi commercial."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

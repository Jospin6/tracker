import { createActivityAction } from "@/app/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getActivitiesPageData } from "@/lib/data/mvp";
import { formatDate } from "@/lib/utils/format";

export default async function ActivitiesPage() {
  const { activities } = await getActivitiesPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Activites"
        title="Cadre de travail"
        description="Cree des activites pour regrouper tes projets, objectifs et contenus."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
        <Panel>
          <SectionTitle
            title="Nouvelle activite"
            description="Une activite peut representer une offre, un client, un canal ou un axe de travail."
          />
          <form action={createActivityAction} className="space-y-4">
            <input
              name="name"
              required
              placeholder="Nom de l'activite"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <input
              name="category"
              placeholder="Categorie"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="status"
                defaultValue="active"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <input
                name="color"
                placeholder="#2563eb"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="startDate"
                type="date"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="targetDate"
                type="date"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <textarea
              name="description"
              rows={4}
              placeholder="Description"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <SubmitButton
              idleLabel="Ajouter l'activite"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Activites du workspace"
            description="Chaque activite peut ensuite porter plusieurs projets et objectifs."
          />
          <div className="space-y-4">
            {activities.length ? (
              activities.map((activity) => (
                <article key={activity.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {activity.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        {activity.category || "Sans categorie"}
                      </p>
                    </div>
                    <StatusBadge value={activity.status} />
                  </div>
                  <p className="mt-4 text-sm text-slate-300">
                    {activity.description || "Aucune description."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <span>Demarrage: {formatDate(activity.startDate)}</span>
                    <span>Cible: {formatDate(activity.targetDate)}</span>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune activite"
                description="Ajoute une activite pour commencer a structurer ton pilotage."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

import {
  createProjectAction,
  updateProjectProgressAction,
} from "@/app/actions";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getProjectsPageData } from "@/lib/data/mvp";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";

export default async function ProjectsPage() {
  const { activities, clients, projects } = await getProjectsPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Projets"
        title="Execution et rentabilite"
        description="Suis l'avancement, le budget et le contexte client de chaque projet."
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Panel>
          <SectionTitle
            title="Nouveau projet"
            description="Rattache si besoin le projet a une activite ou a un client."
          />
          <form action={createProjectAction} className="space-y-4">
            <input
              name="name"
              required
              placeholder="Nom du projet"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <textarea
              name="description"
              rows={4}
              placeholder="Description"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
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
                name="activityId"
                defaultValue=""
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Sans activite</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="status"
                defaultValue="planned"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="idea">Idea</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In progress</option>
                <option value="paused">Paused</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                name="priority"
                defaultValue="medium"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="startDate"
                type="date"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="dueDate"
                type="date"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={0}
                placeholder="Progression"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="budgetPlanned"
                type="number"
                min={0}
                step="0.01"
                placeholder="Budget prevu"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="budgetUsed"
                type="number"
                min={0}
                step="0.01"
                placeholder="Budget utilise"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <SubmitButton
              idleLabel="Ajouter le projet"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Portefeuille projet"
            description="Mets a jour la progression directement depuis la liste."
          />
          <div className="space-y-4">
            {projects.length ? (
              projects.map((project) => (
                <article key={project.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {project.name}
                        </h3>
                        <StatusBadge value={project.status} />
                      </div>
                      <p className="text-sm text-slate-400">
                        Client: {project.clientName || "Sans client"} | Activite:{" "}
                        {project.activityName || "Sans activite"}
                      </p>
                      <p className="text-sm text-slate-300">
                        {project.description || "Aucune description."}
                      </p>
                    </div>

                    <form action={updateProjectProgressAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="projectId" value={project.id} />
                      <input
                        name="progress"
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={project.progress}
                        className="w-24 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-brand-500"
                      />
                      <select
                        name="status"
                        defaultValue={project.status}
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-brand-500"
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In progress</option>
                        <option value="paused">Paused</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <SubmitButton
                        idleLabel="Maj"
                        pendingLabel="..."
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </form>
                  </div>

                  <div className="mt-5">
                    <ProgressBar
                      value={project.progress}
                      label={`Progression (${formatPercent(project.progress)})`}
                    />
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-900/70 px-4 py-3">
                      Budget prevu: {formatCurrency(project.budgetPlanned)}
                    </div>
                    <div className="rounded-3xl bg-slate-900/70 px-4 py-3">
                      Budget utilise: {formatCurrency(project.budgetUsed)}
                    </div>
                    <div className="rounded-3xl bg-slate-900/70 px-4 py-3">
                      Echeance: {formatDate(project.dueDate)}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucun projet"
                description="Ajoute un projet pour suivre sa progression et sa marge."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

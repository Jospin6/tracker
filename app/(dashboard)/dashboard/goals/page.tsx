import {
  createGoalAction,
  updateGoalProgressAction,
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
import { getGoalsPageData } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils/format";

export default async function GoalsPage() {
  const { activities, goals, projects } = await getGoalsPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Objectifs"
        title="Mesure et progression"
        description="Definis des cibles concretes et mets a jour l'avancee depuis la meme page."
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Panel>
          <SectionTitle
            title="Nouvel objectif"
            description="Associe un objectif a un projet ou a une activite si besoin."
          />
          <form action={createGoalAction} className="space-y-4">
            <input
              name="title"
              required
              placeholder="Titre de l'objectif"
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
                name="goalType"
                defaultValue="quantitative"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="quantitative">Quantitative</option>
                <option value="financial">Financial</option>
                <option value="project">Project</option>
                <option value="content">Content</option>
                <option value="personal">Personal</option>
                <option value="commercial">Commercial</option>
                <option value="administrative">Administrative</option>
                <option value="learning">Learning</option>
              </select>
              <input
                name="unit"
                placeholder="Unite"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <select
                name="activityId"
                required
                defaultValue={activities[0]?.id ?? ""}
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Choisir une activite</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                name="targetValue"
                type="number"
                min={0}
                step="0.01"
                placeholder="Cible"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="currentValue"
                type="number"
                min={0}
                step="0.01"
                placeholder="Actuel"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
              <input
                name="deadline"
                type="date"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <SubmitButton
              idleLabel="Ajouter l'objectif"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Objectifs suivis"
            description="Mets a jour la valeur actuelle au fil des semaines."
          />
          <div className="space-y-4">
            {goals.length ? (
              goals.map((goal) => (
                <article key={goal.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {goal.title}
                        </h3>
                        <StatusBadge value={goal.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Projet: {goal.projectName || "Sans projet"} | Activite:{" "}
                        {goal.activityName || "Sans activite"}
                      </p>
                    </div>

                    <form action={updateGoalProgressAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="goalId" value={goal.id} />
                      <input
                        name="currentValue"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={goal.currentValue}
                        className="w-28 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-brand-500"
                      />
                      <SubmitButton
                        idleLabel="Mettre a jour"
                        pendingLabel="..."
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </form>
                  </div>

                  <p className="mt-4 text-sm text-slate-300">
                    {goal.description || "Aucune description."}
                  </p>

                  <div className="mt-5">
                    <ProgressBar
                      value={goal.progress}
                      label={`${goal.currentValue} / ${goal.targetValue} ${goal.unit || ""}`}
                    />
                  </div>

                  <div className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Echeance: {formatDate(goal.deadline)}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucun objectif"
                description="Ajoute un objectif pour mesurer ton avancee dans le temps."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

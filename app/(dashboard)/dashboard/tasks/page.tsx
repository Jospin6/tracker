import {
  createTaskAction,
  updateTaskStatusAction,
} from "@/app/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getTasksPageData } from "@/lib/data/mvp";
import { formatDate } from "@/lib/utils/format";

export default async function TasksPage() {
  const { activities, goals, projects, tasks } = await getTasksPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Taches"
        title="Execution quotidienne"
        description="Suis tes taches ouvertes, leurs priorites et leurs liens avec tes projets et objectifs."
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Panel>
          <SectionTitle
            title="Nouvelle tache"
            description="Ajoute rapidement une action a executer ou a deleguer."
          />
          <form action={createTaskAction} className="space-y-4">
            <input
              name="title"
              required
              placeholder="Titre de la tache"
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
                name="goalId"
                defaultValue=""
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Sans objectif</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <input
                name="dueDate"
                type="date"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <select
                name="status"
                defaultValue="todo"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="waiting">Waiting</option>
                <option value="done">Done</option>
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
              <input
                name="estimatedMinutes"
                type="number"
                min={0}
                step="5"
                placeholder="Minutes"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <SubmitButton
              idleLabel="Ajouter la tache"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Backlog operationnel"
            description="Mets a jour l'etat d'une tache directement depuis sa carte."
          />
          <div className="space-y-4">
            {tasks.length ? (
              tasks.map((task) => (
                <article key={task.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {task.title}
                        </h3>
                        <StatusBadge value={task.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Projet: {task.projectName || "Sans projet"} | Objectif:{" "}
                        {task.goalName || "Sans objectif"} | Activite:{" "}
                        {task.activityName || "Sans activite"}
                      </p>
                    </div>

                    <form action={updateTaskStatusAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <select
                        name="status"
                        defaultValue={task.status}
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-brand-500"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In progress</option>
                        <option value="waiting">Waiting</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <SubmitButton
                        idleLabel="Maj"
                        pendingLabel="..."
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </form>
                  </div>

                  <p className="mt-4 text-sm text-slate-300">
                    {task.description || "Aucune description."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <span>Priorite: {task.priority}</span>
                    <span>Echeance: {formatDate(task.dueDate)}</span>
                    <span>
                      Estimation: {task.estimatedMinutes ? `${task.estimatedMinutes} min` : "-"}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucune tache"
                description="Ajoute une tache pour organiser ton execution au quotidien."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

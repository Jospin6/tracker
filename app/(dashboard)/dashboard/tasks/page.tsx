import { ListTodo } from "lucide-react";

import { createTaskAction } from "@/app/actions";
import { TaskKanbanBoard } from "@/components/dashboard/task-kanban-board";
import {
  FormField,
  PageIntro,
  Panel,
  SectionTitle,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import { getTasksPageData } from "@/lib/data/dashboard";
import {
  taskPriorityOptions,
  taskStatusMeta,
  taskStatusOrder,
  type TaskStatus,
} from "@/lib/tasks";

export default async function TasksPage() {
  const { goals, projects, tasks } = await getTasksPageData();

  const taskCounts = taskStatusOrder.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status).length;
    return acc;
  }, {} as Record<TaskStatus, number>);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Execution"
        title="Kanban des taches"
        description="Organise le travail par statut et fais glisser les cartes entre les colonnes."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <SectionTitle
            title="Nouvelle tache"
            description="Ajoute rapidement une action a executer ou a deleguer."
          />
          <form action={createTaskAction} className="space-y-4">
            <FormField label="Titre">
              <input
                name="title"
                required
                placeholder="Titre de la tache"
                className={formControlClassName}
              />
            </FormField>

            <FormField label="Description">
              <textarea
                name="description"
                rows={4}
                placeholder="Description"
                className={formTextareaClassName}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Projet">
                <select
                  name="projectId"
                  defaultValue=""
                  className={formSelectClassName}
                >
                  <option value="">Sans projet</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Objectif">
                <select
                  name="goalId"
                  defaultValue=""
                  className={formSelectClassName}
                >
                  <option value="">Sans objectif</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Echeance">
                <input name="dueDate" type="date" className={formControlClassName} />
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

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Statut">
                <select name="status" defaultValue="todo" className={formSelectClassName}>
                  {taskStatusOrder.map((status) => (
                    <option key={status} value={status}>
                      {taskStatusMeta[status].label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Priorite">
                <select
                  name="priority"
                  defaultValue="medium"
                  className={formSelectClassName}
                >
                  {taskPriorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Estimation">
                <input
                  name="estimatedMinutes"
                  type="number"
                  min={0}
                  step="5"
                  placeholder="Minutes"
                  className={formControlClassName}
                />
              </FormField>
            </div>

            <div className="flex justify-end">
              <SubmitButton idleLabel="Ajouter la tache" className={primaryButtonClassName} />
            </div>
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            icon={ListTodo}
            title="Vue d'ensemble"
            description="Chaque colonne represente un etat du flux de travail."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {taskStatusOrder.map((status) => {
              const meta = taskStatusMeta[status];

              return (
                <article
                  key={status}
                  className="rounded-2xl border border-white/8 bg-black/60 p-4"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                    {meta.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-3xl font-semibold tracking-[-0.03em] text-white">
                      {taskCounts[status]}
                    </p>
                    <span className={`inline-flex rounded-full border border-white/8 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.ring}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-500">{meta.description}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Glisse une carte vers une autre colonne pour changer son statut sans quitter la
            page.
          </p>
        </Panel>
      </section>

      <Panel>
        <SectionTitle
          icon={ListTodo}
          title="Tableau Kanban"
          description="Prends une carte et depose-la dans la colonne qui correspond a son etat."
        />
        <TaskKanbanBoard tasks={tasks} />
      </Panel>
    </div>
  );
}

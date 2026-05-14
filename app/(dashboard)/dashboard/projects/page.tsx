import Link from "next/link";
import {
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  ListTodo,
  UsersRound,
} from "lucide-react";

import {
  createProjectAction,
  updateProjectProgressAction,
} from "@/app/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  MetricCard,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getProjectsPageData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";

export default async function ProjectsPage() {
  const { activities, clients, projects } = await getProjectsPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Projets"
        title="Portefeuille projet"
        description="Chaque projet doit exister dans une activite, avec ses clients, ses taches et son argent."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          label="Projets"
          value={String(projects.length)}
          hint={`${projects.filter((project) => !project.activityId).length} hors activite`}
        />
        <MetricCard
          icon={<UsersRound className="h-5 w-5" />}
          label="Clients lies"
          value={String(projects.reduce((total, project) => total + project.clientCount, 0))}
          hint="Liens directs et projet"
        />
        <MetricCard
          icon={<BadgeDollarSign className="h-5 w-5" />}
          label="Balance"
          value={formatCurrency(projects.reduce((total, project) => total + project.balance, 0))}
          hint="Tous projets confondus"
        />
        <MetricCard
          icon={<ListTodo className="h-5 w-5" />}
          label="Execution"
          value={String(projects.reduce((total, project) => total + project.openTasks, 0))}
          hint="Taches encore ouvertes"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Panel>
          <SectionTitle title="Nouveau projet" description="Toujours rattache a une activite." />
          <form action={createProjectAction} className="space-y-4">
            <input
              name="name"
              required
              placeholder="Nom du projet"
              className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
            />
            <textarea
              name="description"
              rows={4}
              placeholder="Resultat attendu, contexte, promesse"
              className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="activityId"
                defaultValue=""
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              >
                <option value="">Choisir une activite</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.label}
                  </option>
                ))}
              </select>
              <select
                name="clientId"
                defaultValue=""
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              >
                <option value="">Client principal</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="status"
                defaultValue="planned"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
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
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
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
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <input
                name="dueDate"
                type="date"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
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
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <input
                name="budgetPlanned"
                type="number"
                min={0}
                step="0.01"
                placeholder="Budget prevu"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
              <input
                name="budgetUsed"
                type="number"
                min={0}
                step="0.01"
                placeholder="Budget utilise"
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500"
              />
            </div>
            <SubmitButton
              idleLabel="Creer le projet"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle title="Projets" description="Rattachement, marge, execution." />
          <div className="space-y-4">
            {projects.length ? (
              projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <StatusBadge value={project.status} />
                      </div>
                      <p className="text-sm text-slate-400">
                        {project.activityName || "Sans activite"} | {project.clientNames.join(" | ") || "Sans client"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <form action={updateProjectProgressAction} className="flex items-center gap-2">
                        <input type="hidden" name="projectId" value={project.id} />
                        <input
                          name="progress"
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={project.progress}
                          className="w-24 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-brand-500"
                        />
                        <select
                          name="status"
                          defaultValue={project.status}
                          className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-brand-500"
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
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </form>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10"
                      >
                        Ouvrir
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Balance</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatCurrency(project.balance)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Budget</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatCurrency(project.budgetUsed)} / {formatCurrency(project.budgetPlanned)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Execution</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {project.openTasks} ouvertes | {project.tasksCount} total
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Tempo</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatPercent(project.progress)} | {formatDate(project.dueDate)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucun projet"
                description="Ne cree plus de projet sans architecture metier claire."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

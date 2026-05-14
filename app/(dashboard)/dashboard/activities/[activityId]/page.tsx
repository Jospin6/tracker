import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  FileText,
  FolderPlus,
  ListTodo,
  UserPlus,
  UsersRound,
} from "lucide-react";

import {
  assignClientRelationshipsAction,
  createProjectAction,
} from "@/app/actions";
import { ResponsiveFormDialog } from "@/components/dashboard/responsive-form-dialog";
import {
  EmptyState,
  FormField,
  MetaStrip,
  MetricCard,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getActivityDetailPageData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";

function ProjectForm({
  activityId,
  clients,
}: {
  activityId: string;
  clients: Array<{ id: string; label: string }>;
}) {
  return (
    <form action={createProjectAction} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId} />

      <FormField label="Nom du projet">
        <input
          name="name"
          required
          placeholder="Refonte, campagne, offre..."
          className={formControlClassName}
        />
      </FormField>

      <FormField label="Description">
        <textarea
          name="description"
          rows={4}
          placeholder="Perimetre, livrables..."
          className={formTextareaClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Statut">
          <select name="status" defaultValue="planned" className={formSelectClassName}>
            <option value="idea">Idea</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="paused">Paused</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </FormField>

        <FormField label="Priorite">
          <select name="priority" defaultValue="medium" className={formSelectClassName}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Client">
          <select name="clientId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Budget prevu">
          <input
            name="budgetPlanned"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date de debut">
          <input name="startDate" type="date" className={formControlClassName} />
        </FormField>

        <FormField label="Echeance">
          <input name="dueDate" type="date" className={formControlClassName} />
        </FormField>
      </div>

      <SubmitButton idleLabel="Creer le projet" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

function ActivityClientLinkForm({
  activityId,
  clients,
  projects,
}: {
  activityId: string;
  clients: Array<{ id: string; label: string }>;
  projects: Array<{ id: string; label: string }>;
}) {
  return (
    <form action={assignClientRelationshipsAction} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId} />

      <FormField label="Client">
        <select name="clientId" required defaultValue="" className={formSelectClassName}>
          <option value="">Choisir un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Projet cible">
        <select name="projectId" defaultValue="" className={formSelectClassName}>
          <option value="">Activite uniquement</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.label}
            </option>
          ))}
        </select>
      </FormField>

      <SubmitButton idleLabel="Associer" className={`w-full ${secondaryButtonClassName}`} />
    </form>
  );
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  const data = await getActivityDetailPageData(activityId);

  if (!data) {
    notFound();
  }

  const { activity, clients, projects } = data;

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Activite"
        title={activity.name}
        description={activity.description || activity.category || "Portefeuille de projets."}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          label="Projets"
          value={String(activity.projectsCount)}
          hint={`${activity.activeProjects} actifs`}
        />
        <MetricCard
          icon={<UsersRound className="h-5 w-5" />}
          label="Clients"
          value={String(activity.clientCount)}
          hint={activity.clients.slice(0, 2).map((client) => client.name).join(" | ") || "-"}
        />
        <MetricCard
          icon={<BadgeDollarSign className="h-5 w-5" />}
          label="Balance"
          value={formatCurrency(activity.balance)}
          hint={`${formatCurrency(activity.income)} revenus`}
        />
        <MetricCard
          icon={<FileText className="h-5 w-5" />}
          label="Encours"
          value={formatCurrency(activity.outstanding)}
          hint={`${activity.invoicesCount} facture(s)`}
        />
      </section>

      <MetaStrip
        items={[
          { label: "Statut", value: activity.status.replaceAll("_", " ") },
          { label: "Demarrage", value: formatDate(activity.startDate) },
          { label: "Cible", value: formatDate(activity.targetDate) },
          { label: "Objectifs", value: `${activity.goalsCount} | ${formatPercent(activity.goalAverageProgress)}` },
        ]}
      />

      <div className="space-y-4 md:flex md:flex-wrap md:gap-3 md:space-y-0">
        <Link href="/dashboard/activities" className={secondaryButtonClassName}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>

        <ResponsiveFormDialog
          title="Nouveau projet"
          description="Le projet herite cette activite."
          triggerLabel="Nouveau projet"
          triggerClassName={primaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={FolderPlus} title="Nouveau projet" description="Le projet herite cette activite." />
              <ProjectForm activityId={activity.id} clients={clients} />
            </Panel>
          }
        >
          <ProjectForm activityId={activity.id} clients={clients} />
        </ResponsiveFormDialog>

        <ResponsiveFormDialog
          title="Associer un client"
          description="Lien direct avec l'activite ou un projet."
          triggerLabel="Associer un client"
          triggerClassName={secondaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={UserPlus} title="Associer un client" description="Lien direct avec l'activite ou un projet." />
              <ActivityClientLinkForm activityId={activity.id} clients={clients} projects={projects} />
            </Panel>
          }
        >
          <ActivityClientLinkForm activityId={activity.id} clients={clients} projects={projects} />
        </ResponsiveFormDialog>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="max-w-4xl">
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="finance">Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Panel>
            <SectionTitle
              icon={BriefcaseBusiness}
              title="Projets"
              description="Chaque projet porte ses objectifs, taches, finances et factures."
            />
            <div className="space-y-3">
              {activity.projects.length ? (
                activity.projects.map((project) => (
                  <article key={project.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                          <StatusBadge value={project.status} />
                        </div>
                        <p className="text-sm text-zinc-500">
                          {project.clientNames.join(" | ") || "Sans client"}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
                          <span>{project.goalsCount} objectifs</span>
                          <span>{project.tasksCount} taches</span>
                          <span>{project.invoicesCount} factures</span>
                        </div>
                      </div>
                      <Link href={`/dashboard/projects/${project.id}`} className={secondaryButtonClassName}>
                        Ouvrir
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Balance</p>
                        <p className="mt-2 text-sm font-medium text-white">{formatCurrency(project.balance)}</p>
                      </div>
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Budget</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(project.budgetUsed)} / {formatCurrency(project.budgetPlanned)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Progression</p>
                        <p className="mt-2 text-sm font-medium text-white">{formatPercent(project.progress)}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun projet" description="Cree le premier projet de cette activite." />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="clients">
          <Panel>
            <SectionTitle icon={UsersRound} title="Clients" description="Contacts relies." />
            <div className="grid gap-3 md:grid-cols-2">
              {activity.clients.length ? (
                activity.clients.map((client) => (
                  <article key={client.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                        <p className="mt-2 text-sm text-zinc-500">{client.company || "Sans societe"}</p>
                      </div>
                      <StatusBadge value={client.status} />
                    </div>
                    <p className="mt-4 text-sm text-zinc-300">{client.email || "Pas d'email"}</p>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun client" description="Associe un client a cette activite." />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="execution">
          <div className="grid gap-6 xl:grid-cols-2">
            <Panel>
              <SectionTitle icon={ListTodo} title="Taches" description="Execution ouverte." />
              <div className="space-y-3">
                {activity.tasks.length ? (
                  activity.tasks.slice(0, 8).map((task) => (
                    <article key={task.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-white">{task.title}</h3>
                          <p className="mt-2 text-sm text-zinc-500">
                            {task.projectName || "Sans projet"} | {formatDate(task.dueDate)}
                          </p>
                        </div>
                        <StatusBadge value={task.status} />
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState title="Aucune tache" description="Aucune execution ouverte." />
                )}
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={BadgeDollarSign} title="Objectifs" description="Progression globale." />
              <div className="space-y-3">
                {activity.goals.length ? (
                  activity.goals.slice(0, 8).map((goal) => (
                    <article key={goal.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-white">{goal.title}</h3>
                          <p className="mt-2 text-sm text-zinc-500">
                            {goal.projectName || "Sans projet"} | {goal.currentValue} / {goal.targetValue} {goal.unit || ""}
                          </p>
                        </div>
                        <StatusBadge value={goal.status} />
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState title="Aucun objectif" description="Aucun objectif sur cette activite." />
                )}
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="finance">
          <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
            <Panel>
              <SectionTitle icon={BadgeDollarSign} title="Synthese" description="Revenus, depenses, budgets." />
              <div className="grid gap-3">
                <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Revenus</p>
                  <p className="mt-2 text-sm font-medium text-white">{formatCurrency(activity.income)}</p>
                </div>
                <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Depenses</p>
                  <p className="mt-2 text-sm font-medium text-white">{formatCurrency(activity.expense)}</p>
                </div>
                <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Budget</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatCurrency(activity.totalBudgetUsed)} / {formatCurrency(activity.totalBudgetPlanned)}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={FileText} title="Factures" description="Encours du portefeuille." />
              <div className="space-y-3">
                {activity.invoices.length ? (
                  activity.invoices.slice(0, 8).map((invoice) => (
                    <article key={invoice.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-white">{invoice.invoiceNumber}</h3>
                          <p className="mt-2 text-sm text-zinc-500">
                            {invoice.projectName || "Sans projet"} | {invoice.clientName || "Sans client"}
                          </p>
                        </div>
                        <StatusBadge value={invoice.status} />
                      </div>
                      <p className="mt-3 text-sm font-medium text-white">
                        Reste {formatCurrency(invoice.outstanding, invoice.currency)}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState title="Aucune facture" description="Aucun encours sur cette activite." />
                )}
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

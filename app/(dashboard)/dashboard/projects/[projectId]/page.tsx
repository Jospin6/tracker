import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  FileText,
  ListTodo,
  ReceiptText,
  Target,
  TrendingUp,
  UserPlus,
  UsersRound,
} from "lucide-react";

import {
  assignClientRelationshipsAction,
  createGoalAction,
  createInvoiceAction,
  createTaskAction,
  createTransactionAction,
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
import { getProjectDetailPageData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";

function ProjectClientForm({
  activityId,
  clients,
  projectId,
}: {
  activityId: string | null;
  clients: Array<{ id: string; label: string }>;
  projectId: string;
}) {
  return (
    <form action={assignClientRelationshipsAction} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId ?? ""} />
      <input type="hidden" name="projectId" value={projectId} />

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

      <SubmitButton idleLabel="Associer" className={`w-full ${secondaryButtonClassName}`} />
    </form>
  );
}

function GoalForm({
  activityId,
  projectId,
}: {
  activityId: string | null;
  projectId: string;
}) {
  return (
    <form action={createGoalAction} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId ?? ""} />
      <input type="hidden" name="projectId" value={projectId} />

      <FormField label="Titre">
        <input name="title" required placeholder="Objectif du projet" className={formControlClassName} />
      </FormField>

      <FormField label="Description">
        <textarea name="description" rows={4} placeholder="Resultat attendu" className={formTextareaClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Type">
          <select name="goalType" defaultValue="project" className={formSelectClassName}>
            <option value="project">Project</option>
            <option value="financial">Financial</option>
            <option value="quantitative">Quantitative</option>
            <option value="content">Content</option>
            <option value="commercial">Commercial</option>
            <option value="administrative">Administrative</option>
            <option value="learning">Learning</option>
            <option value="personal">Personal</option>
          </select>
        </FormField>

        <FormField label="Unite">
          <input name="unit" placeholder="%, EUR, leads..." className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Valeur actuelle">
          <input name="currentValue" type="number" step="0.01" defaultValue="0" className={formControlClassName} />
        </FormField>

        <FormField label="Valeur cible">
          <input name="targetValue" type="number" step="0.01" defaultValue="100" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date de debut">
          <input name="startDate" type="date" className={formControlClassName} />
        </FormField>

        <FormField label="Deadline">
          <input name="deadline" type="date" className={formControlClassName} />
        </FormField>
      </div>

      <SubmitButton idleLabel="Creer l'objectif" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

function TaskForm({
  activityId,
  goals,
  projectId,
}: {
  activityId: string | null;
  goals: Array<{ id: string; title: string }>;
  projectId: string;
}) {
  return (
    <form action={createTaskAction} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId ?? ""} />
      <input type="hidden" name="projectId" value={projectId} />

      <FormField label="Titre">
        <input name="title" required placeholder="Action a executer" className={formControlClassName} />
      </FormField>

      <FormField label="Description">
        <textarea name="description" rows={4} placeholder="Execution, livrable..." className={formTextareaClassName} />
      </FormField>

      <FormField label="Objectif">
        <select name="goalId" defaultValue="" className={formSelectClassName}>
          <option value="">Sans objectif</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Statut">
          <select name="status" defaultValue="todo" className={formSelectClassName}>
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="waiting">Waiting</option>
            <option value="done">Done</option>
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
        <FormField label="Date planifiee">
          <input name="plannedDate" type="date" className={formControlClassName} />
        </FormField>

        <FormField label="Echeance">
          <input name="dueDate" type="date" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Temps estime (minutes)">
        <input
          name="estimatedMinutes"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          className={formControlClassName}
        />
      </FormField>

      <SubmitButton idleLabel="Creer la tache" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

function FinanceForm({
  activityId,
  clients,
  projectId,
}: {
  activityId: string | null;
  clients: Array<{ id: string; label: string }>;
  projectId: string;
}) {
  return (
    <form action={createTransactionAction} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId ?? ""} />
      <input type="hidden" name="projectId" value={projectId} />

      <FormField label="Libelle">
        <input name="description" placeholder="Paiement, achat..." className={formControlClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Type de flux">
          <select name="type" defaultValue="income" className={formSelectClassName}>
            <option value="income">Revenu</option>
            <option value="expense">Depense</option>
            <option value="investment">Investissement</option>
            <option value="debt">Dette</option>
          </select>
        </FormField>

        <FormField label="Montant">
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0"
            className={formControlClassName}
          />
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

        <FormField label="Devise">
          <input name="currency" defaultValue="EUR" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Categorie">
          <input name="category" placeholder="Production, ads..." className={formControlClassName} />
        </FormField>

        <FormField label="Date">
          <input name="transactionDate" type="date" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Mode de paiement">
        <input name="paymentMethod" placeholder="Virement, carte..." className={formControlClassName} />
      </FormField>

      <FormField label="Notes">
        <textarea name="notes" rows={4} placeholder="Precision utile" className={formTextareaClassName} />
      </FormField>

      <SubmitButton idleLabel="Creer le flux" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

function InvoiceForm({
  activityId,
  clients,
  projectId,
}: {
  activityId: string | null;
  clients: Array<{ id: string; label: string }>;
  projectId: string;
}) {
  return (
    <form action={createInvoiceAction} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId ?? ""} />
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Numero">
          <input name="invoiceNumber" required placeholder="INV-001" className={formControlClassName} />
        </FormField>

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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Emission">
          <input name="issuedAt" type="date" className={formControlClassName} />
        </FormField>

        <FormField label="Echeance">
          <input name="dueAt" type="date" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Sous-total">
          <input name="subtotal" type="number" min="0" step="0.01" required placeholder="0" className={formControlClassName} />
        </FormField>

        <FormField label="Taxe">
          <input name="taxAmount" type="number" min="0" step="0.01" defaultValue="0" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Montant paye">
          <input name="paidAmount" type="number" min="0" step="0.01" defaultValue="0" className={formControlClassName} />
        </FormField>

        <FormField label="Statut">
          <select name="status" defaultValue="draft" className={formSelectClassName}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Description ligne">
          <input name="itemDescription" required placeholder="Prestation principale" className={formControlClassName} />
        </FormField>

        <FormField label="Quantite">
          <input name="quantity" type="number" min="1" step="1" defaultValue="1" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Devise">
        <input name="currency" defaultValue="EUR" className={formControlClassName} />
      </FormField>

      <FormField label="Notes">
        <textarea name="notes" rows={4} placeholder="Notes" className={formTextareaClassName} />
      </FormField>

      <SubmitButton idleLabel="Creer la facture" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const data = await getProjectDetailPageData(projectId);

  if (!data) {
    notFound();
  }

  const { clients, project } = data;
  const backHref = project.activityId
    ? `/dashboard/activities/${project.activityId}`
    : "/dashboard/activities";
  const financeClientOptions = project.clients.length
    ? project.clients.map((client) => ({ id: client.id, label: client.name }))
    : clients;

  return (
    <div className="space-y-8">

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<UsersRound className="h-5 w-5" />}
          label="Clients"
          value={String(project.clientCount)}
          hint={project.clientNames.join(" | ") || "Sans client"}
        />
        <MetricCard
          icon={<BadgeDollarSign className="h-5 w-5" />}
          label="Balance"
          value={formatCurrency(project.balance)}
          hint={`${formatCurrency(project.income)} revenus`}
        />
        <MetricCard
          icon={<ListTodo className="h-5 w-5" />}
          label="Execution"
          value={String(project.openTasks)}
          hint={`${project.tasksCount} taches`}
        />
        <MetricCard
          icon={<FileText className="h-5 w-5" />}
          label="Encours"
          value={formatCurrency(project.outstanding)}
          hint={`${project.invoicesCount} facture(s)`}
        />
      </section>

      <MetaStrip
        items={[
          { label: "Activite", value: project.activityName || "-" },
          { label: "Echeance", value: formatDate(project.dueDate) },
          { label: "Progression", value: formatPercent(project.progress) },
          { label: "Objectifs", value: `${project.goalsCount} | ${formatPercent(project.goalAverageProgress)}` },
        ]}
      />

      <div className="space-y-4 md:flex md:flex-wrap md:gap-3 md:space-y-0">
        <Link href={backHref} className={secondaryButtonClassName}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>

        <ResponsiveFormDialog
          title="Associer un client"
          description="Lien direct avec le projet."
          triggerLabel="Associer un client"
          triggerClassName={secondaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={UserPlus} title="Associer un client" description="Lien direct avec le projet." />
              <ProjectClientForm activityId={project.activityId} clients={clients} projectId={project.id} />
            </Panel>
          }
        >
          <ProjectClientForm activityId={project.activityId} clients={clients} projectId={project.id} />
        </ResponsiveFormDialog>

        <ResponsiveFormDialog
          title="Nouvel objectif"
          description="Cible du projet."
          triggerLabel="Nouvel objectif"
          triggerClassName={primaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={Target} title="Nouvel objectif" description="Cible du projet." />
              <GoalForm activityId={project.activityId} projectId={project.id} />
            </Panel>
          }
        >
          <GoalForm activityId={project.activityId} projectId={project.id} />
        </ResponsiveFormDialog>

        <ResponsiveFormDialog
          title="Nouvelle tache"
          description="Action de realisation."
          triggerLabel="Nouvelle tache"
          triggerClassName={secondaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={ListTodo} title="Nouvelle tache" description="Action de realisation." />
              <TaskForm activityId={project.activityId} goals={project.goals} projectId={project.id} />
            </Panel>
          }
        >
          <TaskForm activityId={project.activityId} goals={project.goals} projectId={project.id} />
        </ResponsiveFormDialog>

        <ResponsiveFormDialog
          title="Nouveau flux"
          description="Revenu ou depense du projet."
          triggerLabel="Nouveau flux"
          triggerClassName={secondaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={TrendingUp} title="Nouveau flux" description="Revenu ou depense du projet." />
              <FinanceForm activityId={project.activityId} clients={financeClientOptions} projectId={project.id} />
            </Panel>
          }
        >
          <FinanceForm activityId={project.activityId} clients={financeClientOptions} projectId={project.id} />
        </ResponsiveFormDialog>

        <ResponsiveFormDialog
          title="Nouvelle facture"
          description="Facture rattachee au projet."
          triggerLabel="Nouvelle facture"
          triggerClassName={secondaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={ReceiptText} title="Nouvelle facture" description="Facture rattachee au projet." />
              <InvoiceForm activityId={project.activityId} clients={financeClientOptions} projectId={project.id} />
            </Panel>
          }
        >
          <InvoiceForm activityId={project.activityId} clients={financeClientOptions} projectId={project.id} />
        </ResponsiveFormDialog>
      </div>

      <Tabs defaultValue="clients">
        <TabsList className="max-w-5xl">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="tasks">Taches</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Panel>
            <SectionTitle icon={UsersRound} title="Clients" description="Equipe client du projet." />
            <div className="space-y-3">
              {project.clients.length ? (
                project.clients.map((client) => (
                  <article key={client.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{client.name}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {client.company || client.email || "Contact"}
                        </p>
                      </div>
                      <StatusBadge value={client.status} />
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun client" description="Associe un client au projet." />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="goals">
          <Panel>
            <SectionTitle icon={Target} title="Objectifs" description="Cibles du projet." />
            <div className="space-y-3">
              {project.goals.length ? (
                project.goals.map((goal) => (
                  <article key={goal.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{goal.title}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {goal.currentValue} / {goal.targetValue} {goal.unit || ""}
                        </p>
                      </div>
                      <StatusBadge value={goal.status} />
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun objectif" description="Ajoute la premiere cible du projet." />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="tasks">
          <Panel>
            <SectionTitle icon={ListTodo} title="Taches" description="Execution du projet." />
            <div className="space-y-3">
              {project.tasks.length ? (
                project.tasks.map((task) => (
                  <article key={task.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{task.title}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {task.goalName || "Sans objectif"} | {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <StatusBadge value={task.status} />
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucune tache" description="Aucune action de realisation." />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="finances">
          <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
            <Panel>
              <SectionTitle icon={BadgeDollarSign} title="Synthese" description="Budget et marge." />
              <div className="grid gap-3">
                <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Budget</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatCurrency(project.budgetUsed)} / {formatCurrency(project.budgetPlanned)}
                  </p>
                </div>
                <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Depenses</p>
                  <p className="mt-2 text-sm font-medium text-white">{formatCurrency(project.expense)}</p>
                </div>
                <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Revenus</p>
                  <p className="mt-2 text-sm font-medium text-white">{formatCurrency(project.income)}</p>
                </div>
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={TrendingUp} title="Flux" description="Operations du projet." />
              <div className="space-y-3">
                {project.transactions.length ? (
                  project.transactions.map((transaction) => (
                    <article key={transaction.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-white">
                            {transaction.description || transaction.category || "Operation"}
                          </h3>
                          <p className="mt-2 text-sm text-zinc-500">
                            {transaction.clientName || "Sans client"} | {formatDate(transaction.transactionDate)}
                          </p>
                        </div>
                        <StatusBadge value={transaction.type} />
                      </div>
                      <p className="mt-3 text-sm font-medium text-white">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState title="Aucun flux" description="Aucune operation financiere." />
                )}
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Panel>
            <SectionTitle icon={FileText} title="Factures" description="Facturation et encaissements." />
            <div className="space-y-3">
              {project.invoices.length ? (
                project.invoices.map((invoice) => (
                  <article key={invoice.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{invoice.invoiceNumber}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {invoice.clientName || "Sans client"} | {formatDate(invoice.dueAt)}
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
                <EmptyState title="Aucune facture" description="Aucune facture rattachee a ce projet." />
              )}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { notFound } from "next/navigation";
import {
  BadgeDollarSign,
  CirclePlus,
  FileText,
  ListTodo,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import {
  createGoalAction,
  createInvoiceAction,
  createTaskAction,
  createTransactionAction,
} from "@/app/actions";
import {
  EmptyState,
  FormField,
  MetaStrip,
  MetricCard,
  Panel,
  SectionTitle,
  StatusBadge,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import { TabActionDialog } from "@/components/dashboard/tab-actions";
import { TaskKanbanBoard } from "@/components/dashboard/task-kanban-board";
import { SubmitButton } from "@/components/shared/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectDetailPageData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";

function GoalForm({ projectId }: { projectId: string }) {
  return (
    <form action={createGoalAction} className="space-y-4">
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
  goals,
  projectId,
}: {
  goals: Array<{ id: string; title: string }>;
  projectId: string;
}) {
  return (
    <form action={createTaskAction} className="space-y-4">
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

function FinanceForm({ projectId }: { projectId: string }) {
  return (
    <form action={createTransactionAction} className="space-y-4">
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

function InvoiceForm({ projectId }: { projectId: string }) {
  return (
    <form action={createInvoiceAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Numero">
          <input name="invoiceNumber" required placeholder="INV-001" className={formControlClassName} />
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

  const { companies, project } = data;

  return (
    <div className="space-y-8">

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<UsersRound className="h-5 w-5" />}
          label="Entreprise"
          value={project.companyName || "Sans entreprise"}
          hint={`${project.contactCount} contact(s)`}
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
          { label: "Entreprise", value: project.companyName || "-" },
          { label: "Contacts", value: project.contactNames.join(" | ") || "-" },
          { label: "Echeance", value: formatDate(project.dueDate) },
          { label: "Progression", value: formatPercent(project.progress) },
          { label: "Objectifs", value: `${project.goalsCount} | ${formatPercent(project.goalAverageProgress)}` },
        ]}
      />

      <Tabs defaultValue="company">
        <TabsList className="max-w-5xl">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="tasks">Taches</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Panel>
            <SectionTitle
              icon={UsersRound}
              title="Entreprise"
              description="Entreprise liée au projet et contacts disponibles."
            />
            <div className="space-y-3">
              {project.company ? (
                <article className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{project.company.name}</h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        {project.company.industry || project.company.email || "Entreprise suivie"}
                      </p>
                    </div>
                    <StatusBadge value={project.company.status} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Contacts
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {project.contactCount}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Projets lies
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {project.companyName ? 1 : 0}
                      </p>
                    </div>
                  </div>
                </article>
              ) : (
                <EmptyState title="Aucune entreprise" description="Associe une entreprise au projet." />
              )}

              {project.companyContacts.length ? (
                <div className="space-y-2">
                  {project.companyContacts.map((contact) => (
                    <article key={contact.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-white">{contact.fullName}</h4>
                          <p className="mt-2 text-sm text-zinc-500">
                            {contact.jobTitle || contact.email || "Contact"}
                          </p>
                        </div>
                        <StatusBadge value={contact.status} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="goals">
          <Panel>
            <SectionTitle
              icon={Target}
              title="Objectifs"
              trailing={
                <TabActionDialog
                  title="Nouvel objectif"
                  description="Cible du projet."
                  triggerAriaLabel="Nouvel objectif"
                  triggerIcon={<CirclePlus className="h-4 w-4" />}
                >
                  <GoalForm projectId={project.id} />
                </TabActionDialog>
              }
            />
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
            <SectionTitle
              icon={ListTodo}
              title="Taches"
              trailing={
                <TabActionDialog
                  title="Nouvelle tache"
                  description="Action de realisation."
                  triggerAriaLabel="Nouvelle tache"
                  triggerIcon={<CirclePlus className="h-4 w-4" />}
                >
                  <TaskForm goals={project.goals} projectId={project.id} />
                </TabActionDialog>
              }
            />
            <TaskKanbanBoard tasks={project.tasks} />
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
              <SectionTitle
                icon={TrendingUp}
                title="Flux"
                trailing={
                <TabActionDialog
                  title="Nouveau flux"
                  description="Revenu ou depense du projet."
                  triggerAriaLabel="Nouveau flux"
                  triggerIcon={<CirclePlus className="h-4 w-4" />}
                >
                    <FinanceForm projectId={project.id} />
                  </TabActionDialog>
                }
              />
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
                            {transaction.companyName || "Sans entreprise"} | {formatDate(transaction.transactionDate)}
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
            <SectionTitle
              icon={FileText}
              title="Factures"
              trailing={
                <TabActionDialog
                  title="Nouvelle facture"
                  description="Facture rattachee au projet."
                  triggerAriaLabel="Nouvelle facture"
                  triggerIcon={<CirclePlus className="h-4 w-4" />}
                >
                  <InvoiceForm projectId={project.id} />
                </TabActionDialog>
              }
            />
            <div className="space-y-3">
              {project.invoices.length ? (
                project.invoices.map((invoice) => (
                  <article key={invoice.id} className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{invoice.invoiceNumber}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {invoice.companyName || "Sans entreprise"} | {formatDate(invoice.dueAt)}
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

import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, BriefcaseBusiness, UsersRound } from "lucide-react";

import { createActivityAction } from "@/app/actions";
import { ResponsiveFormDialog } from "@/components/dashboard/responsive-form-dialog";
import {
  EmptyState,
  FormField,
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
import { getActivitiesPageData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";

function ActivityForm() {
  return (
    <form action={createActivityAction} className="space-y-4">
      <FormField label="Nom de l'activite">
        <input
          name="name"
          required
          placeholder="Studio, consulting, produit..."
          className={formControlClassName}
        />
      </FormField>

      <FormField label="Categorie">
        <input name="category" placeholder="Categorie" className={formControlClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Statut">
          <select name="status" defaultValue="active" className={formSelectClassName}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </FormField>

        <FormField label="Couleur">
          <input name="color" placeholder="#ffffff" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date de debut">
          <input name="startDate" type="date" className={formControlClassName} />
        </FormField>

        <FormField label="Date cible">
          <input name="targetDate" type="date" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Description">
        <textarea
          name="description"
          rows={4}
          placeholder="Perimetre, promesse..."
          className={formTextareaClassName}
        />
      </FormField>

      <SubmitButton idleLabel="Creer l'activite" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

export default async function ActivitiesPage() {
  const { activities } = await getActivitiesPageData();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<BriefcaseBusiness className="h-4 w-4" />}
          label="Activites"
          value={String(activities.length)}
          hint={`${activities.reduce((total, activity) => total + activity.projectsCount, 0)} projets`}
        />
        <MetricCard
          icon={<UsersRound className="h-4 w-4" />}
          label="Clients relies"
          value={String(activities.reduce((total, activity) => total + activity.clientCount, 0))}
          hint="Toutes activites confondues"
        />
        <MetricCard
          icon={<BadgeDollarSign className="h-4 w-4" />}
          label="Balance"
          value={formatCurrency(activities.reduce((total, activity) => total + activity.balance, 0))}
          hint="Vue portefeuille"
        />
      </section>

      <ResponsiveFormDialog
        title="Nouvelle activite"
        description="Point d'entree du travail."
        triggerLabel="Nouvelle activite"
        triggerClassName={primaryButtonClassName}
        mobileContent={
          <Panel>
            <SectionTitle title="Nouvelle activite" description="Point d'entree du travail." />
            <ActivityForm />
          </Panel>
        }
      >
        <ActivityForm />
      </ResponsiveFormDialog>

      <Panel>
        <SectionTitle title="Activites" description="Ouvre une activite pour y creer ses projets." />
        <div className="space-y-3">
          {activities.length ? (
            activities.map((activity) => (
              <article key={activity.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{activity.name}</h3>
                      <StatusBadge value={activity.status} />
                    </div>
                    <p className="text-sm text-zinc-500">
                      {activity.category || "Sans categorie"} | {activity.clientCount} client(s)
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
                      <span>{activity.projectsCount} projets</span>
                      <span>{activity.goalsCount} objectifs</span>
                      <span>{activity.openTasks} taches ouvertes</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/activities/${activity.id}`} className={secondaryButtonClassName}>
                    Ouvrir
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Balance</p>
                    <p className="mt-2 text-sm font-medium text-white">{formatCurrency(activity.balance)}</p>
                  </div>
                  <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Budget</p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {formatCurrency(activity.totalBudgetUsed)} / {formatCurrency(activity.totalBudgetPlanned)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Objectifs</p>
                    <p className="mt-2 text-sm font-medium text-white">{formatPercent(activity.goalAverageProgress)}</p>
                  </div>
                  <div className="rounded-xl bg-black px-4 py-3 ring-1 ring-white/8">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Cible</p>
                    <p className="mt-2 text-sm font-medium text-white">{formatDate(activity.targetDate)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="Aucune activite"
              description="Commence ici."
            />
          )}
        </div>
      </Panel>
    </div>
  );
}

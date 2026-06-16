
import { Building2, Plus } from "lucide-react";

import { createCompanyAction } from "@/app/actions";
import { ResponsiveFormDialog } from "@/components/dashboard/responsive-form-dialog";
import {
  EmptyState,
  FormField,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import { getCompaniesPageData } from "@/lib/data/dashboard";

function CompanyForm({ activities }: { activities: Array<{ id: string; label: string }> }) {
  return (
    <form action={createCompanyAction} className="space-y-4">
      <FormField label="Nom de l'entreprise">
        <input name="name" required placeholder="Nom" className={formControlClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Statut">
          <select name="status" defaultValue="prospect" className={formSelectClassName}>
            <option value="prospect">Prospect</option>
            <option value="contacted">Contacted</option>
            <option value="negotiating">Negotiating</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lost">Lost</option>
          </select>
        </FormField>

        <FormField label="Activité">
          <select name="activityId" defaultValue="" className={formSelectClassName}>
            <option value="">Aucune</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Adresse">
          <input name="address" placeholder="Adresse" className={formControlClassName} />
        </FormField>

        <FormField label="Ville">
          <input name="city" placeholder="Ville" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Pays">
          <input name="country" placeholder="Pays" className={formControlClassName} />
        </FormField>

        <FormField label="Industrie">
          <input name="industry" placeholder="Secteur" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email">
          <input name="email" type="email" placeholder="contact@entreprise.com" className={formControlClassName} />
        </FormField>

        <FormField label="Téléphone">
          <input name="phone" placeholder="Téléphone" className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Site web">
          <input name="website" placeholder="https://" className={formControlClassName} />
        </FormField>

        <FormField label="Source">
          <input name="source" placeholder="Source" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea name="notes" rows={4} placeholder="Notes" className={formTextareaClassName} />
      </FormField>

      <SubmitButton idleLabel="Créer l'entreprise" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

export default async function CompaniesPage() {
  const { activities, companies } = await getCompaniesPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Entreprises"
        title="Gestion des entreprises"
        description="Suivez les entreprises, leurs activités et leurs contacts associés."
      />

      <div className="flex flex-wrap gap-3">
        <ResponsiveFormDialog
          title="Nouvelle entreprise"
          description="Créer une fiche entreprise."
          triggerLabel="Nouvelle entreprise"
          triggerClassName={primaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={Plus} title="Nouvelle entreprise" description="Créer une fiche entreprise." />
              <CompanyForm activities={activities} />
            </Panel>
          }
        >
          <CompanyForm activities={activities} />
        </ResponsiveFormDialog>
      </div>

      <Panel>
        <SectionTitle icon={Building2} title="Entreprises" description="Liste des entreprises suivies." />
        <div className="grid gap-4 md:grid-cols-2">
          {companies.length ? (
            companies.map((company) => (
              <article key={company.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                    <p className="mt-2 text-sm text-zinc-500">{company.industry || "Sans secteur"}</p>
                  </div>
                  <StatusBadge value={company.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-300">
                  <p>{company.legalName || "Pas de raison sociale"}</p>
                  <p>{company.email || "Pas d'email"}</p>
                  <p>{company.phone || "Pas de téléphone"}</p>
                  <p>{company.contactCount} contact(s)</p>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="Aucune entreprise" description="Créez votre première entreprise." />
          )}
        </div>
      </Panel>
    </div>
  );
}
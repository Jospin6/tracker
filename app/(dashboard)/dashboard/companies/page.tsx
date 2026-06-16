
import { Building2, Eye, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createCompanyAction,
  deleteCompanyAction,
  updateCompanyAction,
} from "@/app/actions";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
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
  iconButtonClassName,
  primaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import CompanyEditForm from "@/components/dashboard/company-edit-form";
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
        {companies.length ? (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Nom</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Industrie</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Statut</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Téléphone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Contacts</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-white/5">
                    <td className="px-4 py-4 align-top text-sm text-white">{company.name}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{company.industry || "Sans secteur"}</td>
                    <td className="px-4 py-4 align-top"><StatusBadge value={company.status} /></td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{company.email || "-"}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{company.phone || "-"}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{company.contactCount}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <Drawer direction="right">
                          <DrawerTrigger asChild>
                            <button type="button" className={iconButtonClassName} aria-label="Voir">
                              <Eye className="h-4 w-4" />
                            </button>
                          </DrawerTrigger>
                          <DrawerContent className="max-w-md overflow-y-auto p-4 overflow-x-hidden">
                            <DrawerHeader>
                              <DrawerTitle>Détails de l'entreprise</DrawerTitle>
                              <DrawerDescription>Informations de l'entreprise sélectionnée.</DrawerDescription>
                            </DrawerHeader>
                            <div className="space-y-3 text-sm text-zinc-200">
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Nom</p>
                                <p className="mt-1 text-white">{company.name}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Industrie</p>
                                <p className="mt-1">{company.industry || "Sans secteur"}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Statut</p>
                                <p className="mt-1">{company.status}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Email</p>
                                <p className="mt-1">{company.email || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Téléphone</p>
                                <p className="mt-1">{company.phone || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Contacts</p>
                                <p className="mt-1">{company.contactCount}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Notes</p>
                                <p className="mt-1 text-zinc-400">{company.notes || "Aucune note"}</p>
                              </div>
                            </div>
                            <DrawerClose asChild>
                              <button type="button" className="mt-6 app-button-secondary w-full">
                                Fermer
                              </button>
                            </DrawerClose>
                          </DrawerContent>
                        </Drawer>

                        <Drawer direction="right">
                          <DrawerTrigger asChild>
                            <button type="button" className={iconButtonClassName} aria-label="Éditer">
                              <Pencil className="h-4 w-4" />
                            </button>
                          </DrawerTrigger>
                          <DrawerContent className="max-w-md overflow-y-auto p-4 overflow-x-hidden">
                            <DrawerHeader>
                              <DrawerTitle>Modifier l'entreprise</DrawerTitle>
                            </DrawerHeader>
                            <CompanyEditForm action={updateCompanyAction} company={company} activities={activities} />
                          </DrawerContent>
                        </Drawer>

                        <form action={deleteCompanyAction} className="m-0">
                          <input type="hidden" name="companyId" value={company.id} />
                          <button type="submit" className={iconButtonClassName} aria-label="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Aucune entreprise" description="Créez votre première entreprise." />
        )}
      </Panel>
    </div>
  );
}
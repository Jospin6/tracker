

import { Briefcase, Eye, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createContactAction,
  deleteContactAction,
  updateContactAction,
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
import ContactEditForm from "@/components/dashboard/contact-edit-form";
import { getContactsPageData } from "@/lib/data/dashboard";

function ContactForm({
  activities,
  companies,
}: {
  activities: Array<{ id: string; label: string }>;
  companies: Array<{ id: string; label: string }>;
}) {
  return (
    <form action={createContactAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Prénom">
          <input name="firstName" placeholder="Prénom" className={formControlClassName} />
        </FormField>

        <FormField label="Nom">
          <input name="lastName" placeholder="Nom" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Nom complet">
        <input name="fullName" placeholder="Nom complet" className={formControlClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Entreprise">
          <select name="companyId" defaultValue="" className={formSelectClassName}>
            <option value="">Aucune</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.label}
              </option>
            ))}
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
        <FormField label="Titre">
          <input name="jobTitle" placeholder="Titre du poste" className={formControlClassName} />
        </FormField>

        <FormField label="Département">
          <input name="department" placeholder="Département" className={formControlClassName} />
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
        <FormField label="WhatsApp">
          <input name="whatsapp" placeholder="WhatsApp" className={formControlClassName} />
        </FormField>

        <FormField label="LinkedIn">
          <input name="linkedinUrl" placeholder="URL LinkedIn" className={formControlClassName} />
        </FormField>
      </div>

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

        <FormField label="Source">
          <input name="source" placeholder="Source" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea name="notes" rows={4} placeholder="Notes" className={formTextareaClassName} />
      </FormField>

      <SubmitButton idleLabel="Créer le contact" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

export default async function ContactsPage() {
  const { activities, companies, contacts } = await getContactsPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contacts"
        title="Gestion des contacts"
        description="Suivez les personnes attachées à vos entreprises ou activités."
      />

      <div className="flex flex-wrap gap-3">
        <ResponsiveFormDialog
          title="Nouveau contact"
          description="Créer une fiche contact."
          triggerLabel="Nouveau contact"
          triggerClassName={primaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={Plus} title="Nouveau contact" description="Créer une fiche contact." />
              <ContactForm activities={activities} companies={companies} />
            </Panel>
          }
        >
          <ContactForm activities={activities} companies={companies} />
        </ResponsiveFormDialog>
      </div>

      <Panel>
        <SectionTitle icon={Briefcase} title="Contacts" description="Liste des contacts suivis." />
        {contacts.length ? (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Nom</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Entreprise</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Poste</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Téléphone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-white/5">
                    <td className="px-4 py-4 align-top text-sm text-white">{contact.fullName}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{contact.companyName || "Aucune entreprise"}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{contact.jobTitle || "Pas de poste"}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{contact.email || "-"}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-200">{contact.phone || "-"}</td>
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
                              <DrawerTitle>Détails du contact</DrawerTitle>
                              <DrawerDescription>Informations du contact sélectionné.</DrawerDescription>
                            </DrawerHeader>
                            <div className="space-y-3 text-sm text-zinc-200">
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Nom</p>
                                <p className="mt-1 text-white">{contact.fullName}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Entreprise</p>
                                <p className="mt-1">{contact.companyName || "Aucune entreprise"}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Poste</p>
                                <p className="mt-1">{contact.jobTitle || "Pas de poste"}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Email</p>
                                <p className="mt-1">{contact.email || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Téléphone</p>
                                <p className="mt-1">{contact.phone || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Statut</p>
                                <p className="mt-1">{contact.status}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Notes</p>
                                <p className="mt-1 text-zinc-400">{contact.notes || "Aucune note"}</p>
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
                              <DrawerTitle>Modifier le contact</DrawerTitle>
                            </DrawerHeader>
                            <ContactEditForm action={updateContactAction} contact={contact} companies={companies} activities={activities} />
                          </DrawerContent>
                        </Drawer>

                        <form action={deleteContactAction} className="m-0">
                          <input type="hidden" name="contactId" value={contact.id} />
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
          <EmptyState title="Aucun contact" description="Créez votre premier contact." />
        )}
      </Panel>
    </div>
  );
}



import { Briefcase, Plus } from "lucide-react";

import { createContactAction } from "@/app/actions";
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
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.length ? (
            contacts.map((contact) => (
              <article key={contact.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{contact.fullName}</h3>
                    <p className="mt-2 text-sm text-zinc-500">{contact.jobTitle || "Pas de poste"}</p>
                  </div>
                  <StatusBadge value={contact.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-300">
                  <p>{contact.companyName || "Aucune entreprise"}</p>
                  <p>{contact.email || "Pas d'email"}</p>
                  <p>{contact.phone || "Pas de téléphone"}</p>
                  <p>{contact.linkedinUrl || "Pas de LinkedIn"}</p>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="Aucun contact" description="Créez votre premier contact." />
          )}
        </div>
      </Panel>
    </div>
  );
}

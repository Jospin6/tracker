import { Link2, Plus, UsersRound } from "lucide-react";

import {
  assignClientRelationshipsAction,
  createClientAction,
} from "@/app/actions";
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
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClientsPageData } from "@/lib/data/dashboard";

function ClientForm() {
  return (
    <form action={createClientAction} className="space-y-4">
      <FormField label="Nom">
        <input name="name" required placeholder="Nom du client" className={formControlClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Societe">
          <input name="company" placeholder="Societe" className={formControlClassName} />
        </FormField>

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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email">
          <input name="email" type="email" placeholder="contact@client.com" className={formControlClassName} />
        </FormField>

        <FormField label="Telephone">
          <input name="phone" placeholder="+33..." className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Site web">
          <input name="website" placeholder="https://..." className={formControlClassName} />
        </FormField>

        <FormField label="Source">
          <input name="source" placeholder="Inbound, referral..." className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea name="notes" rows={4} placeholder="Notes" className={formTextareaClassName} />
      </FormField>

      <SubmitButton idleLabel="Creer le client" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

function ClientLinkForm({
  activities,
  clients,
  projects,
}: {
  activities: Array<{ id: string; label: string }>;
  clients: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; label: string }>;
}) {
  return (
    <form action={assignClientRelationshipsAction} className="space-y-4">
      <FormField label="Client">
        <select name="clientId" required defaultValue="" className={formSelectClassName}>
          <option value="">Choisir un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Activite">
        <select
          name="activityId"
          required
          defaultValue={activities[0]?.id ?? ""}
          className={formSelectClassName}
        >
          <option value="">Choisir une activite</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.label}
            </option>
          ))}
        </select>
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

      <SubmitButton idleLabel="Associer" className={`w-full ${secondaryButtonClassName}`} />
    </form>
  );
}

export default async function ClientsPage() {
  const { activities, clients, projects } = await getClientsPageData();

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Clients" title="Base client" description="Repertoire et liaisons." />

      <div className="flex flex-wrap gap-3">
        <ResponsiveFormDialog
          title="Nouveau client"
          description="Fiche contact."
          triggerLabel="Nouveau client"
          triggerClassName={primaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={Plus} title="Nouveau client" description="Fiche contact." />
              <ClientForm />
            </Panel>
          }
        >
          <ClientForm />
        </ResponsiveFormDialog>

        <ResponsiveFormDialog
          title="Associer un client"
          description="Activite et projet."
          triggerLabel="Associer un client"
          triggerClassName={secondaryButtonClassName}
          mobileContent={
            <Panel>
              <SectionTitle icon={Link2} title="Associer un client" description="Activite et projet." />
              <ClientLinkForm activities={activities} clients={clients} projects={projects} />
            </Panel>
          }
        >
          <ClientLinkForm activities={activities} clients={clients} projects={projects} />
        </ResponsiveFormDialog>
      </div>

      <Tabs defaultValue="directory">
        <TabsList className="max-w-2xl">
          <TabsTrigger value="directory">Repertoire</TabsTrigger>
          <TabsTrigger value="links">Rattachements</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <Panel>
            <SectionTitle icon={UsersRound} title="Clients" description="Contacts." />
            <div className="grid gap-3 md:grid-cols-2">
              {clients.length ? (
                clients.map((client) => (
                  <article key={client.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {client.company || "Sans societe"}
                        </p>
                      </div>
                      <StatusBadge value={client.status} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-zinc-300">
                      <p>{client.email || "Pas d'email"}</p>
                      <p>{client.phone || "Pas de telephone"}</p>
                      <p>{client.website || "Pas de site"}</p>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun client" description="Cree un premier client." />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="links">
          <Panel>
            <SectionTitle icon={Link2} title="Rattachements" description="Activites et projets." />
            <div className="grid gap-3 md:grid-cols-2">
              {clients.length ? (
                clients.map((client) => (
                  <article key={client.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                    <div className="mt-4 rounded-xl bg-black px-4 py-3 text-sm text-zinc-300 ring-1 ring-white/8">
                      <p>Activites: {client.activityNames.join(" | ") || "-"}</p>
                      <p className="mt-2">Projets: {client.projectNames.join(" | ") || "-"}</p>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun lien" description="Aucun client a rattacher." />
              )}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

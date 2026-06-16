import { Eye, Link2, Plus, Trash2, UsersRound, Pencil } from "lucide-react";

import {
  assignClientRelationshipsAction,
  createClientAction,
  deleteClientAction,
  updateClientAction,
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
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import ClientEditForm from "@/components/dashboard/client-edit-form";
import ClientForm from "@/components/dashboard/client-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClientsPageData } from "@/lib/data/dashboard";



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
  const { activities, clients, projects, contacts, contactsList } = await getClientsPageData();

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
              <ClientForm contacts={contacts} contactsList={contactsList} action={createClientAction} />
            </Panel>
          }
        >
          <ClientForm contacts={contacts} contactsList={contactsList} action={createClientAction} />
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
            {clients.length ? (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                <table className="min-w-full border-collapse text-left">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Nom</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Société</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Statut</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Email</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Téléphone</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Site web</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-white/5">
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-semibold text-white">{client.name}</div>
                          <div className="text-xs text-zinc-500">{client.notes || ""}</div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-zinc-200">{client.company || "Sans societe"}</td>
                        <td className="px-4 py-4 align-top">
                          <StatusBadge value={client.status} />
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-zinc-200">{client.email || "-"}</td>
                        <td className="px-4 py-4 align-top text-sm text-zinc-200">{client.phone || "-"}</td>
                        <td className="px-4 py-4 align-top text-sm text-zinc-200">{client.website || "-"}</td>
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
                                  <DrawerTitle>Détails du client</DrawerTitle>
                                  <DrawerDescription>Informations du client sélectionné.</DrawerDescription>
                                </DrawerHeader>
                                <div className="space-y-3 text-sm text-zinc-200">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Nom</p>
                                    <p className="mt-1 text-white">{client.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Société</p>
                                    <p className="mt-1">{client.company || "Sans société"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Statut</p>
                                    <p className="mt-1">{client.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Email</p>
                                    <p className="mt-1">{client.email || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Téléphone</p>
                                    <p className="mt-1">{client.phone || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Site web</p>
                                    <p className="mt-1">{client.website || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Notes</p>
                                    <p className="mt-1 text-zinc-400">{client.notes || "Aucune note"}</p>
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
                                  <DrawerTitle>Modifier le client</DrawerTitle>
                                </DrawerHeader>
                                <ClientEditForm action={updateClientAction} client={client} />
                              </DrawerContent>
                            </Drawer>

                            <form action={deleteClientAction} className="m-0">
                              <input type="hidden" name="clientId" value={client.id} />
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
              <EmptyState title="Aucun client" description="Cree un premier client." />
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="links">
          <Panel>
            <SectionTitle icon={Link2} title="Rattachements" description="Activites et projets." />
            {clients.length ? (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                <table className="min-w-full border-collapse text-left">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Client</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Activités</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Projets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-white/5">
                        <td className="px-4 py-4 align-top text-sm text-zinc-200">{client.name}</td>
                        <td className="px-4 py-4 align-top text-sm text-zinc-200">{client.activityNames.join(" | ") || "-"}</td>
                        <td className="px-4 py-4 align-top text-sm text-zinc-200">{client.projectNames.join(" | ") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucun lien" description="Aucun client a rattacher." />
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

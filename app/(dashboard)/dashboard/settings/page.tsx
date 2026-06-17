import { BriefcaseBusiness, Building2, LogOut, Pencil, Trash2, UserRound } from "lucide-react";

import {
  createWorkspaceAction,
  deleteWorkspaceAction,
  switchWorkspaceAction,
  updateWorkspaceAction,
} from "@/app/actions";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  FormField,
  PageIntro,
  Panel,
  SectionTitle,
  formSelectClassName,
  primaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkspaceContext } from "@/lib/auth/server";

export default async function SettingsPage() {
  const { activeWorkspace, profile, user, workspaces } = await getWorkspaceContext();
  console.log("workspaces", workspaces);
  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Parametres" title="Profil" description="Compte et workspace." />

      <Tabs defaultValue="profile">
        <TabsList className="max-w-2xl">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="session">Session</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Panel>
            <SectionTitle icon={UserRound} title="Identite" description="Informations du compte." />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Nom</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {profile?.fullName || "Non renseigne"}
                </p>
              </div>
              <div className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Email</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {profile?.email || user.email || "-"}
                </p>
              </div>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="workspace">
          <Panel>
            <SectionTitle
              icon={BriefcaseBusiness}
              title="Workspace actif"
              description="Choisis le workspace actif dans l'ensemble des workspaces de ton compte."
            />
            <form action={switchWorkspaceAction} className="max-w-md space-y-4">
              <FormField label="Workspace">
                <select
                  name="workspaceId"
                  defaultValue={activeWorkspace.id}
                  className={formSelectClassName}
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <SubmitButton
                idleLabel="Changer"
                className={primaryButtonClassName}
              />
            </form>
          </Panel>

          <Panel>
            <SectionTitle
              icon={Building2}
              title="Tous mes workspaces"
              description="Voir et changer n'importe quel workspace utilisateur."
            />
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <article
                  key={workspace.id}
                  className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{workspace.name}</p>
                      <p className="text-sm text-zinc-500">
                        {workspace.type} • {workspace.status}
                      </p>
                    </div>
                    <form action={switchWorkspaceAction} className="inline">
                      <input type="hidden" name="workspaceId" value={workspace.id} />
                      <button
                        type="submit"
                        className={
                          workspace.id === activeWorkspace.id
                            ? "app-button-subtle cursor-default opacity-70"
                            : primaryButtonClassName
                        }
                        disabled={workspace.id === activeWorkspace.id}
                      >
                        {workspace.id === activeWorkspace.id ? "Actif" : "Changer"}
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              icon={Pencil}
              title="Infos du workspace"
              description="Modifier le workspace actif ou en creer un nouveau."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Nom</p>
                <p className="mt-2 text-sm font-medium text-white">{activeWorkspace.name}</p>
              </div>
              <div className="rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Type</p>
                <p className="mt-2 text-sm font-medium text-white">{activeWorkspace.type}</p>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-black px-4 py-4 ring-1 ring-white/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Description</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {activeWorkspace.description ?? "Aucune description"}
                </p>
              </div>
            </div>

            <form action={updateWorkspaceAction} className="mt-6 space-y-4 max-w-2xl">
              <input type="hidden" name="workspaceId" value={activeWorkspace.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nom du workspace">
                  <input
                    name="name"
                    defaultValue={activeWorkspace.name}
                    className={formSelectClassName}
                  />
                </FormField>
                <FormField label="Type">
                  <select
                    name="type"
                    defaultValue={activeWorkspace.type}
                    className={formSelectClassName}
                  >
                    <option value="personal">Personal</option>
                    <option value="team">Team</option>
                    <option value="company">Company</option>
                    <option value="agency">Agency</option>
                  </select>
                </FormField>
              </div>
              <FormField label="Description">
                <textarea
                  name="description"
                  defaultValue={activeWorkspace.description ?? ""}
                  rows={4}
                  className="app-input min-h-32 resize-y"
                />
              </FormField>
              <div className="flex flex-wrap gap-3">
                <SubmitButton idleLabel="Enregistrer" className={primaryButtonClassName} />
                <button
                  type="submit"
                  formAction={deleteWorkspaceAction}
                  className="app-button-subtle text-rose-200 hover:bg-rose-500/10"
                >
                  Supprimer
                </button>
              </div>
            </form>
          </Panel>

          <Panel>
            <SectionTitle
              icon={BriefcaseBusiness}
              title="Creer un workspace"
              description="Ajouter un nouveau workspace et le selectionner immediatement."
            />
            <form action={createWorkspaceAction} className="space-y-4 max-w-2xl">
              <FormField label="Nom du workspace">
                <input name="name" className={formSelectClassName} required />
              </FormField>
              <FormField label="Type">
                <select name="type" defaultValue="personal" className={formSelectClassName}>
                  <option value="personal">Personal</option>
                  <option value="team">Team</option>
                  <option value="company">Company</option>
                  <option value="agency">Agency</option>
                </select>
              </FormField>
              <FormField label="Description">
                <textarea
                  name="description"
                  rows={4}
                  className="app-input min-h-32 resize-y"
                />
              </FormField>
              <SubmitButton idleLabel="Creer workspace" className={primaryButtonClassName} />
            </form>
          </Panel>
        </TabsContent>

        <TabsContent value="session">
          <Panel>
            <SectionTitle
              icon={LogOut}
              title="Session"
              description="Actions de compte."
            />
            <div className="flex flex-wrap gap-3">
              <LogoutButton />
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

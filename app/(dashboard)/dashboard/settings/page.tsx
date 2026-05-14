import { BriefcaseBusiness, LogOut, UserRound } from "lucide-react";

import { switchWorkspaceAction } from "@/app/actions";
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
              description="Le select du header change automatiquement. Tu peux aussi le faire ici."
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

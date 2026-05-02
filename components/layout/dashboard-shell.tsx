import type { ReactNode } from "react";

import { getWorkspaceContext } from "@/lib/auth/server";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";

export default async function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { activeWorkspace, profile, workspaces } = await getWorkspaceContext();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-full">
        <Sidebar
          activeRole={activeWorkspace.role}
          workspaceName={activeWorkspace.name}
        />
        <div className="flex-1 border-l border-white/10 bg-slate-950/95">
          <Header
            activeWorkspaceId={activeWorkspace.id}
            profileName={profile?.fullName || profile?.email || "Utilisateur"}
            workspaceName={activeWorkspace.name}
            workspaces={workspaces.map((workspace) => ({
              id: workspace.id,
              name: workspace.name,
            }))}
          />
          <main className="min-h-[calc(100vh-80px)] p-6 sm:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

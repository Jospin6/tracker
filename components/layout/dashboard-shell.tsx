import type { ReactNode } from "react";

import { getWorkspaceContext } from "@/lib/auth/server";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";

export default async function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { activeWorkspace, workspaces } = await getWorkspaceContext();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto min-h-screen max-w-[1600px] px-3 py-3 lg:px-4 lg:py-4 lg:pl-[20rem]">
        <Sidebar />
        <div className="app-panel min-h-[calc(100vh-2rem)] overflow-hidden">
          <Header
            activeWorkspaceId={activeWorkspace.id}
            workspaces={workspaces.map((workspace) => ({
              id: workspace.id,
              name: workspace.name,
            }))}
          />
          <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 xl:p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}

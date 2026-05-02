import type { Workspace } from "@/db/types";

export const workspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await fetch("/api/workspaces");
    return response.json();
  },
  switchWorkspace: async (workspaceId: string): Promise<void> => {
    await fetch(`/api/workspaces/${workspaceId}/switch`, { method: "POST" });
  },
  createWorkspace: async (workspace: Partial<Workspace>) => {
    return fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workspace),
    });
  },
};

import { create } from "zustand";
import type { Workspace } from "@/db/types";

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setActiveWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,
  workspaces: [],
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));

import type { Workspace } from "@/db/types";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelect: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId, onSelect }: WorkspaceSwitcherProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-white">Workspaces</h3>
      <div className="mt-4 space-y-3">
        {workspaces.map((workspace) => (
          <button
            type="button"
            key={workspace.id}
            onClick={() => onSelect(workspace.id)}
            className={`w-full rounded-3xl px-4 py-3 text-left text-sm transition ${
              activeWorkspaceId === workspace.id
                ? "bg-brand-500/15 text-white"
                : "border border-white/5 bg-slate-950 text-slate-300 hover:bg-slate-900"
            }`}
          >
            <span className="block font-medium">{workspace.name}</span>
            <span className="text-xs text-slate-500">{workspace.slug}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

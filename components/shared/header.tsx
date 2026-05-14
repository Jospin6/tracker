import { WorkspaceSelect } from "@/components/shared/workspace-select";

export default function Header({
  activeWorkspaceId,
  workspaces,
}: {
  activeWorkspaceId: string;
  workspaces: Array<{ id: string; name: string }>;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-black px-4 py-4 sm:px-6 xl:px-7">
      <div className="flex justify-end">
        <div className="w-full max-w-xs">
          <WorkspaceSelect
            activeWorkspaceId={activeWorkspaceId}
            workspaces={workspaces}
          />
        </div>
      </div>
    </header>
  );
}

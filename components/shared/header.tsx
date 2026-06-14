import { WorkspaceSelect } from "@/components/shared/workspace-select";
import { ActivitySelect } from "@/components/shared/activity-select";

export default function Header({
  activeActivityId,
  activeWorkspaceId,
  activities,
  workspaces,
}: {
  activeActivityId: string | null;
  activeWorkspaceId: string;
  activities: Array<{ id: string; name: string }>;
  workspaces: Array<{ id: string; name: string }>;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/6 bg-transparent px-4 py-4 backdrop-blur-sm sm:px-6 xl:px-7">
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-3">
          <WorkspaceSelect
            activeWorkspaceId={activeWorkspaceId}
            workspaces={workspaces}
          />
          <ActivitySelect
            activeActivityId={activeActivityId}
            activities={activities}
          />
        </div>
      </div>
    </header>
  );
}

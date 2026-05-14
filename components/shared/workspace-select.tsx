"use client";

import { switchWorkspaceAction } from "@/app/actions";
import { formSelectClassName } from "@/components/dashboard/ui";

export function WorkspaceSelect({
  activeWorkspaceId,
  workspaces,
}: {
  activeWorkspaceId: string;
  workspaces: Array<{ id: string; name: string }>;
}) {
  return (
    <form action={switchWorkspaceAction}>
      <label className="sr-only" htmlFor="workspaceId">
        Workspace
      </label>
      <select
        id="workspaceId"
        name="workspaceId"
        defaultValue={activeWorkspaceId}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={formSelectClassName}
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
    </form>
  );
}

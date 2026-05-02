import { switchWorkspaceAction } from "@/app/actions";
import { LogoutButton } from "@/components/auth/logout-button";
import { SubmitButton } from "@/components/shared/submit-button";

export default function Header({
  activeWorkspaceId,
  profileName,
  workspaceName,
  workspaces,
}: {
  activeWorkspaceId: string;
  profileName: string;
  workspaceName: string;
  workspaces: Array<{ id: string; name: string }>;
}) {
  return (
    <header className="border-b border-white/10 bg-slate-950/95 px-6 py-4 backdrop-blur xl:px-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Workspace actif
          </p>
          <h1 className="text-xl font-semibold text-white">{workspaceName}</h1>
          <p className="mt-1 text-sm text-slate-400">{profileName}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form action={switchWorkspaceAction} className="flex items-center gap-2">
            <select
              name="workspaceId"
              defaultValue={activeWorkspaceId}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            <SubmitButton
              idleLabel="Changer"
              pendingLabel="..."
              className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

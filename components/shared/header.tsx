"use client";

import Link from "next/link";
import { Building2, ChevronDown, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { WorkspaceSelect } from "@/components/shared/workspace-select";

export default function Header({
  activeWorkspaceId,
  workspaces,
}: {
  activeWorkspaceId: string;
  workspaces: Array<{ id: string; name: string }>;
}) {
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );

  return (
    <header className="sticky top-0 z-20 border-b border-white/6 bg-transparent px-4 py-4 backdrop-blur-sm sm:px-6 xl:px-7">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Building2 className="h-4 w-4" />

              <span className="max-w-45 truncate">
                {activeWorkspace?.name ?? "Workspace"}
              </span>

              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={10}
            className="w-80 border-white/10 bg-neutral-950/95 p-3 text-white shadow-xl backdrop-blur-xl"
          >
            <DropdownMenuLabel className="px-1 text-xs text-white/50">
              Contexte actif
            </DropdownMenuLabel>

            <div className="space-y-3 px-1 py-2">
              <WorkspaceSelect
                activeWorkspaceId={activeWorkspaceId}
                workspaces={workspaces}
              />
            </div>

            <DropdownMenuSeparator className="my-3 bg-white/10" />

            <div className="space-y-1 px-1 pt-2">
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/companies"
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Building2 className="h-4 w-4" />
                  Entreprises
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Parametres
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

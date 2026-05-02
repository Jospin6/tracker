import "server-only";

import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { profiles, workspaceMembers, workspaces } from "@/db/schema";
import { readAuthCookies, WORKSPACE_COOKIE_NAME } from "@/lib/auth/cookies";
import { createServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/strings";

export type WorkspaceListItem = {
  description: string | null;
  id: string;
  logoUrl: string | null;
  name: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  slug: string;
  status: "active" | "invited" | "suspended" | "removed";
  type: "personal" | "team" | "company" | "agency";
};

async function resolveCurrentUser() {
  const cookieStore = await cookies();
  const { accessToken } = readAuthCookies(cookieStore);

  if (!accessToken) {
    return null;
  }

  const supabase = createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}

export const getCurrentUserOrNull = cache(resolveCurrentUser);

export async function requireCurrentUser() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export const getWorkspaceContext = cache(async () => {
  const [user, cookieStore] = await Promise.all([
    requireCurrentUser(),
    cookies(),
  ]);

  const [profile, membershipRows] = await Promise.all([
    db
      .select({
        avatarUrl: profiles.avatarUrl,
        email: profiles.email,
        firstName: profiles.firstName,
        fullName: profiles.fullName,
        id: profiles.id,
        lastName: profiles.lastName,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    db
      .select({
        description: workspaces.description,
        id: workspaces.id,
        logoUrl: workspaces.logoUrl,
        name: workspaces.name,
        role: workspaceMembers.role,
        slug: workspaces.slug,
        status: workspaceMembers.status,
        type: workspaces.type,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(
        and(
          eq(workspaceMembers.userId, user.id),
          eq(workspaceMembers.status, "active")
        )
      ),
  ]);

  let memberships = membershipRows;

  if (!memberships.length) {
    const workspaceName = profile?.firstName
      ? `${profile.firstName} workspace`
      : "Mon workspace";

    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: workspaceName,
        ownerId: user.id,
        slug: `${slugify(workspaceName) || "workspace"}-${Date.now()}`,
        type: "personal",
      })
      .returning();

    if (workspace) {
      await db.insert(workspaceMembers).values({
        role: "owner",
        status: "active",
        userId: user.id,
        workspaceId: workspace.id,
      });

      memberships = [
        {
          description: workspace.description,
          id: workspace.id,
          logoUrl: workspace.logoUrl,
          name: workspace.name,
          role: "owner",
          slug: workspace.slug,
          status: "active",
          type: workspace.type,
        },
      ];
    }
  }

  if (!memberships.length) {
    redirect("/");
  }

  const preferredWorkspaceId =
    cookieStore.get(WORKSPACE_COOKIE_NAME)?.value ?? null;

  const activeWorkspace =
    memberships.find((workspace) => workspace.id === preferredWorkspaceId) ??
    memberships[0];

  return {
    activeWorkspace,
    profile,
    user,
    workspaces: memberships as WorkspaceListItem[],
  };
});

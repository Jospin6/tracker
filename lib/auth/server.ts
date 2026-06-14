import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { activities, profiles, workspaceMembers, workspaces } from "@/db/schema";
import {
  ACTIVITY_COOKIE_NAME,
  clearAuthCookies,
  clearWorkspaceCookie,
  readAuthCookies,
  setAuthCookies,
  type WritableCookies,
  WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/cookies";
import { resolveSessionFromTokens } from "@/lib/auth/session";
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

export type ActivityContextItem = {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "archived";
};

async function resolveCurrentUser() {
  const cookieStore = await cookies();
  const { accessToken, refreshToken } = readAuthCookies(cookieStore);

  if (!refreshToken) {
    return null;
  }

  const { session, user } = await resolveSessionFromTokens({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (!session || !user) {
    try {
      clearAuthCookies(cookieStore as WritableCookies);
      clearWorkspaceCookie(cookieStore as WritableCookies);
    } catch {}

    return null;
  }

  try {
    setAuthCookies(cookieStore as WritableCookies, session);
  } catch {}

  return user;
}

export const getCurrentUserOrNull = cache(resolveCurrentUser);

export async function requireCurrentUser() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    redirect("/auth/login");
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

  const activityRows = await db
    .select({
      id: activities.id,
      name: activities.name,
      status: activities.status,
    })
    .from(activities)
    .where(eq(activities.workspaceId, activeWorkspace.id))
    .orderBy(desc(activities.updatedAt), desc(activities.createdAt));

  const preferredActivityId =
    cookieStore.get(ACTIVITY_COOKIE_NAME)?.value ?? null;

  const activeActivity =
    activityRows.find((activity) => activity.id === preferredActivityId) ??
    activityRows.find((activity) => activity.status === "active") ??
    activityRows[0] ??
    null;

  return {
    activeWorkspace,
    activeActivity,
    profile,
    activities: activityRows as ActivityContextItem[],
    user,
    workspaces: memberships as WorkspaceListItem[],
  };
});

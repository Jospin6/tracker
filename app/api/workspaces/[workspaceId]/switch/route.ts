import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { clearActivityCookie, setWorkspaceCookie } from "@/lib/auth/cookies";

async function getWorkspaceSwitchDependencies() {
  const [{ db }, { workspaceMembers }, { getCurrentUserOrNull }] =
    await Promise.all([
      import("@/db/client"),
      import("@/db/schema"),
      import("@/lib/auth/server"),
    ]);

  return { db, getCurrentUserOrNull, workspaceMembers };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const { db, getCurrentUserOrNull, workspaceMembers } =
    await getWorkspaceSwitchDependencies();
  const user = await getCurrentUserOrNull();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [membership] = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, user.id),
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.status, "active")
      )
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json(
      { error: "Workspace not available." },
      { status: 404 }
    );
  }

  const cookieStore = await cookies();
  setWorkspaceCookie(cookieStore, workspaceId);
  clearActivityCookie(cookieStore);

  return NextResponse.json({ ok: true });
}

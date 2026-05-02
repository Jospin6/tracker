import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import { workspaceMembers } from "@/db/schema";
import { setWorkspaceCookie } from "@/lib/auth/cookies";
import { getCurrentUserOrNull } from "@/lib/auth/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
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

  return NextResponse.json({ ok: true });
}

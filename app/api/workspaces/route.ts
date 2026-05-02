import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import { workspaceMembers, workspaces } from "@/db/schema";
import { setWorkspaceCookie } from "@/lib/auth/cookies";
import { getCurrentUserOrNull } from "@/lib/auth/server";
import { slugify } from "@/lib/utils/strings";

export async function GET() {
  try {
    const user = await getCurrentUserOrNull();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
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
      .from(workspaces)
      .innerJoin(
        workspaceMembers,
        eq(workspaceMembers.workspaceId, workspaces.id)
      )
      .where(
        and(
          eq(workspaceMembers.userId, user.id),
          eq(workspaceMembers.status, "active")
        )
      );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET_WORKSPACES_ERROR", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserOrNull();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    const name = payload?.name?.toString().trim() ?? "";
    const description = payload?.description?.toString().trim() ?? "";
    const type =
      payload?.type === "team" ||
      payload?.type === "company" ||
      payload?.type === "agency"
        ? payload.type
        : "personal";

    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required." },
        { status: 400 }
      );
    }

    const [workspace] = await db
      .insert(workspaces)
      .values({
        description: description || null,
        name,
        ownerId: user.id,
        slug: `${slugify(name) || "workspace"}-${Date.now()}`,
        type,
      })
      .returning();

    if (!workspace) {
      return NextResponse.json(
        { error: "Unable to create workspace." },
        { status: 500 }
      );
    }

    await db.insert(workspaceMembers).values({
      role: "owner",
      status: "active",
      userId: user.id,
      workspaceId: workspace.id,
    });

    const cookieStore = await cookies();
    setWorkspaceCookie(cookieStore, workspace.id);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("CREATE_WORKSPACE_ERROR", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

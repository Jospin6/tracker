import { NextResponse } from "next/server";

import { getCurrentUserOrNull } from "@/lib/auth/server";
import { publishDueSocialDeliveries } from "@/lib/social/publishing";

function hasCronAccess(request: Request) {
  const expectedSecret = process.env.SOCIAL_POST_WORKER_SECRET ?? "";
  const providedSecret = request.headers.get("x-nurutrack-worker-secret") ?? "";

  return Boolean(expectedSecret && providedSecret && expectedSecret === providedSecret);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserOrNull();
    const authorizedBySecret = hasCronAccess(request);

    if (!user?.id && !authorizedBySecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    const workspaceId =
      typeof payload?.workspaceId === "string" && payload.workspaceId.trim()
        ? payload.workspaceId.trim()
        : undefined;
    const limit =
      typeof payload?.limit === "number" && Number.isFinite(payload.limit)
        ? payload.limit
        : undefined;
    const result = await publishDueSocialDeliveries({ limit, workspaceId });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("SOCIAL_PUBLISH_WORKER_ERROR", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

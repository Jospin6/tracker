import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { profiles, workspaceMembers, workspaces } from "@/db/schema";
import { createAdminClient, createServerClient } from "@/lib/supabase/server";
import { slugify, splitFullName } from "@/lib/utils/strings";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  const email = payload?.email?.toString().trim().toLowerCase() ?? "";
  const password = payload?.password?.toString() ?? "";
  const fullName = payload?.full_name?.toString().trim() ?? "";

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Tous les champs sont obligatoires." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 6 caractères." },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Supabase signUp error:", error);

    const message = error.message?.toLowerCase() ?? "";

    if (
      message.includes("already registered") ||
      message.includes("user already registered") ||
      message.includes("already exists")
    ) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse email." },
        { status: 409 }
      );
    }

    if (
      message.includes("user not allowed") ||
      message.includes("signup is disabled") ||
      message.includes("signups not allowed")
    ) {
      return NextResponse.json(
        {
          error:
            "L'inscription n'est pas autorisée actuellement. Vérifiez la configuration Auth de Supabase.",
        },
        { status: 403 }
      );
    }

    if (message.includes("invalid email")) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    if (message.includes("password")) {
      return NextResponse.json(
        { error: "Mot de passe invalide ou trop faible." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Impossible de créer le compte." },
      { status: error.status ?? 500 }
    );
  }

  if (!data.user) {
    return NextResponse.json(
      { error: "Impossible de créer l'utilisateur." },
      { status: 500 }
    );
  }

  const userId = data.user.id;
  const { firstName, lastName } = splitFullName(fullName);
  const baseSlug = slugify(`${fullName}-workspace`) || "workspace";

  try {
    const result = await db.transaction(async (tx) => {
      const [profile] = await tx
        .insert(profiles)
        .values({
          email,
          firstName: firstName || null,
          fullName,
          lastName: lastName || null,
          userId,
        })
        .returning();

      if (!profile) {
        throw new Error("Impossible de créer le profil utilisateur.");
      }

      const [workspace] = await tx
        .insert(workspaces)
        .values({
          name: `${firstName || "Mon"} workspace`,
          ownerId: userId,
          slug: `${baseSlug}-${Date.now()}`,
          type: "personal",
        })
        .returning();

      if (!workspace) {
        throw new Error("Impossible de créer le workspace.");
      }

      await tx.insert(workspaceMembers).values({
        role: "owner",
        status: "active",
        userId,
        workspaceId: workspace.id,
      });

      return { profile, workspace };
    });

    return NextResponse.json(
      {
        user: data.user,
        workspace: result.workspace,
      },
      { status: 201 }
    );
  } catch (dbError) {
    console.error("Database account finalization error:", dbError);

    try {
      const adminSupabase = createAdminClient();

      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
        userId
      );

      if (deleteError) {
        console.error("Supabase rollback deleteUser error:", deleteError);
      }
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    return NextResponse.json(
      {
        error:
          dbError instanceof Error
            ? dbError.message
            : "Impossible de finaliser la création du compte.",
      },
      { status: 500 }
    );
  }
}

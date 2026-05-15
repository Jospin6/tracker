"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import {
  activities,
  activityClients,
  budgets,
  clients,
  goals,
  invoiceItems,
  invoices,
  projects,
  projectClients,
  socialChannels,
  socialPostDeliveries,
  socialPosts,
  tasks,
  transactions,
} from "@/db/schema";
import {
  clearAuthCookies,
  clearWorkspaceCookie,
  setWorkspaceCookie,
} from "@/lib/auth/cookies";
import { getWorkspaceContext } from "@/lib/auth/server";
import { generateSocialDraft } from "@/lib/social/ai";
import { publishDueSocialDeliveries } from "@/lib/social/publishing";
import {
  createSocialPostDeliveries,
  refreshSocialPostFromDeliveries,
  upsertSocialPostDetail,
} from "@/lib/social/repository";
import {
  normalizeHashtags,
  scoreSocialContent,
  socialAiProviderOptions,
} from "@/lib/social/shared";
import {
  calculateProgress,
  clampPercentage,
  getBoolean,
  getNumber,
  getOptionalDate,
  getOptionalNumber,
  getOptionalString,
  getRequiredString,
  getStringList,
} from "@/lib/utils/forms";

const activityStatuses = ["active", "paused", "completed", "archived"] as const;
const projectStatuses = [
  "idea",
  "planned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "cancelled",
] as const;
const projectPriorities = ["low", "medium", "high", "urgent"] as const;
const goalTypes = [
  "quantitative",
  "financial",
  "project",
  "content",
  "personal",
  "commercial",
  "administrative",
  "learning",
] as const;
const taskStatuses = ["todo", "in_progress", "waiting", "done", "cancelled"] as const;
const taskPriorities = ["low", "medium", "high", "urgent"] as const;
const clientStatuses = [
  "prospect",
  "contacted",
  "negotiating",
  "active",
  "inactive",
  "lost",
] as const;
const transactionTypes = ["income", "expense", "investment", "debt"] as const;
const invoiceStatuses = [
  "draft",
  "sent",
  "paid",
  "partially_paid",
  "overdue",
  "cancelled",
] as const;
const socialPlatforms = [
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "x",
  "other",
] as const;
const socialStatuses = [
  "idea",
  "drafted",
  "approved",
  "scheduled",
  "published",
  "cancelled",
] as const;
const socialChannelProviders = ["manual", "webhook"] as const;
const socialChannelStatuses = [
  "draft",
  "connected",
  "attention",
  "disabled",
] as const;
const socialDeliveryStatuses = [
  "draft",
  "scheduled",
  "processing",
  "published",
  "failed",
  "cancelled",
] as const;

function pickEnum<T extends readonly string[]>(
  values: T,
  rawValue: string,
  fallback: T[number]
) {
  return values.includes(rawValue as T[number])
    ? (rawValue as T[number])
    : fallback;
}

function revalidateDashboardPaths(...paths: string[]) {
  const uniquePaths = new Set(["/dashboard", ...paths]);

  for (const path of uniquePaths) {
    if (!path) {
      continue;
    }

    revalidatePath(path);
  }
}

async function getActionContext() {
  const { activeWorkspace, user } = await getWorkspaceContext();

  return {
    userId: user.id,
    workspaceId: activeWorkspace.id,
    workspaceName: activeWorkspace.name,
  };
}

function getInvoiceStatus(total: number, paidAmount: number, fallback: string) {
  if (paidAmount >= total && total > 0) {
    return "paid";
  }

  if (paidAmount > 0) {
    return "partially_paid";
  }

  return pickEnum(invoiceStatuses, fallback, "draft");
}

function isMissingTableError(error: unknown, tableName: string) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidateErrors = [error, "cause" in error ? error.cause : undefined].filter(Boolean);

  return candidateErrors.some((candidate) => {
    const code =
      candidate && typeof candidate === "object" && "code" in candidate
        ? String(candidate.code)
        : "";
    const message =
      candidate instanceof Error ? candidate.message : String(candidate);

    return code === "42P01" || message.includes(`"${tableName}"`);
  });
}

async function safeInsertProjectClient(values: {
  clientId: string;
  createdBy: string;
  projectId: string;
  workspaceId: string;
}) {
  try {
    await db.insert(projectClients).values(values).onConflictDoNothing();
    return true;
  } catch (error) {
    if (isMissingTableError(error, "project_clients")) {
      return false;
    }

    throw error;
  }
}

async function safeInsertActivityClient(values: {
  activityId: string;
  clientId: string;
  createdBy: string;
  workspaceId: string;
}) {
  try {
    await db.insert(activityClients).values(values).onConflictDoNothing();
    return true;
  } catch (error) {
    if (isMissingTableError(error, "activity_clients")) {
      return false;
    }

    throw error;
  }
}

function getScheduledDateTime(formData: FormData, key = "scheduledAt") {
  const value = getOptionalString(formData, key);
  return value ? new Date(value) : null;
}

function getSocialPostStatus(
  rawStatus: string,
  scheduledAt: Date | null
) {
  const status = pickEnum(socialStatuses, rawStatus, "drafted");

  if (status === "published") {
    return status;
  }

  if (scheduledAt && (status === "drafted" || status === "approved" || status === "idea")) {
    return "scheduled" as const;
  }

  return status;
}

function getSocialDeliveryStatus(
  postStatus: (typeof socialStatuses)[number],
  scheduledAt: Date | null
) {
  if (postStatus === "cancelled") {
    return "cancelled" as const;
  }

  if (postStatus === "published") {
    return "published" as const;
  }

  if (postStatus === "scheduled" || scheduledAt) {
    return "scheduled" as const;
  }

  return "draft" as const;
}

function getSocialTargets(
  formData: FormData,
  fallbackPlatform: (typeof socialPlatforms)[number]
) {
  const platformTargets = getStringList(formData, "platformTargets").map((value) =>
    pickEnum(socialPlatforms, value, fallbackPlatform)
  );

  return Array.from(
    new Set(platformTargets.length ? platformTargets : [fallbackPlatform])
  );
}

async function getProjectName(projectId: string | null) {
  if (!projectId) {
    return null;
  }

  const [project] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project?.name ?? null;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);
  clearWorkspaceCookie(cookieStore);
  revalidatePath("/");
}

export async function switchWorkspaceAction(formData: FormData) {
  const { workspaces } = await getWorkspaceContext();
  const workspaceId = getRequiredString(formData, "workspaceId");
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === workspaceId);

  if (!selectedWorkspace) {
    return;
  }

  const cookieStore = await cookies();
  setWorkspaceCookie(cookieStore, selectedWorkspace.id);
  revalidateDashboardPaths("/dashboard");
}

export async function createActivityAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const name = getRequiredString(formData, "name");

  if (!name) {
    return;
  }

  await db.insert(activities).values({
    category: getOptionalString(formData, "category"),
    color: getOptionalString(formData, "color"),
    createdBy: userId,
    description: getOptionalString(formData, "description"),
    name,
    startDate: getOptionalDate(formData, "startDate"),
    status: pickEnum(
      activityStatuses,
      getRequiredString(formData, "status"),
      "active"
    ),
    targetDate: getOptionalDate(formData, "targetDate"),
    workspaceId,
  });

  revalidateDashboardPaths("/dashboard/activities", "/dashboard/budget");
}

export async function createProjectAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const name = getRequiredString(formData, "name");
  const activityId = getOptionalString(formData, "activityId");
  const clientId = getOptionalString(formData, "clientId");

  if (!name) {
    return;
  }

  const [project] = await db
    .insert(projects)
    .values({
      activityId,
      budgetPlanned: getNumber(formData, "budgetPlanned"),
      budgetUsed: getNumber(formData, "budgetUsed"),
      clientId,
      createdBy: userId,
      description: getOptionalString(formData, "description"),
      dueDate: getOptionalDate(formData, "dueDate"),
      name,
      priority: pickEnum(
        projectPriorities,
        getRequiredString(formData, "priority"),
        "medium"
      ),
      progress: clampPercentage(getNumber(formData, "progress")),
      startDate: getOptionalDate(formData, "startDate"),
      status: pickEnum(
        projectStatuses,
        getRequiredString(formData, "status"),
        "planned"
      ),
      workspaceId,
    })
    .returning({ id: projects.id });

  if (project && clientId) {
    await safeInsertProjectClient({
      clientId,
      createdBy: userId,
      projectId: project.id,
      workspaceId,
    });

    if (activityId) {
      await safeInsertActivityClient({
        activityId,
        clientId,
        createdBy: userId,
        workspaceId,
      });
    }
  }

  revalidateDashboardPaths(
    "/dashboard/activities",
    "/dashboard/budget",
    "/dashboard/projects",
    activityId ? `/dashboard/activities/${activityId}` : ""
  );
}

export async function assignClientRelationshipsAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const clientId = getRequiredString(formData, "clientId");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");

  if (!clientId || (!activityId && !projectId)) {
    return;
  }

  if (activityId) {
    await safeInsertActivityClient({
      activityId,
      clientId,
      createdBy: userId,
      workspaceId,
    });
  }

  if (projectId) {
    const linked = await safeInsertProjectClient({
      clientId,
      createdBy: userId,
      projectId,
      workspaceId,
    });

    if (!linked) {
      await db
        .update(projects)
        .set({
          clientId,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));
    }
  }

  revalidateDashboardPaths(
    "/dashboard/clients",
    activityId ? `/dashboard/activities/${activityId}` : "",
    projectId ? `/dashboard/projects/${projectId}` : ""
  );
}

export async function createGoalAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const title = getRequiredString(formData, "title");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");

  if (!title) {
    return;
  }

  const currentValue = getNumber(formData, "currentValue");
  const targetValue = getNumber(formData, "targetValue");
  const progress = calculateProgress(currentValue, targetValue);

  await db.insert(goals).values({
    activityId,
    createdBy: userId,
    currentValue,
    deadline: getOptionalDate(formData, "deadline"),
    description: getOptionalString(formData, "description"),
    goalType: pickEnum(
      goalTypes,
      getRequiredString(formData, "goalType"),
      "quantitative"
    ),
    progress,
    projectId,
    startDate: getOptionalDate(formData, "startDate"),
    status: progress >= 100 ? "achieved" : "in_progress",
    targetValue,
    title,
    unit: getOptionalString(formData, "unit"),
    workspaceId,
  });

  revalidateDashboardPaths(
    "/dashboard/goals",
    projectId ? `/dashboard/projects/${projectId}` : "",
    activityId ? `/dashboard/activities/${activityId}` : ""
  );
}

export async function updateProjectProgressAction(formData: FormData) {
  const projectId = getRequiredString(formData, "projectId");

  if (!projectId) {
    return;
  }

  await db
    .update(projects)
    .set({
      progress: clampPercentage(getNumber(formData, "progress")),
      status: pickEnum(
        projectStatuses,
        getRequiredString(formData, "status"),
        "in_progress"
      ),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  revalidateDashboardPaths("/dashboard/projects");
}

export async function updateGoalProgressAction(formData: FormData) {
  const goalId = getRequiredString(formData, "goalId");

  if (!goalId) {
    return;
  }

  const [goal] = await db
    .select({ targetValue: goals.targetValue })
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1);

  if (!goal) {
    return;
  }

  const currentValue = getNumber(formData, "currentValue");
  const progress = calculateProgress(currentValue, goal.targetValue);

  await db
    .update(goals)
    .set({
      currentValue,
      progress,
      status: progress >= 100 ? "achieved" : "in_progress",
      updatedAt: new Date(),
    })
    .where(eq(goals.id, goalId));

  revalidateDashboardPaths("/dashboard/goals");
}

export async function createTaskAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const title = getRequiredString(formData, "title");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");

  if (!title) {
    return;
  }

  const status = pickEnum(
    taskStatuses,
    getRequiredString(formData, "status"),
    "todo"
  );

  await db.insert(tasks).values({
    activityId,
    completedAt: status === "done" ? new Date() : null,
    createdBy: userId,
    description: getOptionalString(formData, "description"),
    dueDate: getOptionalDate(formData, "dueDate"),
    estimatedMinutes: getOptionalNumber(formData, "estimatedMinutes"),
    goalId: getOptionalString(formData, "goalId"),
    plannedDate: getOptionalDate(formData, "plannedDate"),
    priority: pickEnum(
      taskPriorities,
      getRequiredString(formData, "priority"),
      "medium"
    ),
    projectId,
    status,
    title,
    workspaceId,
  });

  revalidateDashboardPaths(
    "/dashboard/tasks",
    projectId ? `/dashboard/projects/${projectId}` : "",
    activityId ? `/dashboard/activities/${activityId}` : ""
  );
}

export async function updateTaskStatusAction(formData: FormData) {
  const taskId = getRequiredString(formData, "taskId");
  const status = pickEnum(
    taskStatuses,
    getRequiredString(formData, "status"),
    "todo"
  );

  if (!taskId) {
    return;
  }

  await db
    .update(tasks)
    .set({
      completedAt: status === "done" ? new Date() : null,
      status,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));

  revalidateDashboardPaths("/dashboard/tasks");
}

export async function createClientAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const name = getRequiredString(formData, "name");

  if (!name) {
    return;
  }

  await db.insert(clients).values({
    address: getOptionalString(formData, "address"),
    company: getOptionalString(formData, "company"),
    createdBy: userId,
    email: getOptionalString(formData, "email"),
    name,
    notes: getOptionalString(formData, "notes"),
    phone: getOptionalString(formData, "phone"),
    source: getOptionalString(formData, "source"),
    status: pickEnum(
      clientStatuses,
      getRequiredString(formData, "status"),
      "prospect"
    ),
    website: getOptionalString(formData, "website"),
    workspaceId,
  });

  revalidateDashboardPaths("/dashboard/clients", "/dashboard/budget");
}

export async function createBudgetAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const name = getRequiredString(formData, "name");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");

  if (!name) {
    return;
  }

  await db.insert(budgets).values({
    activityId,
    createdBy: userId,
    name,
    periodEnd: getOptionalDate(formData, "periodEnd"),
    periodStart: getOptionalDate(formData, "periodStart"),
    projectId,
    totalAmount: getNumber(formData, "totalAmount"),
    usedAmount: 0,
    workspaceId,
  });

  revalidateDashboardPaths(
    "/dashboard/budget",
    activityId ? `/dashboard/activities/${activityId}` : "",
    projectId ? `/dashboard/projects/${projectId}` : ""
  );
}

export async function createTransactionAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");

  await db.insert(transactions).values({
    activityId,
    amount: getNumber(formData, "amount"),
    category: getOptionalString(formData, "category"),
    clientId: getOptionalString(formData, "clientId"),
    createdBy: userId,
    currency: getRequiredString(formData, "currency") || "EUR",
    description: getOptionalString(formData, "description"),
    notes: getOptionalString(formData, "notes"),
    paymentMethod: getOptionalString(formData, "paymentMethod"),
    projectId,
    transactionDate:
      getOptionalDate(formData, "transactionDate") ??
      new Date().toISOString().slice(0, 10),
    type: pickEnum(
      transactionTypes,
      getRequiredString(formData, "type"),
      "income"
    ),
    workspaceId,
  });

  revalidateDashboardPaths(
    "/dashboard/budget",
    "/dashboard/finances",
    projectId ? `/dashboard/projects/${projectId}` : "",
    activityId ? `/dashboard/activities/${activityId}` : ""
  );
}

export async function createInvoiceAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const invoiceNumber = getRequiredString(formData, "invoiceNumber");
  const itemDescription = getRequiredString(formData, "itemDescription");
  const quantity = getNumber(formData, "quantity", 1);
  const subtotal = getNumber(formData, "subtotal");
  const taxAmount = getNumber(formData, "taxAmount");
  const paidAmount = getNumber(formData, "paidAmount");
  const total = subtotal + taxAmount;
  const unitPrice = quantity > 0 ? subtotal / quantity : subtotal;

  if (!invoiceNumber || !itemDescription) {
    return;
  }

  await db.transaction(async (tx) => {
    const [invoice] = await tx
      .insert(invoices)
      .values({
        clientId: getOptionalString(formData, "clientId"),
        createdBy: userId,
        currency: getRequiredString(formData, "currency") || "EUR",
        dueAt: getOptionalDate(formData, "dueAt"),
        invoiceNumber,
        issuedAt: getOptionalDate(formData, "issuedAt"),
        notes: getOptionalString(formData, "notes"),
        paidAmount,
        projectId,
        status: getInvoiceStatus(
          total,
          paidAmount,
          getRequiredString(formData, "status")
        ),
        subtotal,
        taxAmount,
        total,
        workspaceId,
      })
      .returning();

    if (!invoice) {
      throw new Error("Unable to create invoice.");
    }

    await tx.insert(invoiceItems).values({
      description: itemDescription,
      invoiceId: invoice.id,
      quantity,
      total: subtotal,
      unitPrice,
    });
  });

  revalidateDashboardPaths(
    "/dashboard/invoices",
    projectId ? `/dashboard/projects/${projectId}` : "",
    activityId ? `/dashboard/activities/${activityId}` : ""
  );
}

export async function updateInvoicePaymentAction(formData: FormData) {
  const invoiceId = getRequiredString(formData, "invoiceId");

  if (!invoiceId) {
    return;
  }

  const [invoice] = await db
    .select({ total: invoices.total })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) {
    return;
  }

  const paidAmount = getNumber(formData, "paidAmount");

  await db
    .update(invoices)
    .set({
      paidAmount,
      status: getInvoiceStatus(
        invoice.total,
        paidAmount,
        getRequiredString(formData, "status")
      ),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  revalidateDashboardPaths("/dashboard/invoices");
}

export async function createSocialChannelAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const name = getRequiredString(formData, "name");

  if (!name) {
    return;
  }

  const provider = pickEnum(
    socialChannelProviders,
    getRequiredString(formData, "provider"),
    "manual"
  );
  const webhookUrl = getOptionalString(formData, "webhookUrl");
  const bearerToken = getOptionalString(formData, "bearerToken");

  try {
    await db.insert(socialChannels).values({
      authConfig: bearerToken ? { bearerToken } : {},
      autoPublish: getBoolean(formData, "autoPublish"),
      createdBy: userId,
      externalAccountId: getOptionalString(formData, "externalAccountId"),
      handle: getOptionalString(formData, "handle"),
      name,
      platform: pickEnum(
        socialPlatforms,
        getRequiredString(formData, "platform"),
        "linkedin"
      ),
      provider,
      status: pickEnum(
        socialChannelStatuses,
        getRequiredString(formData, "status"),
        provider === "webhook" && webhookUrl ? "connected" : "draft"
      ),
      webhookUrl,
      workspaceId,
    });
  } catch (error) {
    if (isMissingTableError(error, "social_channels")) {
      return;
    }

    throw error;
  }

  revalidateDashboardPaths("/dashboard/social-posts");
}

export async function createSocialPostAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const title = getRequiredString(formData, "title");

  if (!title) {
    return;
  }

  const scheduledAt = getScheduledDateTime(formData);
  const primaryPlatform = pickEnum(
    socialPlatforms,
    getRequiredString(formData, "platform"),
    "linkedin"
  );
  const hashtags = normalizeHashtags(getOptionalString(formData, "hashtags"));
  const status = getSocialPostStatus(
    getRequiredString(formData, "status"),
    scheduledAt
  );
  const [post] = await db
    .insert(socialPosts)
    .values({
      activityId: getOptionalString(formData, "activityId"),
      content: getOptionalString(formData, "content"),
      createdBy: userId,
      goalId: getOptionalString(formData, "goalId"),
      hashtags,
      platform: primaryPlatform,
      projectId: getOptionalString(formData, "projectId"),
      publishedAt: status === "published" ? new Date() : null,
      scheduledAt,
      status,
      title,
      workspaceId,
    })
    .returning({ id: socialPosts.id });

  if (!post) {
    return;
  }

  const callToAction = getOptionalString(formData, "callToAction");
  await upsertSocialPostDetail({
    approvalNotes: getOptionalString(formData, "approvalNotes"),
    audience: getOptionalString(formData, "audience"),
    autoPublish: getBoolean(formData, "autoPublish"),
    brief: getOptionalString(formData, "brief"),
    callToAction,
    contentScore: scoreSocialContent({
      callToAction,
      content: getOptionalString(formData, "content"),
      hashtags,
      title,
    }),
    createdBy: userId,
    objective: getOptionalString(formData, "objective"),
    postId: post.id,
    tone: getOptionalString(formData, "tone"),
    workspaceId,
  });

  await createSocialPostDeliveries({
    channelIds: getStringList(formData, "channelIds"),
    createdBy: userId,
    hashtagsOverride: hashtags,
    platforms: getSocialTargets(formData, primaryPlatform),
    postId: post.id,
    scheduledAt,
    status: getSocialDeliveryStatus(status, scheduledAt),
    workspaceId,
  });
  await refreshSocialPostFromDeliveries(post.id);

  revalidateDashboardPaths("/dashboard/social-posts");
}

export async function generateSocialPostAction(formData: FormData) {
  const { userId, workspaceId, workspaceName } = await getActionContext();
  const brief = getRequiredString(formData, "brief");

  if (!brief) {
    return;
  }

  const projectId = getOptionalString(formData, "projectId");
  const scheduledAt = getScheduledDateTime(formData);
  const primaryPlatform = pickEnum(
    socialPlatforms,
    getRequiredString(formData, "platform"),
    "linkedin"
  );
  const objective = getOptionalString(formData, "objective");
  const audience = getOptionalString(formData, "audience");
  const provider = pickEnum(
    socialAiProviderOptions,
    getRequiredString(formData, "provider"),
    "openai"
  );
  const tone = getOptionalString(formData, "tone");
  const draft = await generateSocialDraft({
    audience,
    brief,
    model: getOptionalString(formData, "model"),
    objective,
    platform: primaryPlatform,
    provider,
    projectName: await getProjectName(projectId),
    tone,
    workspaceName,
  });
  const status = getSocialPostStatus(
    getRequiredString(formData, "status"),
    scheduledAt
  );
  const [post] = await db
    .insert(socialPosts)
    .values({
      activityId: getOptionalString(formData, "activityId"),
      content: draft.content,
      createdBy: userId,
      goalId: getOptionalString(formData, "goalId"),
      hashtags: draft.hashtags,
      platform: primaryPlatform,
      projectId,
      publishedAt: status === "published" ? new Date() : null,
      scheduledAt,
      status,
      title: draft.title,
      workspaceId,
    })
    .returning({ id: socialPosts.id });

  if (!post) {
    return;
  }

  await upsertSocialPostDetail({
    aiGeneratedAt: new Date(),
    aiModel: `${draft.provider}:${draft.model}`,
    aiPrompt: draft.prompt,
    approvalNotes: draft.reasoning,
    audience,
    autoPublish: getBoolean(formData, "autoPublish"),
    brief,
    callToAction: draft.callToAction,
    contentScore: draft.score,
    createdBy: userId,
    objective,
    postId: post.id,
    tone,
    workspaceId,
  });

  await createSocialPostDeliveries({
    channelIds: getStringList(formData, "channelIds"),
    createdBy: userId,
    hashtagsOverride: draft.hashtags,
    platforms: getSocialTargets(formData, primaryPlatform),
    postId: post.id,
    scheduledAt,
    status: getSocialDeliveryStatus(status, scheduledAt),
    workspaceId,
  });
  await refreshSocialPostFromDeliveries(post.id);

  revalidateDashboardPaths("/dashboard/social-posts");
}

export async function updateSocialPostAutomationAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const postId = getRequiredString(formData, "postId");

  if (!postId) {
    return;
  }

  const scheduledAt = getScheduledDateTime(formData);
  const status = getSocialPostStatus(
    getRequiredString(formData, "status"),
    scheduledAt
  );

  await db
    .update(socialPosts)
    .set({
      publishedAt: status === "published" ? new Date() : null,
      scheduledAt,
      status,
      updatedAt: new Date(),
    })
    .where(eq(socialPosts.id, postId));

  await upsertSocialPostDetail({
    approvalNotes: getOptionalString(formData, "approvalNotes"),
    autoPublish: getBoolean(formData, "autoPublish"),
    callToAction: getOptionalString(formData, "callToAction"),
    createdBy: userId,
    postId,
    workspaceId,
  });

  try {
    await db
      .update(socialPostDeliveries)
      .set({
        publishedAt: status === "published" ? new Date() : null,
        scheduledAt,
        status: getSocialDeliveryStatus(status, scheduledAt),
        updatedAt: new Date(),
      })
      .where(eq(socialPostDeliveries.postId, postId));
  } catch (error) {
    if (!isMissingTableError(error, "social_post_deliveries")) {
      throw error;
    }
  }

  await refreshSocialPostFromDeliveries(postId);
  revalidateDashboardPaths("/dashboard/social-posts");
}

export async function updateSocialPostMetricsAction(formData: FormData) {
  const postId = getRequiredString(formData, "postId");

  if (!postId) {
    return;
  }

  await db
    .update(socialPosts)
    .set({
      comments: getNumber(formData, "comments"),
      leadsGenerated: getNumber(formData, "leadsGenerated"),
      likes: getNumber(formData, "likes"),
      shares: getNumber(formData, "shares"),
      updatedAt: new Date(),
      views: getNumber(formData, "views"),
    })
    .where(eq(socialPosts.id, postId));

  revalidateDashboardPaths("/dashboard/social-posts");
}

export async function updateSocialDeliveryAction(formData: FormData) {
  const deliveryId = getRequiredString(formData, "deliveryId");

  if (!deliveryId) {
    return;
  }

  const scheduledAt = getScheduledDateTime(formData);

  try {
    const [delivery] = await db
      .update(socialPostDeliveries)
      .set({
        lastError: null,
        publishedAt:
          getRequiredString(formData, "status") === "published" ? new Date() : null,
        scheduledAt,
        status: pickEnum(
          socialDeliveryStatuses,
          getRequiredString(formData, "status"),
          scheduledAt ? "scheduled" : "draft"
        ),
        updatedAt: new Date(),
      })
      .where(eq(socialPostDeliveries.id, deliveryId))
      .returning({ postId: socialPostDeliveries.postId });

    if (delivery?.postId) {
      await refreshSocialPostFromDeliveries(delivery.postId);
    }
  } catch (error) {
    if (isMissingTableError(error, "social_post_deliveries")) {
      return;
    }

    throw error;
  }

  revalidateDashboardPaths("/dashboard/social-posts");
}

export async function runSocialPublishingWorkerAction(formData?: FormData) {
  const { workspaceId } = await getActionContext();
  const limit =
    formData instanceof FormData ? getNumber(formData, "limit", 25) : 25;

  await publishDueSocialDeliveries({
    limit,
    workspaceId,
  });

  revalidateDashboardPaths("/dashboard/social-posts");
}

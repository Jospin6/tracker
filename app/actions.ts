"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import {
  activities,
  activityClients,
  budgets,
  clients,
  companies,
  contacts,
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
  workspaces as workspacesTable,
  workspaceMembers,
} from "@/db/schema";
import {
  clearAuthCookies,
  clearActivityCookie,
  clearWorkspaceCookie,
  setActivityCookie,
  setWorkspaceCookie,
} from "@/lib/auth/cookies";
import { getWorkspaceContext } from "@/lib/auth/server";
import { slugify } from "@/lib/utils/strings";
import { generateSocialDraft } from "@/lib/social/ai";
import { publishDueSocialDeliveries } from "@/lib/social/publishing";
import {
  createSocialPostDeliveries,
  refreshSocialPostFromDeliveries,
  upsertSocialPostDetail,
} from "@/lib/social/repository";
import { taskPriorityOrder, taskStatusOrder } from "@/lib/tasks";
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
const dashboardPaths = [
  "/dashboard",
  "/dashboard/activities",
  "/dashboard/budget",
  "/dashboard/clients",
  "/dashboard/companies",
  "/dashboard/contacts",
  "/dashboard/goals",
  "/dashboard/invoices",
  "/dashboard/projects",
  "/dashboard/settings",
  "/dashboard/social-posts",
  "/dashboard/tasks",
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
  const uniquePaths = new Set([...dashboardPaths, ...paths]);

  for (const path of uniquePaths) {
    if (!path) {
      continue;
    }

    revalidatePath(path);
  }
}

async function getActionContext() {
  const { activeActivity, activities, activeWorkspace, user } =
    await getWorkspaceContext();

  return {
    activeActivity,
    activities,
    userId: user.id,
    workspaceId: activeWorkspace.id,
    workspaceName: activeWorkspace.name,
  };
}

async function getProjectScope(workspaceId: string, projectId: string | null) {
  if (!projectId) {
    return null;
  }
  const [project] = await db
    .select({
      activityId: projects.activityId,
      name: projects.name,
    })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1);

  return project ?? null;
}

async function getCompanyScope(workspaceId: string, companyId: string | null) {
  if (!companyId) {
    return null;
  }

  const [company] = await db
    .select({
      activityId: companies.activityId,
      name: companies.name,
    })
    .from(companies)
    .where(and(eq(companies.id, companyId), eq(companies.workspaceId, workspaceId)))
    .limit(1);

  return company ?? null;
}

function getResolvedActivityId(
  allowedActivityIds: Set<string>,
  ...candidates: Array<string | null | undefined>
) {
  for (const candidate of candidates) {
    const value = candidate?.trim() ?? "";

    if (value && allowedActivityIds.has(value)) {
      return value;
    }
  }

  return null;
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

async function getProjectName(workspaceId: string, projectId: string | null) {
  const project = await getProjectScope(workspaceId, projectId);

  return project?.name ?? null;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);
  clearWorkspaceCookie(cookieStore);
  clearActivityCookie(cookieStore);
  revalidatePath("/");
}

export async function switchWorkspaceAction(formData: FormData) {
  const { workspaces: workspaceList } = await getWorkspaceContext();
  const workspaceId = getRequiredString(formData, "workspaceId");
  const selectedWorkspace = workspaceList.find((workspace) => workspace.id === workspaceId);

  if (!selectedWorkspace) {
    return;
  }

  const cookieStore = await cookies();
  setWorkspaceCookie(cookieStore, selectedWorkspace.id);
  clearActivityCookie(cookieStore);
  revalidateDashboardPaths("/dashboard");
}

export async function createWorkspaceAction(formData: FormData) {
  const { user } = await getWorkspaceContext();
  const name = getRequiredString(formData, "name");
  const description = getOptionalString(formData, "description");
  const type = pickEnum(
    ["personal", "team", "company", "agency"] as const,
    getRequiredString(formData, "type"),
    "personal"
  );

  if (!name) {
    return;
  }

  const [workspace] = await db
    .insert(workspacesTable)
    .values({
      description: description || null,
      name,
      ownerId: user.id,
      slug: `${slugify(name) || "workspace"}-${Date.now()}`,
      type,
    })
    .returning({ id: workspacesTable.id });

  if (workspace?.id) {
    await db.insert(workspaceMembers).values({
      role: "owner",
      status: "active",
      userId: user.id,
      workspaceId: workspace.id,
    });

    const cookieStore = await cookies();
    setWorkspaceCookie(cookieStore, workspace.id);
    clearActivityCookie(cookieStore);
  }

  revalidateDashboardPaths("/dashboard", "/dashboard/settings");
}

export async function updateWorkspaceAction(formData: FormData) {
  const { workspaces: workspaceList } = await getWorkspaceContext();
  const workspaceId = getRequiredString(formData, "workspaceId");
  const selectedWorkspace = workspaceList.find((workspace) => workspace.id === workspaceId);

  if (!selectedWorkspace) {
    return;
  }

  const name = getRequiredString(formData, "name");
  const description = getOptionalString(formData, "description");
  const type = pickEnum(
    ["personal", "team", "company", "agency"] as const,
    getRequiredString(formData, "type"),
    selectedWorkspace.type
  );

  if (!name) {
    return;
  }

  await db
    .update(workspacesTable)
    .set({
      description: description || null,
      name,
      type,
    })
    .where(eq(workspacesTable.id, workspaceId));

  revalidateDashboardPaths("/dashboard/settings");
}

export async function deleteWorkspaceAction(formData: FormData) {
  const { activeWorkspace, workspaces: workspaceList } = await getWorkspaceContext();
  const workspaceId = getRequiredString(formData, "workspaceId");
  const selectedWorkspace = workspaceList.find((workspace) => workspace.id === workspaceId);

  if (!selectedWorkspace) {
    return;
  }

  await db.delete(workspacesTable).where(eq(workspacesTable.id, workspaceId));

  if (activeWorkspace.id === workspaceId) {
    const cookieStore = await cookies();
    clearWorkspaceCookie(cookieStore);
    clearActivityCookie(cookieStore);
  }

  revalidateDashboardPaths("/dashboard", "/dashboard/settings");
}

export async function switchActivityAction(formData: FormData) {
  const { activities } = await getWorkspaceContext();
  const activityId = getRequiredString(formData, "activityId");
  const selectedActivity = activities.find((activity) => activity.id === activityId);

  if (!selectedActivity) {
    return;
  }

  const cookieStore = await cookies();
  setActivityCookie(cookieStore, selectedActivity.id);
  revalidateDashboardPaths();
}

export async function createActivityAction(formData: FormData) {
  const { activeActivity, userId, workspaceId } = await getActionContext();
  const name = getRequiredString(formData, "name");

  if (!name) {
    return;
  }

  const [createdActivity] = await db
    .insert(activities)
    .values({
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
    })
    .returning({ id: activities.id });

  if (!activeActivity) {
    const cookieStore = await cookies();
    if (createdActivity?.id) {
      setActivityCookie(cookieStore, createdActivity.id);
    }
  }

  revalidateDashboardPaths("/dashboard/activities", "/dashboard/budget");
}

export async function createProjectAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const name = getRequiredString(formData, "name");
  const activityId = getOptionalString(formData, "activityId");
  const clientId = getOptionalString(formData, "clientId");
  const projectActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    activityId,
    activeActivity?.id
  );

  if (!name || !projectActivityId) {
    return;
  }

  const [project] = await db
    .insert(projects)
    .values({
      activityId: projectActivityId,
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

    if (projectActivityId) {
      await safeInsertActivityClient({
        activityId: projectActivityId,
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
    projectActivityId ? `/dashboard/activities/${projectActivityId}` : ""
  );
}

export async function assignClientRelationshipsAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const clientId = getRequiredString(formData, "clientId");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const project = await getProjectScope(workspaceId, projectId);
  if (projectId && !project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );

  if (!clientId || (!resolvedActivityId && !projectId)) {
    return;
  }

  if (resolvedActivityId) {
    await safeInsertActivityClient({
      activityId: resolvedActivityId,
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
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : "",
    projectId ? `/dashboard/projects/${projectId}` : ""
  );
}

export async function createGoalAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const title = getRequiredString(formData, "title");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const project = await getProjectScope(workspaceId, projectId);
  if (projectId && !project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );

  if (!title || !resolvedActivityId) {
    return;
  }

  const currentValue = getNumber(formData, "currentValue");
  const targetValue = getNumber(formData, "targetValue");
  const progress = calculateProgress(currentValue, targetValue);

  await db.insert(goals).values({
    activityId: resolvedActivityId,
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
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function updateProjectProgressAction(formData: FormData) {
  const { activeActivity, workspaceId } = await getActionContext();
  const projectId = getRequiredString(formData, "projectId");

  if (!projectId || !activeActivity) {
    return;
  }

  const project = await getProjectScope(workspaceId, projectId);

  if (project?.activityId !== activeActivity.id) {
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
  const { activeActivity, workspaceId } = await getActionContext();
  const goalId = getRequiredString(formData, "goalId");

  if (!goalId || !activeActivity) {
    return;
  }

  const [goal] = await db
    .select({
      activityId: goals.activityId,
      projectId: goals.projectId,
      targetValue: goals.targetValue,
    })
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1);

  if (!goal) {
    return;
  }

  let goalActivityId = goal.activityId;

  if (!goalActivityId && goal.projectId) {
    goalActivityId = (await getProjectScope(workspaceId, goal.projectId))?.activityId ?? null;
  }

  if (goalActivityId !== activeActivity.id) {
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
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const title = getRequiredString(formData, "title");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const project = await getProjectScope(workspaceId, projectId);
  if (projectId && !project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );

  if (!title || !resolvedActivityId) {
    return;
  }

  const status = pickEnum(
    taskStatusOrder,
    getRequiredString(formData, "status"),
    "todo"
  );

  await db.insert(tasks).values({
    activityId: resolvedActivityId,
    completedAt: status === "done" ? new Date() : null,
    createdBy: userId,
    description: getOptionalString(formData, "description"),
    dueDate: getOptionalDate(formData, "dueDate"),
    estimatedMinutes: getOptionalNumber(formData, "estimatedMinutes"),
    goalId: getOptionalString(formData, "goalId"),
    plannedDate: getOptionalDate(formData, "plannedDate"),
    priority: pickEnum(
      taskPriorityOrder,
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
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function updateTaskStatusAction(formData: FormData) {
  const { workspaceId } = await getActionContext();
  const taskId = getRequiredString(formData, "taskId");
  const status = pickEnum(
    taskStatusOrder,
    getRequiredString(formData, "status"),
    "todo"
  );

  if (!taskId) {
    return;
  }

  const [task] = await db
    .select({
      workspaceId: tasks.workspaceId,
    })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!task) {
    return;
  }

  if (task.workspaceId !== workspaceId) {
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
  const { activeActivity, userId, workspaceId } = await getActionContext();
  const contactId = getOptionalString(formData, "contactId");
  const nameFromForm = getOptionalString(formData, "name");

  if (!activeActivity) return;

  // If the form provides a name we prefer creating from form fields (allows verification/editing).
  if (nameFromForm) {
    const name = nameFromForm;

    const [client] = await db
      .insert(clients)
      .values({
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
      })
      .returning({ id: clients.id });

    if (client?.id) {
      await safeInsertActivityClient({
        activityId: activeActivity.id,
        clientId: client.id,
        createdBy: userId,
        workspaceId,
      });
    }

    revalidateDashboardPaths("/dashboard/clients", "/dashboard/budget");

    return;
  }

  // If a contactId is provided, fetch the contact and promote it
  if (contactId) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    if (!contact || contact.workspaceId !== workspaceId) {
      return;
    }

    // Resolve company name if the contact links to a company
    let companyName: string | null = null;
    if (contact.companyId) {
      const [company] = await db
        .select({ name: companies.name })
        .from(companies)
        .where(eq(companies.id, contact.companyId))
        .limit(1);

      companyName = company?.name ?? null;
    }

    const [client] = await db
      .insert(clients)
      .values({
        address: companyName ?? null,
        company: companyName ?? null,
        createdBy: userId,
        email: contact.email ?? null,
        name: contact.fullName,
        notes: contact.notes ?? null,
        phone: contact.phone ?? null,
        source: contact.source ?? null,
        status: contact.status ?? "prospect",
        website: companyName ?? null,
        workspaceId,
      })
      .returning({ id: clients.id });

    if (client?.id) {
      await safeInsertActivityClient({
        activityId: activeActivity.id,
        clientId: client.id,
        createdBy: userId,
        workspaceId,
      });
    }

    revalidateDashboardPaths("/dashboard/clients", "/dashboard/budget");

    return;
  }

  // Fallback: create client from form fields
  const name = getRequiredString(formData, "name");
  if (!name) return;

  const [client] = await db
    .insert(clients)
    .values({
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
    })
    .returning({ id: clients.id });

  if (client?.id) {
    await safeInsertActivityClient({
      activityId: activeActivity.id,
      clientId: client.id,
      createdBy: userId,
      workspaceId,
    });
  }

  revalidateDashboardPaths("/dashboard/clients", "/dashboard/budget");
}

export async function createCompanyAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const name = getRequiredString(formData, "name");
  const activityId = getOptionalString(formData, "activityId");
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    activityId,
    activeActivity?.id
  );

  if (!name) {
    return;
  }

  await db.insert(companies).values({
    activityId: resolvedActivityId,
    createdBy: userId,
    email: getOptionalString(formData, "email"),
    address: getOptionalString(formData, "address"),
    city: getOptionalString(formData, "city"),
    country: getOptionalString(formData, "country"),
    industry: getOptionalString(formData, "industry"),
    legalName: getOptionalString(formData, "legalName"),
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

  revalidateDashboardPaths(
    "/dashboard/companies",
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function createContactAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const firstName = getOptionalString(formData, "firstName");
  const lastName = getOptionalString(formData, "lastName");
  const fullName =
    getOptionalString(formData, "fullName") ||
    [firstName, lastName].filter(Boolean).join(" ").trim();
  const activityId = getOptionalString(formData, "activityId");
  const companyId = getOptionalString(formData, "companyId");
  const company = await getCompanyScope(workspaceId, companyId);
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    activityId,
    activeActivity?.id
  );

  if (!fullName) {
    return;
  }

  await db.insert(contacts).values({
    activityId: resolvedActivityId,
    companyId: company?.name ? companyId : null,
    createdBy: userId,
    department: getOptionalString(formData, "department"),
    email: getOptionalString(formData, "email"),
    firstName,
    jobTitle: getOptionalString(formData, "jobTitle"),
    lastName,
    linkedinUrl: getOptionalString(formData, "linkedinUrl"),
    notes: getOptionalString(formData, "notes"),
    phone: getOptionalString(formData, "phone"),
    source: getOptionalString(formData, "source"),
    status: pickEnum(
      clientStatuses,
      getRequiredString(formData, "status"),
      "prospect"
    ),
    whatsapp: getOptionalString(formData, "whatsapp"),
    fullName,
    workspaceId,
  });

  revalidateDashboardPaths(
    "/dashboard/contacts",
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function updateClientAction(formData: FormData) {
  const { workspaceId } = await getActionContext();
  const clientId = getRequiredString(formData, "clientId");

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))
    .limit(1);

  if (!client) {
    return;
  }

  await db
    .update(clients)
    .set({
      name: getRequiredString(formData, "name"),
      company: getOptionalString(formData, "company"),
      email: getOptionalString(formData, "email"),
      phone: getOptionalString(formData, "phone"),
      address: getOptionalString(formData, "address"),
      website: getOptionalString(formData, "website"),
      source: getOptionalString(formData, "source"),
      notes: getOptionalString(formData, "notes"),
      status: pickEnum(
        clientStatuses,
        getRequiredString(formData, "status"),
        "prospect"
      ),
      updatedAt: new Date(),
    })
    .where(eq(clients.id, clientId));

  revalidateDashboardPaths("/dashboard/clients", "/dashboard/budget");
}

export async function deleteClientAction(formData: FormData) {
  const { workspaceId } = await getActionContext();
  const clientId = getRequiredString(formData, "clientId");

  await db
    .delete(clients)
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)));

  revalidateDashboardPaths("/dashboard/clients", "/dashboard/budget");
}

export async function updateCompanyAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, workspaceId } =
    await getActionContext();
  const companyId = getRequiredString(formData, "companyId");
  const activityId = getOptionalString(formData, "activityId");
  const resolvedActivityId = activityId
    ? getResolvedActivityId(
        new Set(workspaceActivities.map((activity) => activity.id)),
        activityId,
        activeActivity?.id
      )
    : null;

  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, companyId), eq(companies.workspaceId, workspaceId)))
    .limit(1);

  if (!company) {
    return;
  }

  await db
    .update(companies)
    .set({
      name: getRequiredString(formData, "name"),
      status: pickEnum(
        clientStatuses,
        getRequiredString(formData, "status"),
        "prospect"
      ),
      activityId: resolvedActivityId,
      address: getOptionalString(formData, "address"),
      city: getOptionalString(formData, "city"),
      country: getOptionalString(formData, "country"),
      industry: getOptionalString(formData, "industry"),
      email: getOptionalString(formData, "email"),
      phone: getOptionalString(formData, "phone"),
      website: getOptionalString(formData, "website"),
      source: getOptionalString(formData, "source"),
      notes: getOptionalString(formData, "notes"),
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));

  revalidateDashboardPaths(
    "/dashboard/companies",
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function deleteCompanyAction(formData: FormData) {
  const { workspaceId } = await getActionContext();
  const companyId = getRequiredString(formData, "companyId");

  await db
    .delete(companies)
    .where(and(eq(companies.id, companyId), eq(companies.workspaceId, workspaceId)));

  revalidateDashboardPaths("/dashboard/companies");
}

export async function updateContactAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, workspaceId } =
    await getActionContext();
  const contactId = getRequiredString(formData, "contactId");
  const activityId = getOptionalString(formData, "activityId");
  const companyId = getOptionalString(formData, "companyId");
  const resolvedActivityId = activityId
    ? getResolvedActivityId(
        new Set(workspaceActivities.map((activity) => activity.id)),
        activityId,
        activeActivity?.id
      )
    : null;
  const company = await getCompanyScope(workspaceId, companyId);

  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.workspaceId, workspaceId)))
    .limit(1);

  if (!contact) {
    return;
  }

  const firstName = getOptionalString(formData, "firstName");
  const lastName = getOptionalString(formData, "lastName");
  const fullName =
    getOptionalString(formData, "fullName") ||
    [firstName, lastName].filter(Boolean).join(" ").trim();

  await db
    .update(contacts)
    .set({
      firstName,
      lastName,
      fullName,
      activityId: resolvedActivityId,
      companyId: company?.name ? companyId : null,
      jobTitle: getOptionalString(formData, "jobTitle"),
      department: getOptionalString(formData, "department"),
      email: getOptionalString(formData, "email"),
      phone: getOptionalString(formData, "phone"),
      whatsapp: getOptionalString(formData, "whatsapp"),
      linkedinUrl: getOptionalString(formData, "linkedinUrl"),
      source: getOptionalString(formData, "source"),
      notes: getOptionalString(formData, "notes"),
      status: pickEnum(
        clientStatuses,
        getRequiredString(formData, "status"),
        "prospect"
      ),
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId));

  revalidateDashboardPaths(
    "/dashboard/contacts",
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function deleteContactAction(formData: FormData) {
  const { workspaceId } = await getActionContext();
  const contactId = getRequiredString(formData, "contactId");

  await db
    .delete(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.workspaceId, workspaceId)));

  revalidateDashboardPaths("/dashboard/contacts");
}

export async function createBudgetAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const name = getRequiredString(formData, "name");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const project = await getProjectScope(workspaceId, projectId);
  if (projectId && !project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );

  if (!name || !resolvedActivityId) {
    return;
  }

  await db.insert(budgets).values({
    activityId: resolvedActivityId,
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
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : "",
    projectId ? `/dashboard/projects/${projectId}` : ""
  );
}

export async function createTransactionAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const clientId = getOptionalString(formData, "clientId");
  const project = await getProjectScope(workspaceId, projectId);
  if (projectId && !project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );

  if (!resolvedActivityId) {
    return;
  }

  await db.insert(transactions).values({
    activityId: resolvedActivityId,
    amount: getNumber(formData, "amount"),
    category: getOptionalString(formData, "category"),
    clientId,
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

  if (clientId) {
    await safeInsertActivityClient({
      activityId: resolvedActivityId,
      clientId,
      createdBy: userId,
      workspaceId,
    });
  }

  revalidateDashboardPaths(
    "/dashboard/budget",
    "/dashboard/finances",
    projectId ? `/dashboard/projects/${projectId}` : "",
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function createInvoiceAction(formData: FormData) {
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getRequiredString(formData, "projectId");
  const invoiceNumber = getRequiredString(formData, "invoiceNumber");
  const itemDescription = getRequiredString(formData, "itemDescription");
  const quantity = getNumber(formData, "quantity", 1);
  const subtotal = getNumber(formData, "subtotal");
  const taxAmount = getNumber(formData, "taxAmount");
  const paidAmount = getNumber(formData, "paidAmount");
  const total = subtotal + taxAmount;
  const unitPrice = quantity > 0 ? subtotal / quantity : subtotal;
  const project = await getProjectScope(workspaceId, projectId);
  if (!project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );

  if (!projectId || !invoiceNumber || !itemDescription || !resolvedActivityId) {
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

  const clientId = getOptionalString(formData, "clientId");
  if (clientId) {
    await safeInsertActivityClient({
      activityId: resolvedActivityId,
      clientId,
      createdBy: userId,
      workspaceId,
    });
  }

  revalidateDashboardPaths(
    "/dashboard/invoices",
    projectId ? `/dashboard/projects/${projectId}` : "",
    resolvedActivityId ? `/dashboard/activities/${resolvedActivityId}` : ""
  );
}

export async function updateInvoicePaymentAction(formData: FormData) {
  const { activeActivity, workspaceId } = await getActionContext();
  const invoiceId = getRequiredString(formData, "invoiceId");

  if (!invoiceId || !activeActivity) {
    return;
  }

  const [invoice] = await db
    .select({
      projectId: invoices.projectId,
      total: invoices.total,
    })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) {
    return;
  }

  if (!invoice.projectId) {
    return;
  }

  const project = await getProjectScope(workspaceId, invoice.projectId);

  if (project?.activityId !== activeActivity.id) {
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
  const { activeActivity, activities: workspaceActivities, userId, workspaceId } =
    await getActionContext();
  const title = getRequiredString(formData, "title");
  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const project = await getProjectScope(workspaceId, projectId);
  if (projectId && !project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );

  if (!title || !resolvedActivityId) {
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
      activityId: resolvedActivityId,
      content: getOptionalString(formData, "content"),
      createdBy: userId,
      goalId: getOptionalString(formData, "goalId"),
      hashtags,
      platform: primaryPlatform,
      projectId,
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
  const { activeActivity, activities: workspaceActivities, userId, workspaceId, workspaceName } =
    await getActionContext();
  const brief = getRequiredString(formData, "brief");

  if (!brief) {
    return;
  }

  const activityId = getOptionalString(formData, "activityId");
  const projectId = getOptionalString(formData, "projectId");
  const project = await getProjectScope(workspaceId, projectId);
  if (projectId && !project) {
    return;
  }
  const resolvedActivityId = getResolvedActivityId(
    new Set(workspaceActivities.map((activity) => activity.id)),
    project?.activityId,
    activityId,
    activeActivity?.id
  );
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
    projectName: await getProjectName(workspaceId, projectId),
    tone,
    workspaceName,
  });
  const status = getSocialPostStatus(
    getRequiredString(formData, "status"),
    scheduledAt
  );
  if (!resolvedActivityId) {
    return;
  }
  const [post] = await db
    .insert(socialPosts)
    .values({
      activityId: resolvedActivityId,
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
  const { activeActivity, userId, workspaceId } = await getActionContext();
  const postId = getRequiredString(formData, "postId");

  if (!postId || !activeActivity) {
    return;
  }

  const [postRecord] = await db
    .select({
      activityId: socialPosts.activityId,
      projectId: socialPosts.projectId,
    })
    .from(socialPosts)
    .where(eq(socialPosts.id, postId))
    .limit(1);

  if (!postRecord) {
    return;
  }

  let postActivityId = postRecord.activityId;

  if (!postActivityId && postRecord.projectId) {
    postActivityId = (await getProjectScope(workspaceId, postRecord.projectId))?.activityId ?? null;
  }

  if (postActivityId !== activeActivity.id) {
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
  const { activeActivity, workspaceId } = await getActionContext();
  const postId = getRequiredString(formData, "postId");

  if (!postId || !activeActivity) {
    return;
  }

  const [postRecord] = await db
    .select({
      activityId: socialPosts.activityId,
      projectId: socialPosts.projectId,
    })
    .from(socialPosts)
    .where(eq(socialPosts.id, postId))
    .limit(1);

  if (!postRecord) {
    return;
  }

  let postActivityId = postRecord.activityId;

  if (!postActivityId && postRecord.projectId) {
    postActivityId = (await getProjectScope(workspaceId, postRecord.projectId))?.activityId ?? null;
  }

  if (postActivityId !== activeActivity.id) {
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
  const { activeActivity, workspaceId } = await getActionContext();
  const deliveryId = getRequiredString(formData, "deliveryId");

  if (!deliveryId || !activeActivity) {
    return;
  }

  const [deliveryRecord] = await db
    .select({ postId: socialPostDeliveries.postId })
    .from(socialPostDeliveries)
    .where(eq(socialPostDeliveries.id, deliveryId))
    .limit(1);

  if (!deliveryRecord) {
    return;
  }

  const [postRecord] = await db
    .select({
      activityId: socialPosts.activityId,
      projectId: socialPosts.projectId,
    })
    .from(socialPosts)
    .where(eq(socialPosts.id, deliveryRecord.postId))
    .limit(1);

  if (!postRecord) {
    return;
  }

  let postActivityId = postRecord.activityId;

  if (!postActivityId && postRecord.projectId) {
    postActivityId = (await getProjectScope(workspaceId, postRecord.projectId))?.activityId ?? null;
  }

  if (postActivityId !== activeActivity.id) {
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

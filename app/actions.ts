"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import {
  activities,
  clients,
  goals,
  invoiceItems,
  invoices,
  projects,
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
import {
  calculateProgress,
  clampPercentage,
  getNumber,
  getOptionalDate,
  getOptionalNumber,
  getOptionalString,
  getRequiredString,
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
    revalidatePath(path);
  }
}

async function getActionContext() {
  const { activeWorkspace, user } = await getWorkspaceContext();

  return {
    userId: user.id,
    workspaceId: activeWorkspace.id,
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

  revalidateDashboardPaths("/dashboard/activities");
}

export async function createProjectAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const name = getRequiredString(formData, "name");

  if (!name) {
    return;
  }

  await db.insert(projects).values({
    activityId: getOptionalString(formData, "activityId"),
    budgetPlanned: getNumber(formData, "budgetPlanned"),
    budgetUsed: getNumber(formData, "budgetUsed"),
    clientId: getOptionalString(formData, "clientId"),
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
  });

  revalidateDashboardPaths("/dashboard/projects");
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

export async function createGoalAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const title = getRequiredString(formData, "title");

  if (!title) {
    return;
  }

  const currentValue = getNumber(formData, "currentValue");
  const targetValue = getNumber(formData, "targetValue");
  const progress = calculateProgress(currentValue, targetValue);

  await db.insert(goals).values({
    activityId: getOptionalString(formData, "activityId"),
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
    projectId: getOptionalString(formData, "projectId"),
    startDate: getOptionalDate(formData, "startDate"),
    status: progress >= 100 ? "achieved" : "in_progress",
    targetValue,
    title,
    unit: getOptionalString(formData, "unit"),
    workspaceId,
  });

  revalidateDashboardPaths("/dashboard/goals");
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

  if (!title) {
    return;
  }

  const status = pickEnum(
    taskStatuses,
    getRequiredString(formData, "status"),
    "todo"
  );

  await db.insert(tasks).values({
    activityId: getOptionalString(formData, "activityId"),
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
    projectId: getOptionalString(formData, "projectId"),
    status,
    title,
    workspaceId,
  });

  revalidateDashboardPaths("/dashboard/tasks");
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

  revalidateDashboardPaths("/dashboard/clients");
}

export async function createTransactionAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();

  await db.insert(transactions).values({
    activityId: getOptionalString(formData, "activityId"),
    amount: getNumber(formData, "amount"),
    category: getOptionalString(formData, "category"),
    clientId: getOptionalString(formData, "clientId"),
    createdBy: userId,
    currency: getRequiredString(formData, "currency") || "EUR",
    description: getOptionalString(formData, "description"),
    notes: getOptionalString(formData, "notes"),
    paymentMethod: getOptionalString(formData, "paymentMethod"),
    projectId: getOptionalString(formData, "projectId"),
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

  revalidateDashboardPaths("/dashboard/finances");
}

export async function createInvoiceAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
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
        projectId: getOptionalString(formData, "projectId"),
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

  revalidateDashboardPaths("/dashboard/invoices");
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

export async function createSocialPostAction(formData: FormData) {
  const { userId, workspaceId } = await getActionContext();
  const title = getRequiredString(formData, "title");
  const scheduledAt = getOptionalString(formData, "scheduledAt");

  if (!title) {
    return;
  }

  await db.insert(socialPosts).values({
    activityId: getOptionalString(formData, "activityId"),
    content: getOptionalString(formData, "content"),
    createdBy: userId,
    goalId: getOptionalString(formData, "goalId"),
    hashtags: getOptionalString(formData, "hashtags"),
    platform: pickEnum(
      socialPlatforms,
      getRequiredString(formData, "platform"),
      "linkedin"
    ),
    projectId: getOptionalString(formData, "projectId"),
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    status: pickEnum(
      socialStatuses,
      getRequiredString(formData, "status"),
      "idea"
    ),
    title,
    workspaceId,
  });

  revalidateDashboardPaths("/dashboard/social-posts");
}

import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  activities,
  activityClients,
  budgets,
  clients,
  goals,
  invoices,
  projects,
  projectClients,
  socialPosts,
  tasks,
  transactions,
} from "@/db/schema";
import { getWorkspaceContext } from "@/lib/auth/server";
import {
  loadOptionalSocialChannels,
  loadOptionalSocialPostDeliveries,
  loadOptionalSocialPostDetails,
} from "@/lib/social/repository";

export type DashboardOption = {
  id: string;
  label: string;
};

function hasMissingTableError(error: unknown, tableName: string) {
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

    return (
      code === "42P01" ||
      message.includes(`"${tableName}"`) ||
      message.includes(`relation "${tableName}" does not exist`) ||
      message.includes(`relation "${tableName.replaceAll("_", "")}" does not exist`)
    );
  });
}

async function getWorkspaceId() {
  const { activeWorkspace } = await getWorkspaceContext();
  return activeWorkspace.id;
}

async function loadOptionalActivityClients(workspaceId: string) {
  try {
    return await db
      .select()
      .from(activityClients)
      .where(eq(activityClients.workspaceId, workspaceId))
      .orderBy(desc(activityClients.createdAt));
  } catch (error) {
    if (hasMissingTableError(error, "activity_clients")) {
      return [];
    }

    throw error;
  }
}

async function loadOptionalProjectClients(workspaceId: string) {
  try {
    return await db
      .select()
      .from(projectClients)
      .where(eq(projectClients.workspaceId, workspaceId))
      .orderBy(desc(projectClients.createdAt));
  } catch (error) {
    if (hasMissingTableError(error, "project_clients")) {
      return [];
    }

    throw error;
  }
}

export async function getWorkspaceGraph() {
  const workspaceId = await getWorkspaceId();

  const [
    activityRows,
    activityClientRows,
    budgetRows,
    clientRows,
    goalRows,
    invoiceRows,
    socialChannelRows,
    socialDeliveryRows,
    socialDetailRows,
    postRows,
    projectRows,
    projectClientRows,
    taskRows,
    transactionRows,
  ] = await Promise.all([
    db
      .select()
      .from(activities)
      .where(eq(activities.workspaceId, workspaceId))
      .orderBy(desc(activities.updatedAt)),
    loadOptionalActivityClients(workspaceId),
    db
      .select()
      .from(budgets)
      .where(eq(budgets.workspaceId, workspaceId))
      .orderBy(desc(budgets.updatedAt)),
    db
      .select()
      .from(clients)
      .where(eq(clients.workspaceId, workspaceId))
      .orderBy(desc(clients.updatedAt)),
    db
      .select()
      .from(goals)
      .where(eq(goals.workspaceId, workspaceId))
      .orderBy(desc(goals.updatedAt)),
    db
      .select()
      .from(invoices)
      .where(eq(invoices.workspaceId, workspaceId))
      .orderBy(desc(invoices.createdAt)),
    loadOptionalSocialChannels(workspaceId),
    loadOptionalSocialPostDeliveries(workspaceId),
    loadOptionalSocialPostDetails(workspaceId),
    db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.workspaceId, workspaceId))
      .orderBy(desc(socialPosts.createdAt)),
    db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(projects.updatedAt)),
    loadOptionalProjectClients(workspaceId),
    db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(desc(tasks.updatedAt)),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.workspaceId, workspaceId))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt)),
  ]);

  return {
    activities: activityRows,
    activityClients: activityClientRows,
    budgets: budgetRows,
    clients: clientRows,
    goals: goalRows,
    invoices: invoiceRows,
    socialChannels: socialChannelRows,
    socialPostDeliveries: socialDeliveryRows,
    socialPostDetails: socialDetailRows,
    posts: postRows,
    projectClients: projectClientRows,
    projects: projectRows,
    tasks: taskRows,
    transactions: transactionRows,
    workspaceId,
  };
}

export type DashboardWorkspaceGraph = Awaited<ReturnType<typeof getWorkspaceGraph>>;

export function createMaps(graph: DashboardWorkspaceGraph) {
  return {
    activityMap: new Map(graph.activities.map((row) => [row.id, row])),
    clientMap: new Map(graph.clients.map((row) => [row.id, row])),
    goalMap: new Map(graph.goals.map((row) => [row.id, row])),
    socialChannelMap: new Map(graph.socialChannels.map((row) => [row.id, row])),
    socialPostDetailMap: new Map(graph.socialPostDetails.map((row) => [row.postId, row])),
    projectMap: new Map(graph.projects.map((row) => [row.id, row])),
  };
}

export function buildOptions(
  rows: Array<{ id: string; name: string } | { id: string; title: string }>
): DashboardOption[] {
  return rows.map((row) => ({
    id: row.id,
    label: "name" in row ? row.name : row.title,
  }));
}

export function getProjectIdsForActivity(
  activityId: string,
  graph: DashboardWorkspaceGraph
) {
  return new Set(
    graph.projects
      .filter((project) => project.activityId === activityId)
      .map((project) => project.id)
  );
}

export function getProjectClientIds(
  projectId: string,
  graph: DashboardWorkspaceGraph
) {
  const clientIds = new Set<string>();
  const project = graph.projects.find((row) => row.id === projectId);

  if (project?.clientId) {
    clientIds.add(project.clientId);
  }

  for (const link of graph.projectClients) {
    if (link.projectId === projectId) {
      clientIds.add(link.clientId);
    }
  }

  for (const invoice of graph.invoices) {
    if (invoice.projectId === projectId && invoice.clientId) {
      clientIds.add(invoice.clientId);
    }
  }

  for (const transaction of graph.transactions) {
    if (transaction.projectId === projectId && transaction.clientId) {
      clientIds.add(transaction.clientId);
    }
  }

  return clientIds;
}

export function getActivityClientIds(
  activityId: string,
  graph: DashboardWorkspaceGraph
) {
  const clientIds = new Set<string>();
  const projectIds = getProjectIdsForActivity(activityId, graph);

  for (const link of graph.activityClients) {
    if (link.activityId === activityId) {
      clientIds.add(link.clientId);
    }
  }

  for (const project of graph.projects) {
    if (project.activityId === activityId && project.clientId) {
      clientIds.add(project.clientId);
    }
  }

  for (const link of graph.projectClients) {
    if (projectIds.has(link.projectId)) {
      clientIds.add(link.clientId);
    }
  }

  for (const invoice of graph.invoices) {
    if (invoice.projectId && projectIds.has(invoice.projectId) && invoice.clientId) {
      clientIds.add(invoice.clientId);
    }
  }

  for (const transaction of graph.transactions) {
    const belongsToActivity =
      transaction.activityId === activityId ||
      (transaction.projectId ? projectIds.has(transaction.projectId) : false);

    if (belongsToActivity && transaction.clientId) {
      clientIds.add(transaction.clientId);
    }
  }

  return clientIds;
}

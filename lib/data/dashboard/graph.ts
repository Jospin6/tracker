import { cache } from "react";
import { eq, sql } from "drizzle-orm";

import { getWorkspaceContext } from "@/lib/auth/server";
import { db } from "@/db/client";
import {
  budgets,
  companies,
  contacts,
  goals,
  invoices,
  projectClients,
  projects,
  socialChannels,
  socialPostDeliveries,
  socialPostDetails,
  socialPosts,
  tasks,
  transactions,
} from "@/db/schema";

import type { InferSelectModel } from "drizzle-orm";

type LabelSource = {
  fullName?: string | null;
  id: string;
  invoiceNumber?: string | null;
  label?: string | null;
  name?: string | null;
  title?: string | null;
};

export type DashboardWorkspaceGraph = {
  budgets: Array<InferSelectModel<typeof budgets>>;
  companies: Array<InferSelectModel<typeof companies>>;
  contacts: Array<InferSelectModel<typeof contacts>>;
  goals: Array<InferSelectModel<typeof goals>>;
  invoices: Array<InferSelectModel<typeof invoices>>;
  projectClients: Array<InferSelectModel<typeof projectClients>>;
  projects: Array<InferSelectModel<typeof projects>>;
  socialChannels: Array<InferSelectModel<typeof socialChannels>>;
  socialPostDeliveries: Array<InferSelectModel<typeof socialPostDeliveries>>;
  socialPostDetails: Array<InferSelectModel<typeof socialPostDetails>>;
  socialPosts: Array<InferSelectModel<typeof socialPosts>>;
  posts: Array<InferSelectModel<typeof socialPosts>>;
  tasks: Array<InferSelectModel<typeof tasks>>;
  transactions: Array<InferSelectModel<typeof transactions>>;
  workspaceId: string;
};

function createEmptyGraph(workspaceId = ""): DashboardWorkspaceGraph {
  return {
    budgets: [],
    companies: [],
    contacts: [],
    goals: [],
    invoices: [],
    projectClients: [],
    projects: [],
    socialChannels: [],
    socialPostDeliveries: [],
    socialPostDetails: [],
    socialPosts: [],
    posts: [],
    tasks: [],
    transactions: [],
    workspaceId,
  };
}

function isMissingProjectCompanyColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";

  return message.includes("company_id") && message.includes("does not exist");
}

async function getProjectsRows(workspaceId: string) {
  try {
    return await db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
  } catch (error) {
    if (!isMissingProjectCompanyColumnError(error)) {
      throw error;
    }

    return db
      .select({
        activityId: projects.activityId,
        budgetPlanned: projects.budgetPlanned,
        budgetUsed: projects.budgetUsed,
        clientId: projects.clientId,
        companyId: sql<string | null>`null`,
        createdAt: projects.createdAt,
        createdBy: projects.createdBy,
        description: projects.description,
        dueDate: projects.dueDate,
        id: projects.id,
        name: projects.name,
        priority: projects.priority,
        progress: projects.progress,
        startDate: projects.startDate,
        status: projects.status,
        updatedAt: projects.updatedAt,
        workspaceId: projects.workspaceId,
      })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));
  }
}

function inferLabel(item: LabelSource) {
  return (
    item.label?.trim() ||
    item.name?.trim() ||
    item.title?.trim() ||
    item.fullName?.trim() ||
    item.invoiceNumber?.trim() ||
    item.id
  );
}

export function buildOptions<T extends LabelSource>(items: T[]) {
  return items.map((item) => ({
    id: item.id,
    label: inferLabel(item),
  }));
}

export function createMaps(graph: DashboardWorkspaceGraph) {
  const budgetMap = new Map(graph.budgets.map((row) => [row.id, row]));
  const companyMap = new Map(graph.companies.map((row) => [row.id, row]));
  const contactMap = new Map(graph.contacts.map((row) => [row.id, row]));
  const goalMap = new Map(graph.goals.map((row) => [row.id, row]));
  const invoiceMap = new Map(graph.invoices.map((row) => [row.id, row]));
  const projectClientMap = new Map(graph.projectClients.map((row) => [row.id, row]));
  const projectMap = new Map(graph.projects.map((row) => [row.id, row]));
  const socialChannelMap = new Map(graph.socialChannels.map((row) => [row.id, row]));
  const socialPostMap = new Map(graph.socialPosts.map((row) => [row.id, row]));
  const socialPostDetailMap = new Map(graph.socialPostDetails.map((row) => [row.postId, row]));
  const taskMap = new Map(graph.tasks.map((row) => [row.id, row]));
  const transactionMap = new Map(graph.transactions.map((row) => [row.id, row]));

  return {
    budgetMap,
    companyMap,
    contactMap,
    goalMap,
    invoiceMap,
    projectClientMap,
    projectMap,
    socialChannelMap,
    socialPostDetailMap,
    socialPostMap,
    taskMap,
    transactionMap,
  };
}

export const getWorkspaceGraph = cache(async () => {
  const { activeWorkspace } = await getWorkspaceContext();

  if (!activeWorkspace) {
    return createEmptyGraph();
  }

  const workspaceId = activeWorkspace.id;
  const [
    budgetsRows,
    companiesRows,
    contactsRows,
    goalsRows,
    invoicesRows,
    projectClientsRows,
    projectsRows,
    socialChannelsRows,
    socialPostDeliveriesRows,
    socialPostDetailsRows,
    socialPostsRows,
    tasksRows,
    transactionsRows,
  ] = await Promise.all([
    db.select().from(budgets).where(eq(budgets.workspaceId, workspaceId)),
    db.select().from(companies).where(eq(companies.workspaceId, workspaceId)),
    db.select().from(contacts).where(eq(contacts.workspaceId, workspaceId)),
    db.select().from(goals).where(eq(goals.workspaceId, workspaceId)),
    db.select().from(invoices).where(eq(invoices.workspaceId, workspaceId)),
    db.select().from(projectClients).where(eq(projectClients.workspaceId, workspaceId)),
    getProjectsRows(workspaceId),
    db.select().from(socialChannels).where(eq(socialChannels.workspaceId, workspaceId)),
    db
      .select()
      .from(socialPostDeliveries)
      .where(eq(socialPostDeliveries.workspaceId, workspaceId)),
    db
      .select()
      .from(socialPostDetails)
      .where(eq(socialPostDetails.workspaceId, workspaceId)),
    db.select().from(socialPosts).where(eq(socialPosts.workspaceId, workspaceId)),
    db.select().from(tasks).where(eq(tasks.workspaceId, workspaceId)),
    db.select().from(transactions).where(eq(transactions.workspaceId, workspaceId)),
  ]);

  return {
    budgets: budgetsRows,
    companies: companiesRows,
    contacts: contactsRows,
    goals: goalsRows,
    invoices: invoicesRows,
    projectClients: projectClientsRows,
    projects: projectsRows,
    socialChannels: socialChannelsRows,
    socialPostDeliveries: socialPostDeliveriesRows,
    socialPostDetails: socialPostDetailsRows,
    socialPosts: socialPostsRows,
    posts: socialPostsRows,
    tasks: tasksRows,
    transactions: transactionsRows,
    workspaceId,
  };
});

import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  activities,
  clients,
  goals,
  invoices,
  projects,
  socialPosts,
  tasks,
  transactions,
} from "@/db/schema";
import { getWorkspaceContext } from "@/lib/auth/server";

type Option = {
  id: string;
  label: string;
};

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
  }).format(date);
}

function sortByDateDesc<T extends { createdAt?: Date | null }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftValue = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightValue = right.createdAt ? new Date(right.createdAt).getTime() : 0;

    return rightValue - leftValue;
  });
}

async function getWorkspaceId() {
  const { activeWorkspace } = await getWorkspaceContext();
  return activeWorkspace.id;
}

async function getActivitiesOptions(workspaceId: string): Promise<Option[]> {
  const rows = await db
    .select({ id: activities.id, label: activities.name })
    .from(activities)
    .where(eq(activities.workspaceId, workspaceId))
    .orderBy(desc(activities.createdAt));

  return rows;
}

async function getProjectsOptions(workspaceId: string): Promise<Option[]> {
  const rows = await db
    .select({ id: projects.id, label: projects.name })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(projects.createdAt));

  return rows;
}

async function getGoalsOptions(workspaceId: string): Promise<Option[]> {
  const rows = await db
    .select({ id: goals.id, label: goals.title })
    .from(goals)
    .where(eq(goals.workspaceId, workspaceId))
    .orderBy(desc(goals.createdAt));

  return rows;
}

async function getClientsOptions(workspaceId: string): Promise<Option[]> {
  const rows = await db
    .select({ id: clients.id, label: clients.name })
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId))
    .orderBy(desc(clients.createdAt));

  return rows;
}

export async function getDashboardData() {
  const workspaceId = await getWorkspaceId();
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    activityRows,
    projectRows,
    goalRows,
    taskRows,
    clientRows,
    transactionRows,
    invoiceRows,
    socialRows,
  ] = await Promise.all([
    db
      .select()
      .from(activities)
      .where(eq(activities.workspaceId, workspaceId))
      .orderBy(desc(activities.updatedAt)),
    db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(projects.updatedAt)),
    db
      .select()
      .from(goals)
      .where(eq(goals.workspaceId, workspaceId))
      .orderBy(desc(goals.updatedAt)),
    db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(desc(tasks.updatedAt)),
    db
      .select()
      .from(clients)
      .where(eq(clients.workspaceId, workspaceId))
      .orderBy(desc(clients.updatedAt)),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.workspaceId, workspaceId))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt)),
    db
      .select()
      .from(invoices)
      .where(eq(invoices.workspaceId, workspaceId))
      .orderBy(desc(invoices.dueAt), desc(invoices.createdAt)),
    db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.workspaceId, workspaceId))
      .orderBy(desc(socialPosts.scheduledAt), desc(socialPosts.createdAt)),
  ]);

  const currentMonthTransactions = transactionRows.filter((row) => {
    const date = new Date(row.transactionDate);
    return date >= monthStart;
  });

  const monthlyIncome = currentMonthTransactions
    .filter((row) => row.type === "income")
    .reduce((total, row) => total + row.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter((row) => row.type === "expense")
    .reduce((total, row) => total + row.amount, 0);

  const openTasks = taskRows.filter(
    (row) => row.status !== "done" && row.status !== "cancelled"
  );
  const activeProjects = projectRows.filter(
    (row) => row.status !== "completed" && row.status !== "cancelled"
  );
  const overdueInvoices = invoiceRows.filter(
    (row) => row.status !== "paid" && row.status !== "cancelled"
  );
  const goalAverageProgress = goalRows.length
    ? Math.round(
        goalRows.reduce((total, row) => total + row.progress, 0) / goalRows.length
      )
    : 0;

  const trendMap = new Map<string, number>();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    trendMap.set(monthKey(date), 0);
  }

  for (const transaction of transactionRows) {
    const date = new Date(transaction.transactionDate);
    const key = monthKey(date);

    if (!trendMap.has(key)) {
      continue;
    }

    const sign = transaction.type === "expense" ? -1 : 1;
    trendMap.set(key, (trendMap.get(key) ?? 0) + sign * transaction.amount);
  }

  const trendData = Array.from(trendMap.entries()).map(([key, value]) => {
    const [year, month] = key.split("-");
    return {
      name: monthLabel(new Date(Number(year), Number(month), 1)),
      value,
    };
  });

  const overdueTasks = openTasks
    .filter((row) => row.dueDate && new Date(row.dueDate) < now)
    .sort((left, right) => {
      const leftValue = left.dueDate ? new Date(left.dueDate).getTime() : 0;
      const rightValue = right.dueDate ? new Date(right.dueDate).getTime() : 0;

      return leftValue - rightValue;
    })
    .slice(0, 5);

  const recentProjects = projectRows.slice(0, 4);
  const upcomingInvoices = overdueInvoices
    .sort((left, right) => {
      const leftValue = left.dueAt ? new Date(left.dueAt).getTime() : 0;
      const rightValue = right.dueAt ? new Date(right.dueAt).getTime() : 0;

      return leftValue - rightValue;
    })
    .slice(0, 5);

  return {
    activities: activityRows,
    clients: clientRows,
    goals: goalRows,
    invoices: invoiceRows,
    metrics: {
      activeProjects: activeProjects.length,
      clients: clientRows.length,
      goalAverageProgress,
      monthlyBalance: monthlyIncome - monthlyExpense,
      monthlyExpense,
      monthlyIncome,
      openTasks: openTasks.length,
      scheduledPosts: socialRows.filter((row) => row.status === "scheduled").length,
      unpaidInvoices: overdueInvoices.reduce(
        (total, row) => total + (row.total - row.paidAmount),
        0
      ),
    },
    overdueTasks,
    posts: socialRows,
    projects: recentProjects,
    tasks: taskRows,
    transactions: transactionRows,
    trendData,
    upcomingInvoices,
    workspaceId,
  };
}

export async function getActivitiesPageData() {
  const workspaceId = await getWorkspaceId();

  const rows = await db
    .select()
    .from(activities)
    .where(eq(activities.workspaceId, workspaceId))
    .orderBy(desc(activities.updatedAt));

  return { activities: rows };
}

export async function getProjectsPageData() {
  const workspaceId = await getWorkspaceId();

  const [projectRows, activityOptions, clientOptions] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(projects.updatedAt)),
    getActivitiesOptions(workspaceId),
    getClientsOptions(workspaceId),
  ]);

  const activityMap = new Map(activityOptions.map((row) => [row.id, row.label]));
  const clientMap = new Map(clientOptions.map((row) => [row.id, row.label]));

  return {
    activities: activityOptions,
    clients: clientOptions,
    projects: projectRows.map((row) => ({
      ...row,
      activityName: row.activityId ? activityMap.get(row.activityId) ?? null : null,
      clientName: row.clientId ? clientMap.get(row.clientId) ?? null : null,
    })),
  };
}

export async function getGoalsPageData() {
  const workspaceId = await getWorkspaceId();

  const [goalRows, activityOptions, projectOptions] = await Promise.all([
    db
      .select()
      .from(goals)
      .where(eq(goals.workspaceId, workspaceId))
      .orderBy(desc(goals.updatedAt)),
    getActivitiesOptions(workspaceId),
    getProjectsOptions(workspaceId),
  ]);

  const activityMap = new Map(activityOptions.map((row) => [row.id, row.label]));
  const projectMap = new Map(projectOptions.map((row) => [row.id, row.label]));

  return {
    activities: activityOptions,
    goals: goalRows.map((row) => ({
      ...row,
      activityName: row.activityId ? activityMap.get(row.activityId) ?? null : null,
      projectName: row.projectId ? projectMap.get(row.projectId) ?? null : null,
    })),
    projects: projectOptions,
  };
}

export async function getTasksPageData() {
  const workspaceId = await getWorkspaceId();

  const [taskRows, activityOptions, goalOptions, projectOptions] =
    await Promise.all([
      db
        .select()
        .from(tasks)
        .where(eq(tasks.workspaceId, workspaceId))
        .orderBy(desc(tasks.updatedAt)),
      getActivitiesOptions(workspaceId),
      getGoalsOptions(workspaceId),
      getProjectsOptions(workspaceId),
    ]);

  const activityMap = new Map(activityOptions.map((row) => [row.id, row.label]));
  const goalMap = new Map(goalOptions.map((row) => [row.id, row.label]));
  const projectMap = new Map(projectOptions.map((row) => [row.id, row.label]));

  return {
    activities: activityOptions,
    goals: goalOptions,
    projects: projectOptions,
    tasks: taskRows.map((row) => ({
      ...row,
      activityName: row.activityId ? activityMap.get(row.activityId) ?? null : null,
      goalName: row.goalId ? goalMap.get(row.goalId) ?? null : null,
      projectName: row.projectId ? projectMap.get(row.projectId) ?? null : null,
    })),
  };
}

export async function getClientsPageData() {
  const workspaceId = await getWorkspaceId();
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId))
    .orderBy(desc(clients.updatedAt));

  return { clients: rows };
}

export async function getFinancesPageData() {
  const workspaceId = await getWorkspaceId();

  const [transactionRows, clientOptions, projectOptions] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(eq(transactions.workspaceId, workspaceId))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt)),
    getClientsOptions(workspaceId),
    getProjectsOptions(workspaceId),
  ]);

  const clientMap = new Map(clientOptions.map((row) => [row.id, row.label]));
  const projectMap = new Map(projectOptions.map((row) => [row.id, row.label]));
  const income = transactionRows
    .filter((row) => row.type === "income")
    .reduce((total, row) => total + row.amount, 0);
  const expense = transactionRows
    .filter((row) => row.type === "expense")
    .reduce((total, row) => total + row.amount, 0);

  return {
    clients: clientOptions,
    projects: projectOptions,
    summary: {
      balance: income - expense,
      expense,
      income,
    },
    transactions: transactionRows.map((row) => ({
      ...row,
      clientName: row.clientId ? clientMap.get(row.clientId) ?? null : null,
      projectName: row.projectId ? projectMap.get(row.projectId) ?? null : null,
    })),
  };
}

export async function getInvoicesPageData() {
  const workspaceId = await getWorkspaceId();

  const [invoiceRows, clientOptions, projectOptions] = await Promise.all([
    db
      .select()
      .from(invoices)
      .where(eq(invoices.workspaceId, workspaceId))
      .orderBy(desc(invoices.createdAt)),
    getClientsOptions(workspaceId),
    getProjectsOptions(workspaceId),
  ]);

  const clientMap = new Map(clientOptions.map((row) => [row.id, row.label]));
  const projectMap = new Map(projectOptions.map((row) => [row.id, row.label]));

  return {
    clients: clientOptions,
    invoices: invoiceRows.map((row) => ({
      ...row,
      clientName: row.clientId ? clientMap.get(row.clientId) ?? null : null,
      outstanding: row.total - row.paidAmount,
      projectName: row.projectId ? projectMap.get(row.projectId) ?? null : null,
    })),
    projects: projectOptions,
  };
}

export async function getSocialPostsPageData() {
  const workspaceId = await getWorkspaceId();

  const [postRows, activityOptions, goalOptions, projectOptions] =
    await Promise.all([
      db
        .select()
        .from(socialPosts)
        .where(eq(socialPosts.workspaceId, workspaceId))
        .orderBy(desc(socialPosts.createdAt)),
      getActivitiesOptions(workspaceId),
      getGoalsOptions(workspaceId),
      getProjectsOptions(workspaceId),
    ]);

  const activityMap = new Map(activityOptions.map((row) => [row.id, row.label]));
  const goalMap = new Map(goalOptions.map((row) => [row.id, row.label]));
  const projectMap = new Map(projectOptions.map((row) => [row.id, row.label]));

  return {
    activities: activityOptions,
    goals: goalOptions,
    posts: sortByDateDesc(
      postRows.map((row) => ({
        ...row,
        activityName: row.activityId ? activityMap.get(row.activityId) ?? null : null,
        goalName: row.goalId ? goalMap.get(row.goalId) ?? null : null,
        projectName: row.projectId ? projectMap.get(row.projectId) ?? null : null,
      }))
    ),
    projects: projectOptions,
  };
}

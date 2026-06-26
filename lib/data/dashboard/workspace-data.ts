import { getWorkspaceGraph, buildOptions, createMaps, type DashboardWorkspaceGraph } from "@/lib/data/dashboard/graph";
import {
  average,
  monthKey,
  monthLabel,
  sortByDateAsc,
  sortByDateDesc,
  sortByUpdatedDesc,
  startOfMonth,
  uniqueById,
} from "@/lib/data/dashboard/utils";

type CompanySummary = DashboardWorkspaceGraph["companies"][number] & {
  balance: number;
  contactCount: number;
  contactNames: string[];
  expense: number;
  income: number;
  outstanding: number;
  projectCount: number;
  projectNames: string[];
};

function getCompanyForProject(
  project: DashboardWorkspaceGraph["projects"][number],
  graph: DashboardWorkspaceGraph
) {
  const { companyMap } = createMaps(graph);
  return project.companyId ? companyMap.get(project.companyId) ?? null : null;
}

function getProjectContacts(
  project: DashboardWorkspaceGraph["projects"][number],
  graph: DashboardWorkspaceGraph
) {
  if (!project.companyId) {
    return [];
  }

  return graph.contacts.filter((contact) => contact.companyId === project.companyId);
}

export function enrichTask(
  task: DashboardWorkspaceGraph["tasks"][number],
  graph: DashboardWorkspaceGraph
) {
  const { goalMap, projectMap, companyMap } = createMaps(graph);
  const project = task.projectId ? projectMap.get(task.projectId) : null;
  const company = project?.companyId ? companyMap.get(project.companyId) ?? null : null;

  return {
    ...task,
    companyName: company?.name ?? null,
    goalName: task.goalId ? goalMap.get(task.goalId)?.title ?? null : null,
    projectName: project?.name ?? null,
  };
}

export function enrichGoal(
  goal: DashboardWorkspaceGraph["goals"][number],
  graph: DashboardWorkspaceGraph
) {
  const { projectMap, companyMap } = createMaps(graph);
  const project = goal.projectId ? projectMap.get(goal.projectId) : null;
  const company = project?.companyId ? companyMap.get(project.companyId) ?? null : null;

  return {
    ...goal,
    companyName: company?.name ?? null,
    projectName: project?.name ?? null,
  };
}

export function enrichTransaction(
  transaction: DashboardWorkspaceGraph["transactions"][number],
  graph: DashboardWorkspaceGraph
) {
  const { companyMap, projectMap } = createMaps(graph);
  const project = transaction.projectId ? projectMap.get(transaction.projectId) : null;
  const company = project?.companyId ? companyMap.get(project.companyId) ?? null : null;

  return {
    ...transaction,
    companyName: company?.name ?? null,
    projectName: project?.name ?? null,
  };
}

export function enrichInvoice(
  invoice: DashboardWorkspaceGraph["invoices"][number],
  graph: DashboardWorkspaceGraph
) {
  const { companyMap, projectMap } = createMaps(graph);
  const project = invoice.projectId ? projectMap.get(invoice.projectId) : null;
  const company = project?.companyId ? companyMap.get(project.companyId) ?? null : null;

  return {
    ...invoice,
    companyName: company?.name ?? null,
    outstanding: invoice.total - invoice.paidAmount,
    projectName: project?.name ?? null,
  };
}

export function enrichPost(
  post: DashboardWorkspaceGraph["posts"][number],
  graph: DashboardWorkspaceGraph
) {
  const { goalMap, projectMap, socialChannelMap, socialPostDetailMap, companyMap } =
    createMaps(graph);
  const project = post.projectId ? projectMap.get(post.projectId) : null;
  const company = project?.companyId ? companyMap.get(project.companyId) ?? null : null;
  const detail = socialPostDetailMap.get(post.id) ?? null;
  const deliveries = sortByDateAsc(
    graph.socialPostDeliveries
      .filter((delivery) => delivery.postId === post.id)
      .map((delivery) => {
        const channel = delivery.channelId
          ? socialChannelMap.get(delivery.channelId) ?? null
          : null;

        return {
          ...delivery,
          channelHandle: channel?.handle ?? null,
          channelName: channel?.name ?? null,
          channelStatus: channel?.status ?? null,
          provider: channel?.provider ?? null,
        };
      }),
    (delivery) => delivery.scheduledAt ?? delivery.createdAt
  );
  const channels = uniqueById(
    deliveries
      .map((delivery) =>
        delivery.channelId ? socialChannelMap.get(delivery.channelId) ?? null : null
      )
      .filter((channel): channel is NonNullable<typeof channel> => Boolean(channel))
  );
  const publishedUrls = deliveries
    .map((delivery) => delivery.externalUrl)
    .filter((value): value is string => Boolean(value));

  return {
    ...post,
    approvalNotes: detail?.approvalNotes ?? null,
    audience: detail?.audience ?? null,
    autoPublish: detail?.autoPublish ?? false,
    callToAction: detail?.callToAction ?? null,
    channels,
    companyName: company?.name ?? null,
    contentScore: detail?.contentScore ?? 0,
    deliveries,
    deliveryCount: deliveries.length,
    failedDeliveryCount: deliveries.filter((delivery) => delivery.status === "failed").length,
    goalName: post.goalId ? goalMap.get(post.goalId)?.title ?? null : null,
    lastAutomationError: detail?.lastError ?? null,
    lastSyncedAt: detail?.lastSyncedAt ?? null,
    nextPublicationAt:
      deliveries.find((delivery) => delivery.status === "scheduled")?.scheduledAt ??
      post.scheduledAt,
    objective: detail?.objective ?? null,
    platformTargets: Array.from(new Set(deliveries.map((delivery) => delivery.platform))),
    publishedDeliveryCount: deliveries.filter((delivery) => delivery.status === "published").length,
    publishedUrls,
    projectName: project?.name ?? null,
    scheduledDeliveryCount: deliveries.filter((delivery) => delivery.status === "scheduled").length,
    tone: detail?.tone ?? null,
  };
}

export function buildProjectSummary(
  project: DashboardWorkspaceGraph["projects"][number],
  graph: DashboardWorkspaceGraph
) {
  const company = getCompanyForProject(project, graph);
  const relatedContacts = getProjectContacts(project, graph);
  const relatedGoals = graph.goals.filter((goal) => goal.projectId === project.id);
  const relatedTasks = graph.tasks.filter((task) => task.projectId === project.id);
  const relatedTransactions = graph.transactions.filter(
    (transaction) => transaction.projectId === project.id
  );
  const relatedInvoices = graph.invoices.filter((invoice) => invoice.projectId === project.id);
  const relatedPosts = graph.posts.filter((post) => post.projectId === project.id);
  const income = relatedTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = relatedTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const outstanding = relatedInvoices.reduce(
    (total, invoice) => total + (invoice.total - invoice.paidAmount),
    0
  );
  const overdueTasks = relatedTasks.filter(
    (task) =>
      task.status !== "done" &&
      task.status !== "cancelled" &&
      task.dueDate &&
      new Date(task.dueDate) < new Date()
  );
  const completedTasks = relatedTasks.filter((task) => task.status === "done").length;

  return {
    ...project,
    balance: income - expense,
    company,
    companyContacts: relatedContacts,
    companyId: project.companyId ?? null,
    companyName: company?.name ?? null,
    contactCount: relatedContacts.length,
    contactNames: relatedContacts.map((contact) => contact.fullName),
    completedTasks,
    expense,
    goalAverageProgress: average(relatedGoals.map((goal) => goal.progress)),
    goals: sortByUpdatedDesc(relatedGoals).map((goal) => enrichGoal(goal, graph)),
    goalsCount: relatedGoals.length,
    income,
    invoices: sortByDateAsc(relatedInvoices, (invoice) => invoice.dueAt).map((invoice) =>
      enrichInvoice(invoice, graph)
    ),
    invoicesCount: relatedInvoices.length,
    openTasks: relatedTasks.filter(
      (task) => task.status !== "done" && task.status !== "cancelled"
    ).length,
    outstanding,
    overdueTasks: overdueTasks.length,
    posts: sortByDateDesc(relatedPosts, (post) => post.scheduledAt ?? post.createdAt).map((post) =>
      enrichPost(post, graph)
    ),
    postsCount: relatedPosts.length,
    tasks: sortByDateAsc(relatedTasks, (task) => task.dueDate ?? task.createdAt).map((task) =>
      enrichTask(task, graph)
    ),
    tasksCount: relatedTasks.length,
    transactions: sortByDateDesc(
      relatedTransactions,
      (transaction) => transaction.transactionDate ?? transaction.createdAt
    ).map((transaction) => enrichTransaction(transaction, graph)),
    transactionCount: relatedTransactions.length,
  };
}

export function buildCompanySummary(
  company: DashboardWorkspaceGraph["companies"][number],
  graph: DashboardWorkspaceGraph
): CompanySummary {
  const relatedProjects = graph.projects.filter((project) => project.companyId === company.id);
  const relatedContacts = graph.contacts.filter((contact) => contact.companyId === company.id);
  const relatedTransactions = graph.transactions.filter((transaction) =>
    relatedProjects.some((project) => project.id === transaction.projectId)
  );
  const relatedInvoices = graph.invoices.filter((invoice) =>
    relatedProjects.some((project) => project.id === invoice.projectId)
  );
  const income = relatedTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = relatedTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const outstanding = relatedInvoices.reduce(
    (total, invoice) => total + (invoice.total - invoice.paidAmount),
    0
  );

  return {
    ...company,
    balance: income - expense,
    contactCount: relatedContacts.length,
    contactNames: relatedContacts.map((contact) => contact.fullName),
    expense,
    income,
    outstanding,
    projectCount: relatedProjects.length,
    projectNames: relatedProjects.map((project) => project.name),
  };
}

export async function getDashboardData() {
  const graph = await getWorkspaceGraph();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const companySummaries = sortByUpdatedDesc(
    graph.companies.map((company) => buildCompanySummary(company, graph))
  );
  const projectSummaries = sortByUpdatedDesc(
    graph.projects.map((project) => buildProjectSummary(project, graph))
  );
  const enrichedTransactions = sortByDateDesc(
    graph.transactions.map((transaction) => enrichTransaction(transaction, graph)),
    (transaction) => transaction.transactionDate ?? transaction.createdAt
  );
  const currentMonthTransactions = enrichedTransactions.filter((transaction) => {
    const date = new Date(transaction.transactionDate);
    return date >= monthStart;
  });
  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const monthlyExpense = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const openTasks = graph.tasks.filter(
    (task) => task.status !== "done" && task.status !== "cancelled"
  );
  const trendMap = new Map<string, number>();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    trendMap.set(monthKey(date), 0);
  }

  for (const transaction of enrichedTransactions) {
    const key = monthKey(new Date(transaction.transactionDate));

    if (!trendMap.has(key)) {
      continue;
    }

    const sign = transaction.type === "expense" ? -1 : 1;
    trendMap.set(key, (trendMap.get(key) ?? 0) + sign * transaction.amount);
  }

  return {
    attentionProjects: projectSummaries
      .filter(
        (project) =>
          project.overdueTasks > 0 || project.outstanding > 0 || project.status === "blocked"
      )
      .slice(0, 4),
    companies: companySummaries,
    contacts: graph.contacts,
    goals: graph.goals.map((goal) => enrichGoal(goal, graph)),
    invoices: graph.invoices.map((invoice) => enrichInvoice(invoice, graph)),
    metrics: {
      companies: companySummaries.length,
      contacts: graph.contacts.length,
      activeProjects: projectSummaries.filter(
        (project) => project.status !== "completed" && project.status !== "cancelled"
      ).length,
      goalAverageProgress: average(graph.goals.map((goal) => goal.progress)),
      monthlyBalance: monthlyIncome - monthlyExpense,
      monthlyExpense,
      monthlyIncome,
      openTasks: openTasks.length,
      scheduledPosts: graph.posts.filter((post) => post.status === "scheduled").length,
      unpaidInvoices: graph.invoices.reduce(
        (total, invoice) => total + (invoice.total - invoice.paidAmount),
        0
      ),
    },
    orphanProjects: projectSummaries.filter((project) => !project.companyId),
    overdueTasks: sortByDateAsc(
      openTasks
        .filter((task) => task.dueDate && new Date(task.dueDate) < now)
        .map((task) => enrichTask(task, graph)),
      (task) => task.dueDate
    ).slice(0, 6),
    posts: graph.posts.map((post) => enrichPost(post, graph)),
    projects: projectSummaries.slice(0, 6),
    recentTransactions: enrichedTransactions.slice(0, 6),
    tasks: graph.tasks.map((task) => enrichTask(task, graph)),
    trendData: Array.from(trendMap.entries()).map(([key, value]) => {
      const [year, month] = key.split("-");
      return {
        name: monthLabel(new Date(Number(year), Number(month), 1)),
        value,
      };
    }),
    upcomingInvoices: sortByDateAsc(
      graph.invoices
        .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
        .map((invoice) => enrichInvoice(invoice, graph)),
      (invoice) => invoice.dueAt
    ).slice(0, 6),
    workspaceId: graph.workspaceId,
  };
}

export async function getProjectsPageData() {
  const graph = await getWorkspaceGraph();

  return {
    companies: buildOptions(graph.companies),
    projects: sortByUpdatedDesc(
      graph.projects.map((project) => buildProjectSummary(project, graph))
    ),
  };
}

export async function getProjectDetailPageData(projectId: string) {
  const graph = await getWorkspaceGraph();
  const project = graph.projects.find((row) => row.id === projectId);

  if (!project) {
    return null;
  }

  return {
    companies: buildOptions(graph.companies),
    project: buildProjectSummary(project, graph),
  };
}

export async function getGoalsPageData() {
  const graph = await getWorkspaceGraph();

  return {
    goals: sortByUpdatedDesc(graph.goals).map((goal) => enrichGoal(goal, graph)),
    projects: buildOptions(graph.projects),
  };
}

export async function getTasksPageData() {
  const graph = await getWorkspaceGraph();

  return {
    goals: buildOptions(graph.goals),
    projects: buildOptions(graph.projects),
    tasks: sortByUpdatedDesc(graph.tasks).map((task) => enrichTask(task, graph)),
  };
}

export async function getCompaniesPageData() {
  const graph = await getWorkspaceGraph();

  return {
    companies: sortByUpdatedDesc(graph.companies).map((company) =>
      buildCompanySummary(company, graph)
    ),
    contacts: buildOptions(graph.contacts.map((contact) => ({ id: contact.id, name: contact.fullName }))),
  };
}

export async function getContactsPageData() {
  const graph = await getWorkspaceGraph();
  const { companyMap } = createMaps(graph);

  return {
    companies: buildOptions(graph.companies),
    contacts: sortByUpdatedDesc(graph.contacts).map((contact) => ({
      ...contact,
      companyName: contact.companyId ? companyMap.get(contact.companyId)?.name ?? null : null,
    })),
  };
}

function normalizeBudgetKey(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function isOutflowType(type: DashboardWorkspaceGraph["transactions"][number]["type"]) {
  return type !== "income";
}

function isInDateRange(
  value: string | Date | null | undefined,
  start: string | Date | null | undefined,
  end: string | Date | null | undefined
) {
  if (!value) {
    return false;
  }

  const current = new Date(value);

  if (start && current < new Date(start)) {
    return false;
  }

  if (end && current > new Date(end)) {
    return false;
  }

  return true;
}

function aggregateBudgetBreakdown(
  transactions: ReturnType<typeof enrichTransaction>[],
  pickLabel: (transaction: ReturnType<typeof enrichTransaction>) => string
) {
  const totals = new Map<string, { name: string; transactionCount: number; value: number }>();

  for (const transaction of transactions) {
    const name = pickLabel(transaction);
    const current = totals.get(name) ?? {
      name,
      transactionCount: 0,
      value: 0,
    };

    current.transactionCount += 1;
    current.value += transaction.amount;
    totals.set(name, current);
  }

  const grandTotal = Array.from(totals.values()).reduce((total, item) => total + item.value, 0);

  return Array.from(totals.values())
    .sort((left, right) => right.value - left.value)
    .map((item) => ({
      ...item,
      share: grandTotal > 0 ? Math.round((item.value / grandTotal) * 100) : 0,
    }));
}

function budgetMatchesScope(
  budget: DashboardWorkspaceGraph["budgets"][number],
  transaction: ReturnType<typeof enrichTransaction>
) {
  if (budget.projectId) {
    return transaction.projectId === budget.projectId;
  }

  return true;
}

export async function getBudgetPageData() {
  const graph = await getWorkspaceGraph();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const quarterStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const { companyMap, projectMap } = createMaps(graph);
  const enrichedTransactions = graph.transactions.map((transaction) =>
    enrichTransaction(transaction, graph)
  );
  const incomeTransactions = enrichedTransactions.filter((transaction) => transaction.type === "income");
  const outflowTransactions = enrichedTransactions.filter((transaction) =>
    isOutflowType(transaction.type)
  );
  const totalIncome = incomeTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const totalOutflow = outflowTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const currentMonthTransactions = enrichedTransactions.filter((transaction) => {
    const date = new Date(transaction.transactionDate);
    return date >= monthStart && date < nextMonthStart;
  });
  const currentMonthIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const currentMonthOutflow = currentMonthTransactions
    .filter((transaction) => isOutflowType(transaction.type))
    .reduce((total, transaction) => total + transaction.amount, 0);
  const savingsRate =
    currentMonthIncome > 0
      ? Math.round(((currentMonthIncome - currentMonthOutflow) / currentMonthIncome) * 100)
      : 0;
  const monthlyTrendMap = new Map<
    string,
    { expense: number; income: number; name: string; net: number }
  >();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthlyTrendMap.set(monthKey(date), {
      expense: 0,
      income: 0,
      name: monthLabel(date),
      net: 0,
    });
  }

  for (const transaction of enrichedTransactions) {
    const key = monthKey(new Date(transaction.transactionDate));
    const bucket = monthlyTrendMap.get(key);

    if (!bucket) {
      continue;
    }

    if (transaction.type === "income") {
      bucket.income += transaction.amount;
      bucket.net += transaction.amount;
    } else {
      bucket.expense += transaction.amount;
      bucket.net -= transaction.amount;
    }
  }

  const quarterlyTransactions = enrichedTransactions.filter((transaction) =>
    isInDateRange(transaction.transactionDate, quarterStart, undefined)
  );
  const expenseCategories = aggregateBudgetBreakdown(
    quarterlyTransactions.filter((transaction) => isOutflowType(transaction.type)),
    (transaction) => transaction.category || "Non classe"
  ).slice(0, 8);
  const incomeCategories = aggregateBudgetBreakdown(
    quarterlyTransactions.filter((transaction) => transaction.type === "income"),
    (transaction) => transaction.category || "Non classe"
  ).slice(0, 8);
  const paymentMethods = aggregateBudgetBreakdown(
    quarterlyTransactions.filter((transaction) => isOutflowType(transaction.type)),
    (transaction) => transaction.paymentMethod || "Non precise"
  ).slice(0, 8);
  const catchAllBudgetNames = new Set(["budget", "general", "global", "principal", "main"]);
  const budgets = sortByUpdatedDesc(graph.budgets).map((budget) => {
    const normalizedBudgetName = normalizeBudgetKey(budget.name);
    const project = budget.projectId ? projectMap.get(budget.projectId) ?? null : null;
    const company = project?.companyId ? companyMap.get(project.companyId) ?? null : null;
    const scopedTransactions = enrichedTransactions.filter((transaction) => {
      if (!budgetMatchesScope(budget, transaction)) {
        return false;
      }

      return isInDateRange(transaction.transactionDate, budget.periodStart, budget.periodEnd);
    });
    const matchingTransactions = scopedTransactions.filter((transaction) => {
      if (!isOutflowType(transaction.type)) {
        return false;
      }

      if (catchAllBudgetNames.has(normalizedBudgetName)) {
        return true;
      }

      return normalizeBudgetKey(transaction.category) === normalizedBudgetName;
    });
    const actualUsed = matchingTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const remaining = budget.totalAmount - actualUsed;
    const utilization =
      budget.totalAmount > 0 ? Math.round((actualUsed / budget.totalAmount) * 100) : 0;
    const isActiveThisMonth =
      (!budget.periodStart || new Date(budget.periodStart) < nextMonthStart) &&
      (!budget.periodEnd || new Date(budget.periodEnd) >= monthStart);
    const projectName = project?.name ?? null;
    const companyName = company?.name ?? null;

    return {
      ...budget,
      actualUsed,
      companyName,
      isActiveThisMonth,
      matchingTransactionCount: matchingTransactions.length,
      progressValue: Math.max(0, Math.min(utilization, 100)),
      projectName,
      remaining,
      scopeLabel: projectName || companyName || "Global",
      status:
        actualUsed <= 0
          ? "planned"
          : budget.totalAmount <= 0 || actualUsed > budget.totalAmount
            ? "overspent"
            : utilization >= 80
              ? "at_risk"
              : "on_track",
      utilization,
    };
  });
  const activeBudgets = budgets.filter((budget) => budget.isActiveThisMonth);
  const currentBudgetPlanned = activeBudgets.reduce((total, budget) => total + budget.totalAmount, 0);
  const currentBudgetUsed = activeBudgets.reduce((total, budget) => total + budget.actualUsed, 0);
  const largestOutflows = currentMonthTransactions
    .filter((transaction) => isOutflowType(transaction.type))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 6);
  const monthlyTrend = Array.from(monthlyTrendMap.values());
  const monthlySnapshots = [...monthlyTrend].reverse();

  return {
    budgets,
    companies: buildOptions(graph.companies),
    projects: buildOptions(graph.projects),
    summary: {
      activeBudgetCount: activeBudgets.length,
      averageExpenseTicket:
        outflowTransactions.length > 0
          ? Math.round(totalOutflow / outflowTransactions.length)
          : 0,
      balance: totalIncome - totalOutflow,
      budgetCoverage:
        currentBudgetPlanned > 0
          ? Math.round((currentBudgetUsed / currentBudgetPlanned) * 100)
          : 0,
      currentBudgetPlanned,
      currentBudgetRemaining: currentBudgetPlanned - currentBudgetUsed,
      currentBudgetUsed,
      currentMonthBalance: currentMonthIncome - currentMonthOutflow,
      currentMonthExpense: currentMonthOutflow,
      currentMonthIncome,
      expense: totalOutflow,
      income: totalIncome,
      savingsRate,
      transactionCount: enrichedTransactions.length,
    },
    expenseCategories,
    incomeCategories,
    largestOutflows,
    monthlySnapshots,
    paymentMethods,
    transactions: enrichedTransactions,
    trendData: monthlyTrend,
  };
}

export async function getFinancesPageData() {
  return getBudgetPageData();
}

export async function getInvoicesPageData() {
  const graph = await getWorkspaceGraph();

  return {
    companies: buildOptions(graph.companies),
    invoices: graph.invoices.map((invoice) => enrichInvoice(invoice, graph)),
    projects: buildOptions(graph.projects),
  };
}

export async function getSocialPostsPageData() {
  const graph = await getWorkspaceGraph();
  const maps = createMaps(graph);
  const posts = sortByUpdatedDesc(graph.posts).map((post) => enrichPost(post, graph));
  const deliveries = sortByDateAsc(
    graph.socialPostDeliveries.map((delivery) => {
      const post = graph.posts.find((row) => row.id === delivery.postId) ?? null;
      const channel = delivery.channelId ? maps.socialChannelMap.get(delivery.channelId) ?? null : null;

      return {
        ...delivery,
        channelName: channel?.name ?? null,
        externalHandle: channel?.handle ?? null,
        postTitle: post?.title ?? "Post supprime",
      };
    }),
    (delivery) => delivery.scheduledAt ?? delivery.createdAt
  );
  const channels = sortByUpdatedDesc(graph.socialChannels).map((channel) => {
    const relatedDeliveries = graph.socialPostDeliveries.filter(
      (delivery) => delivery.channelId === channel.id
    );

    return {
      ...channel,
      failedCount: relatedDeliveries.filter((delivery) => delivery.status === "failed").length,
      lastDeliveryAt:
        relatedDeliveries
          .map((delivery) => delivery.publishedAt ?? delivery.scheduledAt)
          .filter((value): value is Date => value instanceof Date)
          .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
      publishedCount: relatedDeliveries.filter((delivery) => delivery.status === "published").length,
      scheduledCount: relatedDeliveries.filter((delivery) => delivery.status === "scheduled").length,
    };
  });
  const engagementSortedPosts = [...posts].sort(
    (left, right) => right.likes + right.comments + right.shares - (left.likes + left.comments + left.shares)
  );

  return {
    calendar: deliveries,
    channels,
    channelOptions: channels.map((channel) => ({
      id: channel.id,
      label: `${channel.name} (${channel.platform})`,
    })),
    deliveryQueue: deliveries.filter((delivery) =>
      ["scheduled", "failed", "processing"].includes(delivery.status)
    ),
    goals: buildOptions(graph.goals),
    posts,
    projects: buildOptions(graph.projects),
    summary: {
      autoPublishPosts: posts.filter((post) => post.autoPublish).length,
      connectedChannels: channels.filter((channel) => channel.status === "connected").length,
      draftPosts: posts.filter((post) => ["idea", "drafted", "approved"].includes(post.status)).length,
      failedDeliveries: deliveries.filter((delivery) => delivery.status === "failed").length,
      publishedPosts: posts.filter((post) => post.status === "published").length,
      scheduledDeliveries: deliveries.filter((delivery) => delivery.status === "scheduled").length,
      totalEngagement: posts.reduce(
        (total, post) => total + post.likes + post.comments + post.shares,
        0
      ),
      totalLeads: posts.reduce((total, post) => total + post.leadsGenerated, 0),
      totalPosts: posts.length,
    },
    topPerformers: engagementSortedPosts.slice(0, 5),
  };
}

import {
  buildOptions,
  createMaps,
  getWorkspaceGraph,
  scopeWorkspaceGraphToActivity,
  type DashboardWorkspaceGraph,
} from "@/lib/data/dashboard/graph";
import {
  buildActivitySummary,
  buildProjectSummary,
  enrichGoal,
  enrichInvoice,
  enrichPost,
  enrichTask,
  enrichTransaction,
} from "@/lib/data/dashboard/models";
import {
  average,
  monthKey,
  monthLabel,
  sortByDateAsc,
  sortByUpdatedDesc,
  startOfMonth,
} from "@/lib/data/dashboard/utils";
import { getWorkspaceContext } from "@/lib/auth/server";

async function getScopedWorkspaceData() {
  const [{ activeActivity }, graph] = await Promise.all([
    getWorkspaceContext(),
    getWorkspaceGraph(),
  ]);
  const scopedGraph = scopeWorkspaceGraphToActivity(
    graph,
    activeActivity?.id ?? null
  );

  return {
    activeActivity,
    graph,
    scopedGraph,
  };
}

export async function getDashboardData() {
  const { scopedGraph } = await getScopedWorkspaceData();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const activitySummaries = sortByUpdatedDesc(
    scopedGraph.activities.map((activity) => buildActivitySummary(activity, scopedGraph))
  );
  const projectSummaries = sortByUpdatedDesc(
    scopedGraph.projects.map((project) => buildProjectSummary(project, scopedGraph))
  );
  const currentMonthTransactions = scopedGraph.transactions.filter((transaction) => {
    const date = new Date(transaction.transactionDate);
    return date >= monthStart;
  });
  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const monthlyExpense = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const openTasks = scopedGraph.tasks.filter(
    (task) => task.status !== "done" && task.status !== "cancelled"
  );
  const trendMap = new Map<string, number>();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    trendMap.set(monthKey(date), 0);
  }

  for (const transaction of scopedGraph.transactions) {
    const key = monthKey(new Date(transaction.transactionDate));

    if (!trendMap.has(key)) {
      continue;
    }

    const sign = transaction.type === "expense" ? -1 : 1;
    trendMap.set(key, (trendMap.get(key) ?? 0) + sign * transaction.amount);
  }

  return {
    activities: activitySummaries,
    attentionProjects: projectSummaries
      .filter(
        (project) =>
          project.overdueTasks > 0 || project.outstanding > 0 || project.status === "blocked"
      )
      .slice(0, 4),
    clients: scopedGraph.clients,
    goals: scopedGraph.goals.map((goal) => enrichGoal(goal, scopedGraph)),
    invoices: scopedGraph.invoices.map((invoice) => enrichInvoice(invoice, scopedGraph)),
    metrics: {
      activeActivities: activitySummaries.filter((activity) => activity.status === "active")
        .length,
      activeProjects: projectSummaries.filter(
        (project) => project.status !== "completed" && project.status !== "cancelled"
      ).length,
      clients: scopedGraph.clients.length,
      goalAverageProgress: average(scopedGraph.goals.map((goal) => goal.progress)),
      monthlyBalance: monthlyIncome - monthlyExpense,
      monthlyExpense,
      monthlyIncome,
      openTasks: openTasks.length,
      scheduledPosts: scopedGraph.posts.filter((post) => post.status === "scheduled").length,
      unpaidInvoices: scopedGraph.invoices.reduce(
        (total, invoice) => total + (invoice.total - invoice.paidAmount),
        0
      ),
    },
    orphanProjects: projectSummaries.filter((project) => !project.activityId),
    overdueTasks: sortByDateAsc(
      openTasks
        .filter((task) => task.dueDate && new Date(task.dueDate) < now)
        .map((task) => enrichTask(task, scopedGraph)),
      (task) => task.dueDate
    ).slice(0, 6),
    posts: scopedGraph.posts.map((post) => enrichPost(post, scopedGraph)),
    projects: projectSummaries.slice(0, 6),
    recentTransactions: scopedGraph.transactions
      .slice(0, 6)
      .map((transaction) => enrichTransaction(transaction, scopedGraph)),
    tasks: scopedGraph.tasks.map((task) => enrichTask(task, scopedGraph)),
    trendData: Array.from(trendMap.entries()).map(([key, value]) => {
      const [year, month] = key.split("-");
      return {
        name: monthLabel(new Date(Number(year), Number(month), 1)),
        value,
      };
    }),
    upcomingInvoices: sortByDateAsc(
      scopedGraph.invoices
        .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
        .map((invoice) => enrichInvoice(invoice, scopedGraph)),
      (invoice) => invoice.dueAt
    ).slice(0, 6),
    workspaceId: scopedGraph.workspaceId,
  };
}

export async function getActivitiesPageData() {
  const graph = await getWorkspaceGraph();

  return {
    activities: sortByUpdatedDesc(
      graph.activities.map((activity) => buildActivitySummary(activity, graph))
    ),
  };
}

export async function getActivityDetailPageData(activityId: string) {
  const graph = await getWorkspaceGraph();
  const activity = graph.activities.find((row) => row.id === activityId);

  if (!activity) {
    return null;
  }

  return {
    activity: buildActivitySummary(activity, graph),
    clients: buildOptions(graph.clients),
    projects: buildOptions(
      graph.projects.filter((project) => project.activityId === activityId)
    ),
  };
}

export async function getProjectsPageData() {
  const { scopedGraph } = await getScopedWorkspaceData();

  return {
    activities: buildOptions(scopedGraph.activities),
    clients: buildOptions(scopedGraph.clients),
    projects: sortByUpdatedDesc(
      scopedGraph.projects.map((project) => buildProjectSummary(project, scopedGraph))
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
    clients: buildOptions(graph.clients),
    project: buildProjectSummary(project, graph),
  };
}

export async function getGoalsPageData() {
  const { scopedGraph } = await getScopedWorkspaceData();

  return {
    activities: buildOptions(scopedGraph.activities),
    goals: sortByUpdatedDesc(scopedGraph.goals).map((goal) => enrichGoal(goal, scopedGraph)),
    projects: buildOptions(scopedGraph.projects),
  };
}

export async function getTasksPageData() {
  const { scopedGraph } = await getScopedWorkspaceData();

  return {
    activities: buildOptions(scopedGraph.activities),
    goals: buildOptions(scopedGraph.goals),
    projects: buildOptions(scopedGraph.projects),
    tasks: sortByUpdatedDesc(scopedGraph.tasks).map((task) => enrichTask(task, scopedGraph)),
  };
}

export async function getClientsPageData() {
  const { scopedGraph } = await getScopedWorkspaceData();
  const activityOptions = buildOptions(scopedGraph.activities);
  const projectOptions = buildOptions(scopedGraph.projects);
  const activityMap = createMaps(scopedGraph).activityMap;
  const projectMap = createMaps(scopedGraph).projectMap;

  return {
    activities: activityOptions,
    clients: sortByUpdatedDesc(scopedGraph.clients).map((client) => {
      const relatedActivityIds = new Set<string>();
      const relatedProjectIds = new Set<string>();

      for (const link of scopedGraph.activityClients) {
        if (link.clientId === client.id) {
          relatedActivityIds.add(link.activityId);
        }
      }

      for (const project of scopedGraph.projects) {
        if (project.clientId === client.id) {
          relatedProjectIds.add(project.id);

          if (project.activityId) {
            relatedActivityIds.add(project.activityId);
          }
        }
      }

      for (const link of scopedGraph.projectClients) {
        if (link.clientId === client.id) {
          relatedProjectIds.add(link.projectId);

          const project = projectMap.get(link.projectId);
          if (project?.activityId) {
            relatedActivityIds.add(project.activityId);
          }
        }
      }

      const relatedActivities = Array.from(relatedActivityIds)
        .map((id) => activityMap.get(id))
        .filter((activity): activity is NonNullable<typeof activity> => Boolean(activity));
      const relatedProjects = Array.from(relatedProjectIds)
        .map((id) => projectMap.get(id))
        .filter((project): project is NonNullable<typeof project> => Boolean(project));

      return {
        ...client,
        activityNames: relatedActivities.map((activity) => activity.name),
        projectsCount: relatedProjects.length,
        projectNames: relatedProjects.map((project) => project.name),
      };
    }),
    projects: projectOptions,
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
  const totals = new Map<
    string,
    { name: string; transactionCount: number; value: number }
  >();

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

  const grandTotal = Array.from(totals.values()).reduce(
    (total, item) => total + item.value,
    0
  );

  return Array.from(totals.values())
    .sort((left, right) => right.value - left.value)
    .map((item) => ({
      ...item,
      share: grandTotal > 0 ? Math.round((item.value / grandTotal) * 100) : 0,
    }));
}

function budgetMatchesScope(
  budget: DashboardWorkspaceGraph["budgets"][number],
  transaction: ReturnType<typeof enrichTransaction>,
  graph: DashboardWorkspaceGraph
) {
  const { projectMap } = createMaps(graph);

  if (budget.projectId) {
    return transaction.projectId === budget.projectId;
  }

  if (budget.activityId) {
    if (transaction.activityId === budget.activityId) {
      return true;
    }

    if (!transaction.projectId) {
      return false;
    }

    return projectMap.get(transaction.projectId)?.activityId === budget.activityId;
  }

  return true;
}

export async function getBudgetPageData() {
  const { scopedGraph } = await getScopedWorkspaceData();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const quarterStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const { activityMap, projectMap } = createMaps(scopedGraph);
  const enrichedTransactions = scopedGraph.transactions.map((transaction) =>
    enrichTransaction(transaction, scopedGraph)
  );
  const incomeTransactions = enrichedTransactions.filter(
    (transaction) => transaction.type === "income"
  );
  const outflowTransactions = enrichedTransactions.filter((transaction) =>
    isOutflowType(transaction.type)
  );
  const totalIncome = incomeTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );
  const totalOutflow = outflowTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );
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
  const budgets = sortByUpdatedDesc(scopedGraph.budgets).map((budget) => {
    const normalizedBudgetName = normalizeBudgetKey(budget.name);
    const scopedTransactions = enrichedTransactions.filter((transaction) => {
      if (!budgetMatchesScope(budget, transaction, scopedGraph)) {
        return false;
      }

      return isInDateRange(
        transaction.transactionDate,
        budget.periodStart,
        budget.periodEnd
      );
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
    const actualUsed = matchingTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    const remaining = budget.totalAmount - actualUsed;
    const utilization =
      budget.totalAmount > 0 ? Math.round((actualUsed / budget.totalAmount) * 100) : 0;
    const isActiveThisMonth =
      (!budget.periodStart || new Date(budget.periodStart) < nextMonthStart) &&
      (!budget.periodEnd || new Date(budget.periodEnd) >= monthStart);
    const projectName = budget.projectId ? projectMap.get(budget.projectId)?.name ?? null : null;
    const activityName = (() => {
      const direct = budget.activityId ? activityMap.get(budget.activityId)?.name ?? null : null;
      if (direct) return direct;
      if (projectName && budget.projectId) {
        const proj = projectMap.get(budget.projectId);
        const projActivityId = proj?.activityId ?? null;
        return projActivityId ? activityMap.get(projActivityId)?.name ?? null : null;
      }
      return null;
    })();

    return {
      ...budget,
      activityName,
      actualUsed,
      isActiveThisMonth,
      matchingTransactionCount: matchingTransactions.length,
      progressValue: Math.max(0, Math.min(utilization, 100)),
      projectName,
      remaining,
      scopeLabel: projectName || activityName || "Global",
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
  const currentBudgetPlanned = activeBudgets.reduce(
    (total, budget) => total + budget.totalAmount,
    0
  );
  const currentBudgetUsed = activeBudgets.reduce(
    (total, budget) => total + budget.actualUsed,
    0
  );
  const largestOutflows = currentMonthTransactions
    .filter((transaction) => isOutflowType(transaction.type))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 6);
  const monthlyTrend = Array.from(monthlyTrendMap.values());
  const monthlySnapshots = [...monthlyTrend].reverse();

  return {
    activities: buildOptions(scopedGraph.activities),
    budgets,
    clients: buildOptions(scopedGraph.clients),
    projects: buildOptions(scopedGraph.projects),
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
  const { scopedGraph } = await getScopedWorkspaceData();

  return {
    clients: buildOptions(scopedGraph.clients),
    invoices: scopedGraph.invoices.map((invoice) => enrichInvoice(invoice, scopedGraph)),
    projects: buildOptions(scopedGraph.projects),
  };
}

export async function getSocialPostsPageData() {
  const { scopedGraph } = await getScopedWorkspaceData();
  const maps = createMaps(scopedGraph);
  const posts = sortByUpdatedDesc(scopedGraph.posts).map((post) =>
    enrichPost(post, scopedGraph)
  );
  const deliveries = sortByDateAsc(
    scopedGraph.socialPostDeliveries.map((delivery) => {
      const post = scopedGraph.posts.find((row) => row.id === delivery.postId) ?? null;
      const channel = delivery.channelId
        ? maps.socialChannelMap.get(delivery.channelId) ?? null
        : null;

      return {
        ...delivery,
        channelName: channel?.name ?? null,
        externalHandle: channel?.handle ?? null,
        postTitle: post?.title ?? "Post supprimé",
      };
    }),
    (delivery) => delivery.scheduledAt ?? delivery.createdAt
  );
  const channels = sortByUpdatedDesc(scopedGraph.socialChannels).map((channel) => {
    const relatedDeliveries = scopedGraph.socialPostDeliveries.filter(
      (delivery) => delivery.channelId === channel.id
    );

    return {
      ...channel,
      failedCount: relatedDeliveries.filter((delivery) => delivery.status === "failed").length,
      lastDeliveryAt: relatedDeliveries
        .map((delivery) => delivery.publishedAt ?? delivery.scheduledAt)
        .filter((value): value is Date => value instanceof Date)
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
      publishedCount: relatedDeliveries.filter((delivery) => delivery.status === "published")
        .length,
      scheduledCount: relatedDeliveries.filter((delivery) => delivery.status === "scheduled")
        .length,
    };
  });
  const engagementSortedPosts = [...posts].sort(
      (left, right) =>
      right.likes +
      right.comments +
      right.shares -
      (left.likes + left.comments + left.shares)
  );

  return {
    activities: buildOptions(scopedGraph.activities),
    calendar: deliveries,
    channels,
    channelOptions: channels.map((channel) => ({
      id: channel.id,
      label: `${channel.name} (${channel.platform})`,
    })),
    deliveryQueue: deliveries.filter((delivery) =>
      ["scheduled", "failed", "processing"].includes(delivery.status)
    ),
    goals: buildOptions(scopedGraph.goals),
    posts,
    projects: buildOptions(scopedGraph.projects),
    summary: {
      autoPublishPosts: posts.filter((post) => post.autoPublish).length,
      connectedChannels: channels.filter((channel) => channel.status === "connected").length,
      draftPosts: posts.filter((post) =>
        ["idea", "drafted", "approved"].includes(post.status)
      ).length,
      failedDeliveries: deliveries.filter((delivery) => delivery.status === "failed").length,
      publishedPosts: posts.filter((post) => post.status === "published").length,
      scheduledDeliveries: deliveries.filter((delivery) => delivery.status === "scheduled")
        .length,
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

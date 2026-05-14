import {
  createMaps,
  getActivityClientIds,
  getProjectClientIds,
  getProjectIdsForActivity,
  type DashboardWorkspaceGraph,
} from "@/lib/data/dashboard/graph";
import {
  average,
  sortByDateAsc,
  sortByDateDesc,
  sortByUpdatedDesc,
  uniqueById,
} from "@/lib/data/dashboard/utils";

export function enrichTask(
  task: DashboardWorkspaceGraph["tasks"][number],
  graph: DashboardWorkspaceGraph
) {
  const { activityMap, goalMap, projectMap } = createMaps(graph);
  const project = task.projectId ? projectMap.get(task.projectId) : null;
  const activity =
    (task.activityId ? activityMap.get(task.activityId) : null) ??
    (project?.activityId ? activityMap.get(project.activityId) : null);

  return {
    ...task,
    activityName: activity?.name ?? null,
    goalName: task.goalId ? goalMap.get(task.goalId)?.title ?? null : null,
    projectName: project?.name ?? null,
  };
}

export function enrichGoal(
  goal: DashboardWorkspaceGraph["goals"][number],
  graph: DashboardWorkspaceGraph
) {
  const { activityMap, projectMap } = createMaps(graph);
  const project = goal.projectId ? projectMap.get(goal.projectId) : null;
  const activity =
    (goal.activityId ? activityMap.get(goal.activityId) : null) ??
    (project?.activityId ? activityMap.get(project.activityId) : null);

  return {
    ...goal,
    activityName: activity?.name ?? null,
    projectName: project?.name ?? null,
  };
}

export function enrichTransaction(
  transaction: DashboardWorkspaceGraph["transactions"][number],
  graph: DashboardWorkspaceGraph
) {
  const { activityMap, clientMap, projectMap } = createMaps(graph);
  const project = transaction.projectId ? projectMap.get(transaction.projectId) : null;
  const activity =
    (transaction.activityId ? activityMap.get(transaction.activityId) : null) ??
    (project?.activityId ? activityMap.get(project.activityId) : null);

  return {
    ...transaction,
    activityName: activity?.name ?? null,
    clientName: transaction.clientId ? clientMap.get(transaction.clientId)?.name ?? null : null,
    projectName: project?.name ?? null,
  };
}

export function enrichInvoice(
  invoice: DashboardWorkspaceGraph["invoices"][number],
  graph: DashboardWorkspaceGraph
) {
  const { activityMap, clientMap, projectMap } = createMaps(graph);
  const project = invoice.projectId ? projectMap.get(invoice.projectId) : null;
  const activity = project?.activityId ? activityMap.get(project.activityId) : null;

  return {
    ...invoice,
    activityName: activity?.name ?? null,
    clientName: invoice.clientId ? clientMap.get(invoice.clientId)?.name ?? null : null,
    outstanding: invoice.total - invoice.paidAmount,
    projectName: project?.name ?? null,
  };
}

export function enrichPost(
  post: DashboardWorkspaceGraph["posts"][number],
  graph: DashboardWorkspaceGraph
) {
  const { activityMap, goalMap, projectMap } = createMaps(graph);
  const project = post.projectId ? projectMap.get(post.projectId) : null;
  const activity =
    (post.activityId ? activityMap.get(post.activityId) : null) ??
    (project?.activityId ? activityMap.get(project.activityId) : null);

  return {
    ...post,
    activityName: activity?.name ?? null,
    goalName: post.goalId ? goalMap.get(post.goalId)?.title ?? null : null,
    projectName: project?.name ?? null,
  };
}

export function buildProjectSummary(
  project: DashboardWorkspaceGraph["projects"][number],
  graph: DashboardWorkspaceGraph
) {
  const { activityMap, clientMap } = createMaps(graph);
  const clientIds = getProjectClientIds(project.id, graph);
  const relatedClients = uniqueById(
    Array.from(clientIds)
      .map((clientId) => clientMap.get(clientId))
      .filter((client): client is NonNullable<typeof client> => Boolean(client))
  );
  const relatedGoals = graph.goals.filter((goal) => goal.projectId === project.id);
  const relatedTasks = graph.tasks.filter((task) => task.projectId === project.id);
  const relatedTransactions = graph.transactions.filter(
    (transaction) => transaction.projectId === project.id
  );
  const relatedInvoices = graph.invoices.filter((invoice) => invoice.projectId === project.id);
  const relatedPosts = graph.posts.filter((post) => post.projectId === project.id);
  const activity = project.activityId ? activityMap.get(project.activityId) : null;
  const income = relatedTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = relatedTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const overdueTasks = relatedTasks.filter(
    (task) =>
      task.status !== "done" &&
      task.status !== "cancelled" &&
      task.dueDate &&
      new Date(task.dueDate) < new Date()
  );
  const completedTasks = relatedTasks.filter((task) => task.status === "done").length;
  const outstanding = relatedInvoices.reduce(
    (total, invoice) => total + (invoice.total - invoice.paidAmount),
    0
  );

  return {
    ...project,
    activityName: activity?.name ?? null,
    balance: income - expense,
    clientCount: relatedClients.length,
    clientName: relatedClients[0]?.name ?? null,
    clientNames: relatedClients.map((client) => client.name),
    clients: relatedClients,
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

export function buildActivitySummary(
  activity: DashboardWorkspaceGraph["activities"][number],
  graph: DashboardWorkspaceGraph
) {
  const projectIds = getProjectIdsForActivity(activity.id, graph);
  const relatedProjects = graph.projects.filter((project) => project.activityId === activity.id);
  const relatedGoals = graph.goals.filter(
    (goal) =>
      goal.activityId === activity.id ||
      (goal.projectId ? projectIds.has(goal.projectId) : false)
  );
  const relatedTasks = graph.tasks.filter(
    (task) =>
      task.activityId === activity.id ||
      (task.projectId ? projectIds.has(task.projectId) : false)
  );
  const relatedTransactions = graph.transactions.filter(
    (transaction) =>
      transaction.activityId === activity.id ||
      (transaction.projectId ? projectIds.has(transaction.projectId) : false)
  );
  const relatedInvoices = graph.invoices.filter(
    (invoice) => invoice.projectId && projectIds.has(invoice.projectId)
  );
  const relatedPosts = graph.posts.filter(
    (post) =>
      post.activityId === activity.id ||
      (post.projectId ? projectIds.has(post.projectId) : false)
  );
  const clientIds = getActivityClientIds(activity.id, graph);
  const { clientMap } = createMaps(graph);
  const relatedClients = uniqueById(
    Array.from(clientIds)
      .map((clientId) => clientMap.get(clientId))
      .filter((client): client is NonNullable<typeof client> => Boolean(client))
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
  const openTasks = relatedTasks.filter(
    (task) => task.status !== "done" && task.status !== "cancelled"
  );
  const overdueTasks = openTasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date()
  );
  const activeProjects = relatedProjects.filter(
    (project) => project.status !== "completed" && project.status !== "cancelled"
  );

  return {
    ...activity,
    activeProjects: activeProjects.length,
    balance: income - expense,
    clientCount: relatedClients.length,
    clients: relatedClients,
    expense,
    goalAverageProgress: average(relatedGoals.map((goal) => goal.progress)),
    goals: sortByUpdatedDesc(relatedGoals).map((goal) => enrichGoal(goal, graph)),
    goalsCount: relatedGoals.length,
    income,
    invoices: sortByDateAsc(relatedInvoices, (invoice) => invoice.dueAt).map((invoice) =>
      enrichInvoice(invoice, graph)
    ),
    invoicesCount: relatedInvoices.length,
    openTasks: openTasks.length,
    outstanding,
    overdueTasks: overdueTasks.length,
    posts: sortByDateDesc(relatedPosts, (post) => post.scheduledAt ?? post.createdAt).map((post) =>
      enrichPost(post, graph)
    ),
    postsCount: relatedPosts.length,
    projects: sortByUpdatedDesc(relatedProjects).map((project) => buildProjectSummary(project, graph)),
    projectsCount: relatedProjects.length,
    tasks: sortByDateAsc(relatedTasks, (task) => task.dueDate ?? task.createdAt).map((task) =>
      enrichTask(task, graph)
    ),
    totalBudgetPlanned: relatedProjects.reduce(
      (total, project) => total + project.budgetPlanned,
      0
    ),
    totalBudgetUsed: relatedProjects.reduce((total, project) => total + project.budgetUsed, 0),
    transactionCount: relatedTransactions.length,
    transactions: sortByDateDesc(
      relatedTransactions,
      (transaction) => transaction.transactionDate ?? transaction.createdAt
    ).map((transaction) => enrichTransaction(transaction, graph)),
  };
}

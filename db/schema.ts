import {
  pgEnum,
  pgSchema,
  pgTable,
  text,
  uuid,
  varchar,
  integer,
  boolean,
  numeric,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Supabase Auth schema
 * On déclare seulement ce dont on a besoin pour les références.
 */
export const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

/**
 * Enums
 */

export const workspaceType = pgEnum("workspace_type", [
  "personal",
  "team",
  "company",
  "agency",
]);

export const workspaceRole = pgEnum("workspace_role", [
  "owner",
  "admin",
  "manager",
  "member",
  "viewer",
]);

export const workspaceMemberStatus = pgEnum("workspace_member_status", [
  "active",
  "invited",
  "suspended",
  "removed",
]);

export const activityStatus = pgEnum("activity_status", [
  "active",
  "paused",
  "completed",
  "archived",
]);

export const projectStatus = pgEnum("project_status", [
  "idea",
  "planned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "cancelled",
]);

export const projectPriority = pgEnum("project_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const goalType = pgEnum("goal_type", [
  "quantitative",
  "financial",
  "project",
  "content",
  "personal",
  "commercial",
  "administrative",
  "learning",
]);

export const goalStatus = pgEnum("goal_status", [
  "not_started",
  "in_progress",
  "achieved",
  "failed",
  "cancelled",
]);

export const taskPriority = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskStatus = pgEnum("task_status", [
  "todo",
  "in_progress",
  "waiting",
  "done",
  "cancelled",
]);

export const clientStatus = pgEnum("client_status", [
  "prospect",
  "contacted",
  "negotiating",
  "active",
  "inactive",
  "lost",
]);

export const transactionType = pgEnum("transaction_type", [
  "income",
  "expense",
  "investment",
  "debt",
]);

export const invoiceStatus = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "partially_paid",
  "overdue",
  "cancelled",
]);

export const socialPlatform = pgEnum("social_platform", [
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "x",
  "other",
]);

export const socialStatus = pgEnum("social_status", [
  "idea",
  "drafted",
  "approved",
  "scheduled",
  "published",
  "cancelled",
]);

export const socialChannelProvider = pgEnum("social_channel_provider", [
  "manual",
  "webhook",
]);

export const socialChannelStatus = pgEnum("social_channel_status", [
  "draft",
  "connected",
  "attention",
  "disabled",
]);

export const socialDeliveryStatus = pgEnum("social_delivery_status", [
  "draft",
  "scheduled",
  "processing",
  "published",
  "failed",
  "cancelled",
]);

export const reportPeriodType = pgEnum("report_period_type", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom",
]);

export const storageBucket = pgEnum("storage_bucket", [
  "avatars",
  "workspace_logos",
  "attachments",
  "invoice_files",
  "social_post_media",
  "project_documents",
]);

/**
 * Core SaaS tables
 */

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    bio: text("bio"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("profiles_user_id_idx").on(table.userId),
    index("profiles_email_idx").on(table.email),
  ]
);

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ownerId: uuid("owner_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    type: workspaceType("type").notNull().default("personal"),
    description: text("description"),
    logoUrl: text("logo_url"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("workspaces_owner_id_idx").on(table.ownerId),
  ]
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    role: workspaceRole("role").notNull().default("member"),
    status: workspaceMemberStatus("status").notNull().default("active"),

    invitedBy: uuid("invited_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),

    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspace_members_workspace_user_unique").on(
      table.workspaceId,
      table.userId
    ),
    index("workspace_members_workspace_id_idx").on(table.workspaceId),
    index("workspace_members_user_id_idx").on(table.userId),
  ]
);

/**
 * Business tables
 */

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    color: text("color"),

    status: activityStatus("status").notNull().default("active"),

    startDate: date("start_date"),
    targetDate: date("target_date"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("activities_workspace_id_idx").on(table.workspaceId),
    index("activities_created_by_idx").on(table.createdBy),
    index("activities_status_idx").on(table.status),
  ]
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    name: text("name").notNull(),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    website: text("website"),

    status: clientStatus("status").notNull().default("prospect"),
    source: text("source"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("clients_workspace_id_idx").on(table.workspaceId),
    index("clients_created_by_idx").on(table.createdBy),
    index("clients_status_idx").on(table.status),
    index("clients_email_idx").on(table.email),
  ]
);

export const activityClients = pgTable(
  "activity_clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),

    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("activity_clients_activity_client_unique").on(
      table.activityId,
      table.clientId
    ),
    index("activity_clients_workspace_id_idx").on(table.workspaceId),
    index("activity_clients_created_by_idx").on(table.createdBy),
    index("activity_clients_activity_id_idx").on(table.activityId),
    index("activity_clients_client_id_idx").on(table.clientId),
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),

    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),
    description: text("description"),

    status: projectStatus("status").notNull().default("idea"),
    priority: projectPriority("priority").notNull().default("medium"),

    startDate: date("start_date"),
    dueDate: date("due_date"),

    progress: integer("progress").notNull().default(0),

    budgetPlanned: numeric("budget_planned", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    budgetUsed: numeric("budget_used", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("projects_workspace_id_idx").on(table.workspaceId),
    index("projects_created_by_idx").on(table.createdBy),
    index("projects_activity_id_idx").on(table.activityId),
    index("projects_client_id_idx").on(table.clientId),
    index("projects_status_idx").on(table.status),
    index("projects_priority_idx").on(table.priority),
  ]
);

export const projectClients = pgTable(
  "project_clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("project_clients_project_client_unique").on(
      table.projectId,
      table.clientId
    ),
    index("project_clients_workspace_id_idx").on(table.workspaceId),
    index("project_clients_created_by_idx").on(table.createdBy),
    index("project_clients_project_id_idx").on(table.projectId),
    index("project_clients_client_id_idx").on(table.clientId),
  ]
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),
    description: text("description"),

    goalType: goalType("goal_type").notNull().default("quantitative"),

    targetValue: numeric("target_value", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    currentValue: numeric("current_value", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    unit: text("unit"),
    progress: integer("progress").notNull().default(0),

    status: goalStatus("status").notNull().default("not_started"),

    startDate: date("start_date"),
    deadline: date("deadline"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("goals_workspace_id_idx").on(table.workspaceId),
    index("goals_created_by_idx").on(table.createdBy),
    index("goals_activity_id_idx").on(table.activityId),
    index("goals_project_id_idx").on(table.projectId),
    index("goals_status_idx").on(table.status),
    index("goals_deadline_idx").on(table.deadline),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    goalId: uuid("goal_id").references(() => goals.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),
    description: text("description"),

    status: taskStatus("status").notNull().default("todo"),
    priority: taskPriority("priority").notNull().default("medium"),

    plannedDate: date("planned_date"),
    dueDate: date("due_date"),

    completedAt: timestamp("completed_at", { withTimezone: true }),

    estimatedMinutes: integer("estimated_minutes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tasks_workspace_id_idx").on(table.workspaceId),
    index("tasks_created_by_idx").on(table.createdBy),
    index("tasks_activity_id_idx").on(table.activityId),
    index("tasks_project_id_idx").on(table.projectId),
    index("tasks_goal_id_idx").on(table.goalId),
    index("tasks_status_idx").on(table.status),
    index("tasks_priority_idx").on(table.priority),
    index("tasks_due_date_idx").on(table.dueDate),
  ]
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),

    type: transactionType("type").notNull().default("income"),
    category: text("category"),

    amount: numeric("amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    transactionDate: date("transaction_date").notNull().defaultNow(),

    paymentMethod: text("payment_method"),
    description: text("description"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("transactions_workspace_id_idx").on(table.workspaceId),
    index("transactions_created_by_idx").on(table.createdBy),
    index("transactions_activity_id_idx").on(table.activityId),
    index("transactions_project_id_idx").on(table.projectId),
    index("transactions_client_id_idx").on(table.clientId),
    index("transactions_type_idx").on(table.type),
    index("transactions_transaction_date_idx").on(table.transactionDate),
  ]
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),

    totalAmount: numeric("total_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    usedAmount: numeric("used_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    periodStart: date("period_start"),
    periodEnd: date("period_end"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("budgets_workspace_id_idx").on(table.workspaceId),
    index("budgets_created_by_idx").on(table.createdBy),
    index("budgets_activity_id_idx").on(table.activityId),
    index("budgets_project_id_idx").on(table.projectId),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    invoiceNumber: text("invoice_number").notNull(),

    status: invoiceStatus("status").notNull().default("draft"),

    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    subtotal: numeric("subtotal", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    taxAmount: numeric("tax_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    total: numeric("total", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    paidAmount: numeric("paid_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    issuedAt: date("issued_at"),
    dueAt: date("due_at"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("invoices_workspace_invoice_number_unique").on(
      table.workspaceId,
      table.invoiceNumber
    ),
    index("invoices_workspace_id_idx").on(table.workspaceId),
    index("invoices_created_by_idx").on(table.createdBy),
    index("invoices_client_id_idx").on(table.clientId),
    index("invoices_project_id_idx").on(table.projectId),
    index("invoices_status_idx").on(table.status),
    index("invoices_due_at_idx").on(table.dueAt),
  ]
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),

    description: text("description").notNull(),

    quantity: numeric("quantity", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(1),

    unitPrice: numeric("unit_price", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    total: numeric("total", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("invoice_items_invoice_id_idx").on(table.invoiceId)]
);

export const socialPosts = pgTable(
  "social_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    goalId: uuid("goal_id").references(() => goals.id, {
      onDelete: "set null",
    }),

    platform: socialPlatform("platform").notNull().default("other"),

    title: text("title").notNull(),
    content: text("content"),
    hashtags: text("hashtags"),

    status: socialStatus("status").notNull().default("idea"),

    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),

    views: integer("views").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    leadsGenerated: integer("leads_generated").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("social_posts_workspace_id_idx").on(table.workspaceId),
    index("social_posts_created_by_idx").on(table.createdBy),
    index("social_posts_activity_id_idx").on(table.activityId),
    index("social_posts_project_id_idx").on(table.projectId),
    index("social_posts_goal_id_idx").on(table.goalId),
    index("social_posts_platform_idx").on(table.platform),
    index("social_posts_status_idx").on(table.status),
    index("social_posts_scheduled_at_idx").on(table.scheduledAt),
  ]
);

export const socialPostDetails = pgTable(
  "social_post_details",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    postId: uuid("post_id")
      .notNull()
      .references(() => socialPosts.id, { onDelete: "cascade" }),

    brief: text("brief"),
    objective: text("objective"),
    audience: text("audience"),
    tone: text("tone"),
    callToAction: text("call_to_action"),
    aiPrompt: text("ai_prompt"),
    aiModel: text("ai_model"),

    aiGeneratedAt: timestamp("ai_generated_at", { withTimezone: true }),
    autoPublish: boolean("auto_publish").notNull().default(false),

    approvalNotes: text("approval_notes"),
    contentScore: integer("content_score").notNull().default(0),
    lastError: text("last_error"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("social_post_details_post_id_unique").on(table.postId),
    index("social_post_details_workspace_id_idx").on(table.workspaceId),
    index("social_post_details_created_by_idx").on(table.createdBy),
    index("social_post_details_auto_publish_idx").on(table.autoPublish),
    index("social_post_details_ai_generated_at_idx").on(table.aiGeneratedAt),
  ]
);

export const socialChannels = pgTable(
  "social_channels",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    platform: socialPlatform("platform").notNull().default("other"),
    provider: socialChannelProvider("provider").notNull().default("manual"),
    status: socialChannelStatus("status").notNull().default("draft"),

    name: text("name").notNull(),
    handle: text("handle"),
    webhookUrl: text("webhook_url"),
    authConfig: jsonb("auth_config").notNull().default({}),
    externalAccountId: text("external_account_id"),

    autoPublish: boolean("auto_publish").notNull().default(false),
    lastValidatedAt: timestamp("last_validated_at", { withTimezone: true }),
    lastError: text("last_error"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("social_channels_workspace_name_unique").on(
      table.workspaceId,
      table.name
    ),
    index("social_channels_workspace_id_idx").on(table.workspaceId),
    index("social_channels_created_by_idx").on(table.createdBy),
    index("social_channels_platform_idx").on(table.platform),
    index("social_channels_provider_idx").on(table.provider),
    index("social_channels_status_idx").on(table.status),
    index("social_channels_auto_publish_idx").on(table.autoPublish),
  ]
);

export const socialPostDeliveries = pgTable(
  "social_post_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    postId: uuid("post_id")
      .notNull()
      .references(() => socialPosts.id, { onDelete: "cascade" }),

    channelId: uuid("channel_id").references(() => socialChannels.id, {
      onDelete: "set null",
    }),

    platform: socialPlatform("platform").notNull().default("other"),

    captionOverride: text("caption_override"),
    hashtagsOverride: text("hashtags_override"),

    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),

    status: socialDeliveryStatus("status").notNull().default("draft"),

    externalPostId: text("external_post_id"),
    externalUrl: text("external_url"),
    lastError: text("last_error"),

    attempts: integer("attempts").notNull().default(0),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),

    views: integer("views").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    leadsGenerated: integer("leads_generated").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("social_post_deliveries_workspace_id_idx").on(table.workspaceId),
    index("social_post_deliveries_created_by_idx").on(table.createdBy),
    index("social_post_deliveries_post_id_idx").on(table.postId),
    index("social_post_deliveries_channel_id_idx").on(table.channelId),
    index("social_post_deliveries_platform_idx").on(table.platform),
    index("social_post_deliveries_status_idx").on(table.status),
    index("social_post_deliveries_scheduled_at_idx").on(table.scheduledAt),
    index("social_post_deliveries_published_at_idx").on(table.publishedAt),
    index("social_post_deliveries_next_retry_at_idx").on(table.nextRetryAt),
  ]
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    title: text("title").notNull(),

    periodType: reportPeriodType("period_type").notNull().default("monthly"),

    startDate: date("start_date"),
    endDate: date("end_date"),

    summary: text("summary"),

    metrics: jsonb("metrics").notNull().default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reports_workspace_id_idx").on(table.workspaceId),
    index("reports_created_by_idx").on(table.createdBy),
    index("reports_period_type_idx").on(table.periodType),
  ]
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),

    recordType: text("record_type").notNull(),
    recordId: uuid("record_id"),

    bucket: storageBucket("bucket").notNull(),

    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    fileUrl: text("file_url"),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),

    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("attachments_workspace_id_idx").on(table.workspaceId),
    index("attachments_created_by_idx").on(table.createdBy),
    index("attachments_record_idx").on(table.recordType, table.recordId),
    index("attachments_bucket_idx").on(table.bucket),
  ]
);

/**
 * Inferred types
 */

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type ActivityClient = typeof activityClients.$inferSelect;
export type NewActivityClient = typeof activityClients.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectClient = typeof projectClients.$inferSelect;
export type NewProjectClient = typeof projectClients.$inferInsert;

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;

export type SocialPost = typeof socialPosts.$inferSelect;
export type NewSocialPost = typeof socialPosts.$inferInsert;

export type SocialPostDetail = typeof socialPostDetails.$inferSelect;
export type NewSocialPostDetail = typeof socialPostDetails.$inferInsert;

export type SocialChannel = typeof socialChannels.$inferSelect;
export type NewSocialChannel = typeof socialChannels.$inferInsert;

export type SocialPostDelivery = typeof socialPostDeliveries.$inferSelect;
export type NewSocialPostDelivery = typeof socialPostDeliveries.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

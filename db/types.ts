import type { InferModel } from "drizzle-orm";
import {
  activities,
  activityClients,
  attachments,
  budgets,
  clients,
  goals,
  invoiceItems,
  invoices,
  profiles,
  projects,
  projectClients,
  reports,
  socialChannels,
  socialPostDeliveries,
  socialPostDetails,
  socialPosts,
  tasks,
  transactions,
  workspaceMembers,
  workspaces,
} from "./schema";

export type Profile = InferModel<typeof profiles>;
export type Workspace = InferModel<typeof workspaces>;
export type WorkspaceMember = InferModel<typeof workspaceMembers>;
export type Activity = InferModel<typeof activities>;
export type ActivityClient = InferModel<typeof activityClients>;
export type Project = InferModel<typeof projects>;
export type ProjectClient = InferModel<typeof projectClients>;
export type Goal = InferModel<typeof goals>;
export type Task = InferModel<typeof tasks>;
export type Client = InferModel<typeof clients>;
export type Transaction = InferModel<typeof transactions>;
export type Budget = InferModel<typeof budgets>;
export type Invoice = InferModel<typeof invoices>;
export type InvoiceItem = InferModel<typeof invoiceItems>;
export type SocialPost = InferModel<typeof socialPosts>;
export type SocialPostDetail = InferModel<typeof socialPostDetails>;
export type SocialChannel = InferModel<typeof socialChannels>;
export type SocialPostDelivery = InferModel<typeof socialPostDeliveries>;
export type Report = InferModel<typeof reports>;
export type Attachment = InferModel<typeof attachments>;

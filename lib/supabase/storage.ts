export const STORAGE_BUCKETS = [
  "avatars",
  "workspace-logos",
  "attachments",
  "invoice-files",
  "social-post-media",
  "project-documents",
] as const;

export const bucketMap = {
  avatars: "avatars",
  workspaceLogos: "workspace-logos",
  attachments: "attachments",
  invoiceFiles: "invoice-files",
  socialPostMedia: "social-post-media",
  projectDocuments: "project-documents",
} as const;

export const attachmentBucketNames = Object.values(bucketMap);

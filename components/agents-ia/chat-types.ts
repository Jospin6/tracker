import type { LucideIcon } from "lucide-react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type QuickAction = {
  label: string;
  prompt: string;
  icon?: LucideIcon;
};
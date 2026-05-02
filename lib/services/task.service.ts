import type { Task } from "@/db/types";

export const taskService = {
  list: async (): Promise<Task[]> => {
    const response = await fetch("/api/tasks");
    return response.json();
  },
  get: async (id: string): Promise<Task> => {
    const response = await fetch(`/api/tasks/${id}`);
    return response.json();
  },
  create: async (payload: Partial<Task>) => {
    return fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<Task>) => {
    return fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  remove: async (id: string) => {
    return fetch(`/api/tasks/${id}`, { method: "DELETE" });
  },
};

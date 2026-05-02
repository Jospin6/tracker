import type { Goal } from "@/db/types";

export const goalService = {
  list: async (): Promise<Goal[]> => {
    const response = await fetch("/api/goals");
    return response.json();
  },
  get: async (id: string): Promise<Goal> => {
    const response = await fetch(`/api/goals/${id}`);
    return response.json();
  },
  create: async (payload: Partial<Goal>) => {
    return fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<Goal>) => {
    return fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  remove: async (id: string) => {
    return fetch(`/api/goals/${id}`, { method: "DELETE" });
  },
};

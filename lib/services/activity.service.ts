import type { Activity } from "@/db/types";

export const activityService = {
  list: async (): Promise<Activity[]> => {
    const response = await fetch("/api/activities");
    return response.json();
  },
  get: async (id: string): Promise<Activity> => {
    const response = await fetch(`/api/activities/${id}`);
    return response.json();
  },
  create: async (payload: Partial<Activity>) => {
    return fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<Activity>) => {
    return fetch(`/api/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  remove: async (id: string) => {
    return fetch(`/api/activities/${id}`, { method: "DELETE" });
  },
};

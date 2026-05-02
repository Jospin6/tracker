import type { Project } from "@/db/types";

export const projectService = {
  list: async (): Promise<Project[]> => {
    const response = await fetch("/api/projects");
    return response.json();
  },
  get: async (id: string): Promise<Project> => {
    const response = await fetch(`/api/projects/${id}`);
    return response.json();
  },
  create: async (payload: Partial<Project>) => {
    return fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<Project>) => {
    return fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  remove: async (id: string) => {
    return fetch(`/api/projects/${id}`, { method: "DELETE" });
  },
};

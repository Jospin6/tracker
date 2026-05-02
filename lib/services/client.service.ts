import type { Client } from "@/db/types";

export const clientService = {
  list: async (): Promise<Client[]> => {
    const response = await fetch("/api/clients");
    return response.json();
  },
  get: async (id: string): Promise<Client> => {
    const response = await fetch(`/api/clients/${id}`);
    return response.json();
  },
  create: async (payload: Partial<Client>) => {
    return fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<Client>) => {
    return fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  remove: async (id: string) => {
    return fetch(`/api/clients/${id}`, { method: "DELETE" });
  },
};

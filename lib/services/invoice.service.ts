import type { Invoice } from "@/db/types";

export const invoiceService = {
  list: async (): Promise<Invoice[]> => {
    const response = await fetch("/api/invoices");
    return response.json();
  },
  get: async (id: string): Promise<Invoice> => {
    const response = await fetch(`/api/invoices/${id}`);
    return response.json();
  },
  create: async (payload: Partial<Invoice>) => {
    return fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<Invoice>) => {
    return fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};

import type { Transaction } from "@/db/types";

export const financeService = {
  list: async (): Promise<Transaction[]> => {
    const response = await fetch("/api/transactions");
    return response.json();
  },
  getByFilters: async (filters: Record<string, string>) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/transactions?${query}`);
    return response.json();
  },
  create: async (payload: Partial<Transaction>) => {
    return fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};

import { create } from "zustand";
import type { Transaction } from "@/db/types";

interface FinanceState {
  transactions: Transaction[];
  revenue: number;
  expense: number;
  setTransactions: (transactions: Transaction[]) => void;
  setRevenue: (revenue: number) => void;
  setExpense: (expense: number) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],
  revenue: 0,
  expense: 0,
  setTransactions: (transactions) => set({ transactions }),
  setRevenue: (revenue) => set({ revenue }),
  setExpense: (expense) => set({ expense }),
}));

import { create } from "zustand";

interface DashboardState {
  summary: Record<string, string>;
  setSummary: (summary: Record<string, string>) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: {},
  setSummary: (summary) => set({ summary }),
}));

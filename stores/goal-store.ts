import { create } from "zustand";
import type { Goal } from "@/db/types";

interface GoalState {
  goals: Goal[];
  selectedGoal: Goal | null;
  setGoals: (goals: Goal[]) => void;
  setSelectedGoal: (goal: Goal | null) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  selectedGoal: null,
  setGoals: (goals) => set({ goals }),
  setSelectedGoal: (selectedGoal) => set({ selectedGoal }),
}));

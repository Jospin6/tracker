import { create } from "zustand";
import type { Activity } from "@/db/types";

interface ActivityState {
  activities: Activity[];
  selectedActivity: Activity | null;
  setActivities: (activities: Activity[]) => void;
  setSelectedActivity: (activity: Activity | null) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  selectedActivity: null,
  setActivities: (activities) => set({ activities }),
  setSelectedActivity: (selectedActivity) => set({ selectedActivity }),
}));

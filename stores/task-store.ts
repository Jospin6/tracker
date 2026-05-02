import { create } from "zustand";
import type { Task } from "@/db/types";

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTask: null,
  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (selectedTask) => set({ selectedTask }),
}));

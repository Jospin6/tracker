export const taskStatusOrder = [
  "todo",
  "in_progress",
  "waiting",
  "done",
  "cancelled",
] as const;

export type TaskStatus = (typeof taskStatusOrder)[number];

export const taskPriorityOrder = ["low", "medium", "high", "urgent"] as const;

export type TaskPriority = (typeof taskPriorityOrder)[number];

export const taskStatusMeta = {
  todo: {
    accent: "from-amber-500/20 via-amber-500/10 to-transparent",
    description: "A prioriser et lancer",
    label: "A faire",
    ring: "ring-amber-500/15",
  },
  in_progress: {
    accent: "from-brand-500/20 via-brand-500/10 to-transparent",
    description: "En execution active",
    label: "En cours",
    ring: "ring-brand-500/15",
  },
  waiting: {
    accent: "from-cyan-500/20 via-cyan-500/10 to-transparent",
    description: "Bloquee par une dependance",
    label: "En attente",
    ring: "ring-cyan-500/15",
  },
  done: {
    accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    description: "Livree ou finalisee",
    label: "Terminees",
    ring: "ring-emerald-500/15",
  },
  cancelled: {
    accent: "from-rose-500/20 via-rose-500/10 to-transparent",
    description: "Retiree du flux actif",
    label: "Annulees",
    ring: "ring-rose-500/15",
  },
} as const satisfies Record<
  TaskStatus,
  {
    accent: string;
    description: string;
    label: string;
    ring: string;
  }
>;

export const taskPriorityMeta = {
  low: {
    label: "Faible",
    tone: "bg-white/6 text-zinc-300",
  },
  medium: {
    label: "Moyenne",
    tone: "bg-white/10 text-white",
  },
  high: {
    label: "Haute",
    tone: "bg-brand-500/15 text-brand-100",
  },
  urgent: {
    label: "Urgente",
    tone: "bg-rose-500/15 text-rose-100",
  },
} as const satisfies Record<
  TaskPriority,
  {
    label: string;
    tone: string;
  }
>;

export const taskStatusOptions = taskStatusOrder.map((status) => ({
  label: taskStatusMeta[status].label,
  value: status,
}));

export const taskPriorityOptions = taskPriorityOrder.map((priority) => ({
  label: taskPriorityMeta[priority].label,
  value: priority,
}));

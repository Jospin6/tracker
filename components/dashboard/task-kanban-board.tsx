"use client";

import { startTransition, useOptimistic, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, GripVertical } from "lucide-react";

import { updateTaskStatusAction } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/ui";
import {
  taskPriorityMeta,
  taskStatusMeta,
  taskStatusOrder,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

type TaskBoardItem = {
  description: string | null;
  dueDate: string | Date | null;
  estimatedMinutes: number | null;
  goalName: string | null;
  id: string;
  priority: TaskPriority;
  projectName: string | null;
  status: TaskStatus;
  title: string;
};

type TaskKanbanBoardProps = {
  tasks: TaskBoardItem[];
};

function buildScopeLabel(task: TaskBoardItem) {
  const scopeParts = [task.projectName, task.goalName].filter(Boolean);

  if (!scopeParts.length) {
    return "Sans contexte";
  }

  return scopeParts.join(" | ");
}

export function TaskKanbanBoard({ tasks }: TaskKanbanBoardProps) {
  const router = useRouter();
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    tasks,
    (currentTasks, update: { status: TaskStatus; taskId: string }) =>
      currentTasks.map((task) =>
        task.id === update.taskId ? { ...task, status: update.status } : task
      )
  );
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<TaskStatus | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = selectedTaskId
    ? optimisticTasks.find((task) => task.id === selectedTaskId) ?? null
    : null;

  const groupedTasks = taskStatusOrder.reduce((acc, status) => {
    acc[status] = optimisticTasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, TaskBoardItem[]>);

  async function moveTask(taskId: string, status: TaskStatus) {
    const currentTask = optimisticTasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === status) {
      setDraggedTaskId(null);
      setHoveredStatus(null);
      return;
    }

    startTransition(() => {
      addOptimisticTask({ status, taskId });
      setPendingTaskId(taskId);
      setErrorMessage(null);
    });

    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("status", status);

    try {
      await updateTaskStatusAction(formData);
    } catch (error) {
      console.error("TASK_STATUS_UPDATE_ERROR", error);
      setErrorMessage("Impossible de mettre a jour cette tache.");
    } finally {
      router.refresh();
      setPendingTaskId((current) => (current === taskId ? null : current));
      setDraggedTaskId(null);
      setHoveredStatus(null);
    }
  }

  function handleDragStart(task: TaskBoardItem, event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    setDraggedTaskId(task.id);
    setHoveredStatus(task.status);
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setHoveredStatus(null);
  }

  function openTaskDetails(taskId: string) {
    if (draggedTaskId) {
      return;
    }

    setSelectedTaskId(taskId);
  }

  function handleDrop(status: TaskStatus, event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;

    if (!taskId) {
      setHoveredStatus(null);
      return;
    }

    void moveTask(taskId, status);
  }

  if (!optimisticTasks.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm font-medium text-white">Aucune tache pour ce filtre.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Cree une tache puis glisse-la dans la colonne adaptee pour piloter ton execution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskId(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedTask ? (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
                <DialogDescription>{buildScopeLabel(selectedTask)}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                    Statut
                  </p>
                  <div className="mt-3">
                    <StatusBadge value={selectedTask.status} />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                    Priorite
                  </p>
                  <span
                    className={cn(
                      "mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                      taskPriorityMeta[selectedTask.priority].tone
                    )}
                  >
                    {taskPriorityMeta[selectedTask.priority].label}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                    Echeance
                  </p>
                  <p className="mt-3 text-sm text-white">
                    {formatDate(selectedTask.dueDate)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                    Estimation
                  </p>
                  <p className="mt-3 text-sm text-white">
                    {selectedTask.estimatedMinutes
                      ? `${selectedTask.estimatedMinutes} min`
                      : "Sans estimation"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                  Description
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {selectedTask.description || "Aucune description."}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[84rem] gap-4 xl:min-w-0 xl:grid-cols-5">
          {taskStatusOrder.map((status) => {
            const meta = taskStatusMeta[status];
            const columnTasks = groupedTasks[status];
            const isHovering = hoveredStatus === status;

            return (
              <section
                key={status}
                onDragOver={(event) => {
                  event.preventDefault();
                  setHoveredStatus(status);
                }}
                onDrop={(event) => handleDrop(status, event)}
                className={cn(
                  "relative flex min-h-[34rem] flex-col overflow-hidden rounded-3xl border bg-black/45 p-4 transition",
                  isHovering
                    ? "border-brand-400/50 bg-brand-500/10 shadow-[0_24px_60px_rgba(214,179,107,0.08)]"
                    : "border-white/8"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                    meta.accent
                  )}
                />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      {meta.label}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex min-w-10 items-center justify-center rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-inset",
                      meta.ring,
                      isHovering ? "bg-white/10" : "bg-black/30"
                    )}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {columnTasks.length ? (
                    columnTasks.map((task) => {
                      const priorityMeta = taskPriorityMeta[task.priority];
                      const isDragged = draggedTaskId === task.id;
                      const isPending = pendingTaskId === task.id;

                      return (
                        <article
                          key={task.id}
                          draggable
                          aria-grabbed={isDragged}
                          aria-haspopup="dialog"
                          role="button"
                          tabIndex={0}
                          onDragStart={(event) => handleDragStart(task, event)}
                          onDragEnd={handleDragEnd}
                          onClick={() => openTaskDetails(task.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openTaskDetails(task.id);
                            }
                          }}
                          className={cn(
                            "group relative cursor-grab rounded-2xl border border-white/8 bg-slate-950/85 p-3 shadow-soft transition duration-200 active:cursor-grabbing hover:border-white/15 hover:bg-slate-950",
                            isDragged && "scale-[0.98] opacity-60",
                            isPending && "border-brand-400/40"
                          )}
                        >
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/0 via-white/15 to-white/0" />

                          <div className="flex items-start gap-2">
                            <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-white/80" />
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-semibold text-white">
                                {task.title}
                              </h3>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                                    priorityMeta.tone
                                  )}
                                >
                                  {priorityMeta.label}
                                </span>
                                {task.dueDate ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-300">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {formatDate(task.dueDate)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                        </article>
                      );
                    })
                  ) : (
                    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/5 px-4 py-8 text-center">
                      <p className="text-sm font-medium text-white">Glisse une tache ici</p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Les cartes s&apos;organisent par statut et restent fluides au
                        changement.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {errorMessage ? (
        <p className="text-sm text-rose-200" role="status">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const tabActionIconButtonClassName =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-zinc-300 transition hover:border-white/15 hover:bg-white/10 hover:text-white focus-visible:border-brand-400 focus-visible:ring-3 focus-visible:ring-brand-400/20";

export function TabActionDialog({
  children,
  className,
  description,
  title,
  triggerAriaLabel,
  triggerIcon,
  triggerClassName,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
  triggerAriaLabel: string;
  triggerClassName?: string;
  triggerIcon: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={triggerAriaLabel}
        type="button"
        className={cn(tabActionIconButtonClassName, triggerClassName)}
      >
        {triggerIcon}
      </DialogTrigger>
      <DialogContent className={cn("max-h-[85vh] overflow-y-auto sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

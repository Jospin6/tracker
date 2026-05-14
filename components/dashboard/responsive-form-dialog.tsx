"use client";

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

export function ResponsiveFormDialog({
  children,
  className,
  description,
  mobileContent,
  title,
  triggerClassName,
  triggerLabel,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  mobileContent: ReactNode;
  title: string;
  triggerClassName: string;
  triggerLabel: string;
}) {
  return (
    <>
      <div className="md:hidden">{mobileContent}</div>
      <div className="hidden md:block">
        <Dialog>
          <DialogTrigger className={triggerClassName}>{triggerLabel}</DialogTrigger>
          <DialogContent className={cn("max-h-[85vh] overflow-y-auto", className)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

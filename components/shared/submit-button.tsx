"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  className?: string;
  idleLabel: ReactNode;
  pendingLabel?: ReactNode;
};

export function SubmitButton({
  className,
  idleLabel,
  pendingLabel = "En cours...",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

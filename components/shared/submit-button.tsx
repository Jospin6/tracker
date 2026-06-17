"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  className?: string;
  idleLabel: ReactNode;
  pendingLabel?: ReactNode;
  disabled?: boolean;
};

export function SubmitButton({
  className,
  idleLabel,
  pendingLabel = "En cours...",
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

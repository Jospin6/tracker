import type { FormHTMLAttributes } from "react";

interface AuthFormProps extends FormHTMLAttributes<HTMLFormElement> {
  title: string;
  description: string;
  submitLabel: string;
}

export function AuthForm({ title, description, submitLabel, children, ...props }: AuthFormProps) {
  return (
    <form {...props} className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">{description}</p>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
      </div>
      {children}
      <button
        type="submit"
        className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
      >
        {submitLabel}
      </button>
    </form>
  );
}

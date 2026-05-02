import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
      <p className="mt-2 max-w-3xl text-slate-400">{description}</p>
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  description,
}: {
  description?: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  hint?: string;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-3 text-sm text-slate-400">{hint}</p> : null}
    </article>
  );
}

const badgeMap: Record<string, string> = {
  achieved: "bg-emerald-500/10 text-emerald-200",
  active: "bg-emerald-500/10 text-emerald-200",
  approved: "bg-blue-500/10 text-blue-200",
  archived: "bg-slate-700 text-slate-200",
  blocked: "bg-amber-500/10 text-amber-200",
  cancelled: "bg-rose-500/10 text-rose-200",
  completed: "bg-emerald-500/10 text-emerald-200",
  done: "bg-emerald-500/10 text-emerald-200",
  draft: "bg-slate-700 text-slate-200",
  drafted: "bg-slate-700 text-slate-200",
  expense: "bg-rose-500/10 text-rose-200",
  idea: "bg-slate-700 text-slate-200",
  income: "bg-emerald-500/10 text-emerald-200",
  in_progress: "bg-blue-500/10 text-blue-200",
  investment: "bg-cyan-500/10 text-cyan-200",
  overdue: "bg-rose-500/10 text-rose-200",
  paid: "bg-emerald-500/10 text-emerald-200",
  partially_paid: "bg-amber-500/10 text-amber-200",
  paused: "bg-amber-500/10 text-amber-200",
  prospect: "bg-slate-700 text-slate-200",
  published: "bg-emerald-500/10 text-emerald-200",
  scheduled: "bg-cyan-500/10 text-cyan-200",
  sent: "bg-blue-500/10 text-blue-200",
  todo: "bg-slate-700 text-slate-200",
  waiting: "bg-amber-500/10 text-amber-200",
  debt: "bg-amber-500/10 text-amber-200",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${
        badgeMap[value] ?? "bg-slate-700 text-slate-200"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/80 p-6 text-sm text-slate-400">
      <p className="font-medium text-slate-200">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );
}

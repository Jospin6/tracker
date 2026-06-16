import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  BriefcaseBusiness,
  CircleDot,
  FileText,
  FolderKanban,
  Gauge,
  ListTodo,
  Megaphone,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

function pickMetricIcon(label: string) {
  const value = label.toLowerCase();

  if (value.includes("projet")) return <FolderKanban className="h-4 w-4" />;
  if (value.includes("activit")) return <Activity className="h-4 w-4" />;
  if (value.includes("balance")) return <TrendingUp className="h-4 w-4" />;
  if (value.includes("revenu")) return <BadgeDollarSign className="h-4 w-4" />;
  if (value.includes("depense")) return <BadgeDollarSign className="h-4 w-4" />;
  if (value.includes("client")) return <Users className="h-4 w-4" />;
  if (value.includes("facture")) return <FileText className="h-4 w-4" />;
  if (value.includes("objectif")) return <Target className="h-4 w-4" />;
  if (value.includes("tache")) return <ListTodo className="h-4 w-4" />;
  if (value.includes("post")) return <Megaphone className="h-4 w-4" />;

  return <Gauge className="h-4 w-4" />;
}

export const formControlClassName =
  "app-input placeholder:text-zinc-500 focus:border-brand-400";

export const formSelectClassName =
  "app-input focus:border-brand-400";

export const formTextareaClassName =
  "app-input min-h-32 resize-y placeholder:text-zinc-500 focus:border-brand-400";

export const primaryButtonClassName =
  "app-button-primary hover:brightness-[1.04]";

export const secondaryButtonClassName =
  "app-button-secondary hover:border-white/20 hover:bg-white/8";

export const iconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 hover:text-white";

export const subtleButtonClassName =
  "app-button-subtle hover:bg-white/6 hover:text-white";

export function FormField({
  children,
  label,
}: {
  children: ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-100">{label}</span>
      {children}
    </label>
  );
}

export function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function PageIntro({
  actions,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-6 border-b border-white/6 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          {title}
        </h1>
      </div>
      {actions ? <div>{actions}</div> : null}
    </section>
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
    <section className={`app-panel p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  icon: Icon,
  title,
  trailing,
}: {
  description?: string;
  icon?: LucideIcon;
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/12 text-brand-200 ring-1 ring-brand-500/16">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div>
          <h2 className="font-heading text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>
      {trailing ? <div>{trailing}</div> : null}
    </div>
  );
}

export function MetricCard({
  hint,
  icon,
  label,
  value,
}: {
  hint?: string;
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  const iconNode = icon ?? pickMetricIcon(label);

  return (
    <article className="app-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {value}
          </p>
          {hint ? <p className="mt-3 text-sm text-zinc-500">{hint}</p> : null}
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/12 text-brand-200 ring-1 ring-brand-500/16">
          {iconNode}
        </span>
      </div>
    </article>
  );
}

const badgeMap: Record<string, string> = {
  achieved: "bg-brand-500/15 text-brand-200",
  active: "bg-white/10 text-white",
  approved: "bg-brand-500/15 text-brand-200",
  archived: "bg-white/6 text-zinc-300",
  at_risk: "bg-white/6 text-zinc-300",
  attention: "bg-white/10 text-white",
  blocked: "bg-rose-500/10 text-rose-200",
  cancelled: "bg-rose-500/10 text-rose-200",
  completed: "bg-brand-500/15 text-brand-200",
  connected: "bg-brand-500/15 text-brand-200",
  contacted: "bg-brand-500/15 text-brand-200",
  debt: "bg-rose-500/10 text-rose-200",
  disabled: "bg-white/6 text-zinc-300",
  done: "bg-brand-500/15 text-brand-200",
  draft: "bg-white/6 text-zinc-300",
  drafted: "bg-white/6 text-zinc-300",
  expense: "bg-rose-500/10 text-rose-200",
  failed: "bg-rose-500/10 text-rose-200",
  idea: "bg-white/6 text-zinc-300",
  income: "bg-brand-500/15 text-brand-200",
  in_progress: "bg-white/10 text-white",
  inactive: "bg-white/6 text-zinc-300",
  investment: "bg-rose-500/10 text-rose-200",
  lost: "bg-rose-500/10 text-rose-200",
  negotiating: "bg-white/10 text-white",
  overdue: "bg-rose-500/10 text-rose-200",
  on_track: "bg-brand-500/15 text-brand-200",
  overspent: "bg-rose-500/10 text-rose-200",
  paid: "bg-brand-500/15 text-brand-200",
  partially_paid: "bg-white/10 text-white",
  paused: "bg-white/6 text-zinc-300",
  planned: "bg-white/6 text-zinc-300",
  processing: "bg-white/10 text-white",
  prospect: "bg-white/6 text-zinc-300",
  published: "bg-brand-500/15 text-brand-200",
  scheduled: "bg-brand-500/15 text-brand-200",
  sent: "bg-brand-500/15 text-brand-200",
  todo: "bg-white/6 text-zinc-300",
  waiting: "bg-white/6 text-zinc-300",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
        badgeMap[value] ?? "bg-white/6 text-zinc-300"
      }`}
    >
      <CircleDot className="h-3 w-3" />
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function EmptyState({
  icon: Icon = AlertTriangle,
  title,
}: {
  description: string;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <div className="app-card p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/12 text-brand-200 ring-1 ring-brand-500/16">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-medium text-white">{title}</p>
        </div>
      </div>
    </div>
  );
}

export function MetaStrip({
  items,
}: {
  items: Array<{
    icon?: LucideIcon;
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon ?? BriefcaseBusiness;

        return (
          <div
            key={`${item.label}-${item.value}`}
            className="app-tile px-4 py-3"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
            <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}

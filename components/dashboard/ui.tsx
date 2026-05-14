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
  "w-full rounded-xl bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/10 transition focus:ring-white/20";

export const formSelectClassName =
  "w-full rounded-xl bg-black px-3.5 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-white/20";

export const formTextareaClassName =
  "w-full rounded-xl bg-black px-3.5 py-3 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/10 transition focus:ring-white/20";

export const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50";

export const subtleButtonClassName =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/6 hover:text-white";

export function FormField({
  children,
  description,
  label,
}: {
  children: ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-100">{label}</span>
      {description ? <p className="text-xs text-zinc-500">{description}</p> : null}
      {children}
    </label>
  );
}

export function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function PageIntro({
  actions,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-6 border-b border-white/8 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            {description}
          </p>
        ) : null}
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
    <section className={`rounded-2xl bg-black p-5 ring-1 ring-white/8 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  description,
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
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black text-zinc-200 ring-1 ring-white/10">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
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
    <article className="rounded-2xl bg-black p-5 ring-1 ring-white/8">
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
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-zinc-200 ring-1 ring-white/10">
          {iconNode}
        </span>
      </div>
    </article>
  );
}

const badgeMap: Record<string, string> = {
  achieved: "bg-white/10 text-white",
  active: "bg-white/10 text-white",
  approved: "bg-white/10 text-white",
  archived: "bg-white/6 text-zinc-300",
  at_risk: "bg-white/6 text-zinc-300",
  blocked: "bg-zinc-800 text-zinc-100",
  cancelled: "bg-zinc-800 text-zinc-300",
  completed: "bg-white/10 text-white",
  contacted: "bg-white/10 text-white",
  debt: "bg-zinc-800 text-zinc-100",
  done: "bg-white/10 text-white",
  draft: "bg-white/6 text-zinc-300",
  drafted: "bg-white/6 text-zinc-300",
  expense: "bg-zinc-800 text-zinc-100",
  idea: "bg-white/6 text-zinc-300",
  income: "bg-white/10 text-white",
  in_progress: "bg-white/10 text-white",
  inactive: "bg-white/6 text-zinc-300",
  investment: "bg-zinc-800 text-zinc-100",
  lost: "bg-zinc-800 text-zinc-300",
  negotiating: "bg-white/10 text-white",
  overdue: "bg-zinc-800 text-zinc-100",
  on_track: "bg-white/10 text-white",
  overspent: "bg-zinc-800 text-zinc-100",
  paid: "bg-white/10 text-white",
  partially_paid: "bg-white/10 text-white",
  paused: "bg-white/6 text-zinc-300",
  planned: "bg-white/6 text-zinc-300",
  prospect: "bg-white/6 text-zinc-300",
  published: "bg-white/10 text-white",
  scheduled: "bg-white/10 text-white",
  sent: "bg-white/10 text-white",
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
  description,
  icon: Icon = AlertTriangle,
  title,
}: {
  description: string;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <div className="rounded-2xl bg-black p-5 ring-1 ring-white/8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black text-zinc-200 ring-1 ring-white/10">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="mt-2 text-sm text-zinc-500">{description}</p>
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
            className="rounded-2xl bg-black px-4 py-3 ring-1 ring-white/8"
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

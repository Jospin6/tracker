"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Gauge,
  Megaphone,
  Target,
  Users,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Activites", href: "/dashboard/activities", icon: Activity },
  { label: "Projets", href: "/dashboard/projects", icon: BriefcaseBusiness },
  { label: "Objectifs", href: "/dashboard/goals", icon: Target },
  { label: "Taches", href: "/dashboard/tasks", icon: ClipboardList },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Finances", href: "/dashboard/finances", icon: CircleDollarSign },
  { label: "Factures", href: "/dashboard/invoices", icon: FileText },
  { label: "Posts", href: "/dashboard/social-posts", icon: Megaphone },
];

export default function Sidebar({
  activeRole,
  workspaceName,
}: {
  activeRole: string;
  workspaceName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-80 flex-col border-r border-white/10 bg-slate-950/95 px-6 py-8 lg:flex">
      <div className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-3xl bg-brand-500/10 px-4 py-3 text-brand-200">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
          <span className="text-sm font-semibold">NuruTrack</span>
        </div>
        <p className="text-sm font-medium text-white">{workspaceName}</p>
        <p className="mt-1 text-sm text-slate-400">
          Role actif: {activeRole.replaceAll("_", " ")}
        </p>
      </div>
      <nav className="space-y-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-500/15 text-white"
                  : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

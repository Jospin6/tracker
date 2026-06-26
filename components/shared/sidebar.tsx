"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Bot,
  Building2,
  FileText,
  FolderKanban,
  Gauge,
  ListTodo,
  Megaphone,
  ReceiptText,
  Users,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Agent IA", href: "/dashboard/agent-ia", icon: Bot },
  { label: "Entreprises", href: "/dashboard/companies", icon: Building2 },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users },
  { label: "Projets", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Finances", href: "/dashboard/finances", icon: BadgeDollarSign },
  { label: "Factures", href: "/dashboard/invoices", icon: ReceiptText },
  { label: "Taches", href: "/dashboard/tasks", icon: ListTodo },
  { label: "Posts", href: "/dashboard/social-posts", icon: Megaphone },
  { label: "Rapports", href: "/dashboard/budget", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-panel mb-3 w-full px-3 py-3 lg:fixed lg:inset-y-4 lg:left-4 lg:mb-0 lg:w-72 lg:px-4 lg:py-5">
      <div className="mb-5 px-2">
        <p className="font-heading text-lg font-black tracking-tighter text-white">
          NuruTrack
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition lg:min-w-0 ${
                isActive
                  ? "bg-brand-500 text-slate-950 shadow-[0_12px_28px_rgba(214,179,107,0.14)]"
                  : "text-zinc-400 hover:bg-white/6 hover:text-white"
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

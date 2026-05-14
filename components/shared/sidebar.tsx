"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BadgeDollarSign, Gauge, Megaphone, Settings2, Users } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Activites", href: "/dashboard/activities", icon: Activity },
  { label: "Budget", href: "/dashboard/budget", icon: BadgeDollarSign },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Posts", href: "/dashboard/social-posts", icon: Megaphone },
  { label: "Parametres", href: "/dashboard/settings", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="mb-3 w-full rounded-2xl bg-black px-3 py-3 ring-1 ring-white/8 lg:fixed lg:inset-y-4 lg:left-4 lg:mb-0 lg:w-72 lg:px-4 lg:py-5">
      <div className="mb-5 px-2">
        <p className="text-lg font-black tracking-[-0.04em] text-white">
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
                  ? "bg-white text-black"
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

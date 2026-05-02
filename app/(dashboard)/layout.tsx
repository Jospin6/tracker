import type { ReactNode } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";

export const metadata = {
  title: "NuruTrack • Dashboard",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

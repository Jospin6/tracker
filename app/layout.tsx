import type { Metadata } from "next";

import { AuthSessionSync } from "@/components/auth/auth-session-sync";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "NuruTrack",
  description: "NuruTrack - cockpit de pilotage pour freelances et petites equipes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full bg-slate-950 text-slate-100">
        <AuthSessionSync />
        {children}
      </body>
    </html>
  );
}

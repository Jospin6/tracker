import type { Metadata } from "next";

import "./globals.css";

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
    <html
      lang="fr"
      className="dark h-full antialiased font-sans"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}

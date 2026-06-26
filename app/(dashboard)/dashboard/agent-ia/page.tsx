import type { Metadata } from "next";

import { AgentChatShell } from "@/components/agents-ia/agent-chat-shell";

export const metadata: Metadata = {
  title: "Agent IA",
  description:
    "Chat central pour piloter l'entreprise avec les agents spécialisés Nurutrack.",
};

export default function AgentIAPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
          Agent IA
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Pilote ton workspace avec un seul chat
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          Commence avec le CEO par défaut, puis change d&apos;agent en haut à
          droite pour obtenir un regard commercial, marketing, finance, projet
          ou automatisation selon le besoin.
        </p>
      </div>

      <AgentChatShell />
    </div>
  );
}

import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { AgentChatShell } from "@/components/agents-ia/agent-chat-shell";
import { AGENT_ORDER, getAgentDefinition } from "@/lib/ai/agents";

type AgentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return AGENT_ORDER.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentDefinition(slug);

  if (!agent) {
    return {
      title: "Agent introuvable",
    };
  }

  return {
    title: agent.label,
    description: agent.description,
  };
}

export default async function AgentDetailsPage({
  params,
}: AgentPageProps) {
  const { slug } = await params;
  const agent = getAgentDefinition(slug);

  if (!agent) {
    notFound();
  }

  return <AgentChatShell initialAgentId={agent.id} />;
}

import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  CircleDot,
  Lightbulb,
  Workflow,
} from "lucide-react";

import {
  Panel,
  SectionTitle,
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import {
  aiAgents,
  getAiAgentBySlug,
} from "@/lib/data/ai-agents";

type AgentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return aiAgents.map((agent) => ({
    slug: agent.slug,
  }));
}

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAiAgentBySlug(slug);

  if (!agent) {
    return {
      title: "Agent introuvable",
    };
  }

  return {
    title: agent.name,
    description: agent.description,
  };
}

export default async function AgentDetailsPage({
  params,
}: AgentPageProps) {
  const { slug } = await params;
  const agent = getAiAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  const Icon = agent.icon;

  return (
    <div className="space-y-8">
      <Panel>
        <div>
          {agent.children}
        </div>
      </Panel>
    </div>
  );
}
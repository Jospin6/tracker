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
      <Link
        href="/dashboard/agent-ai"
        className={`${secondaryButtonClassName} inline-flex w-fit items-center gap-2`}
      >
        <ArrowLeft className="h-4 w-4" />
        Tous les agents
      </Link>

      <Panel>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-3xl items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
              <Icon className="h-6 w-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400">
                  {agent.category}
                </span>

                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400">
                  <CircleDot className="h-3 w-3" />
                  Prêt à configurer
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {agent.name}
              </h1>

              <p className="mt-2 text-sm font-medium text-zinc-200">
                {agent.role}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                {agent.description}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-3">
            <div className="text-2xl font-semibold text-white">
              {agent.capabilities.length}
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              Workflows disponibles
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel>
          <SectionTitle
            icon={Workflow}
            title="Workflows de l’agent"
            description="Fonctions et automatisations prises en charge."
          />

          <div className="space-y-3">
            {agent.capabilities.map((capability, index) => (
              <div
                key={capability}
                className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">
                    {capability}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-zinc-500">
                    Workflow assisté par {agent.name}.
                  </p>
                </div>

                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-zinc-300" />
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          {agent.example ? (
            <Panel>
              <SectionTitle
                icon={Lightbulb}
                title="Exemple d’analyse"
                description="Aperçu d’un résultat généré."
              />

              <blockquote className="rounded-xl border border-white/10 bg-white/3 p-4 text-sm leading-6 text-zinc-300">
                “{agent.example}”
              </blockquote>
            </Panel>
          ) : null}

          <Panel>
            <SectionTitle
              icon={Bot}
              title="Configuration"
              description="Informations techniques de l’agent."
            />

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                <span className="text-zinc-500">Catégorie</span>
                <span className="text-right text-zinc-200">
                  {agent.category}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                <span className="text-zinc-500">Workflows</span>
                <span className="text-zinc-200">
                  {agent.capabilities.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Statut</span>
                <span className="text-zinc-200">
                  À configurer
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
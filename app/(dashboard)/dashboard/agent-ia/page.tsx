import Link from "next/link";

import { ArrowUpRight, Bot, Sparkles } from "lucide-react";

import {
  Panel,
  SectionTitle,
} from "@/components/dashboard/ui";
import { aiAgents } from "@/lib/data/ai-agents";

export default function AgentIAPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Agents IA
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Sélectionne un agent pour consulter ses fonctions, ses workflows
            et les automatisations qu’il peut exécuter.
          </p>
        </div>
      </div>

      <Panel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiAgents.map((agent) => {
            const Icon = agent.icon;

            return (
              <Link
                key={agent.slug}
                href={`/dashboard/agent-ia/${agent.slug}`}
                className="group flex min-h-50 flex-col rounded-2xl border border-white/10 bg-white/2.5 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-zinc-600 transition group-hover:text-white" />
                </div>

                <div>

                  <h2 className="mt-2 text-base font-semibold text-white">
                    {agent.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                    {agent.role}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="text-xs font-medium tracking-[0.16em] text-zinc-500">
                    {agent.category}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
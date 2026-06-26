"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  Headphones,
  Landmark,
  ListTodo,
  Loader2,
  Megaphone,
  Package,
  PenTool,
  Sparkles,
  Workflow,
  AtSign,
} from "lucide-react";

import {
  AGENT_ORDER,
  AGENTS,
  DEFAULT_AGENT_ID,
  type AgentId,
} from "@/lib/ai/agents";
import { formSelectClassName, formTextareaClassName, primaryButtonClassName } from "@/components/dashboard/ui";

type ChatMessage = {
  content: string;
  role: "assistant" | "user";
};

type SessionState = {
  input: string;
  isLoading: boolean;
  messages: ChatMessage[];
};

type AgentChatShellProps = {
  initialAgentId?: AgentId;
};

const ICONS: Record<AgentId, typeof Bot> = {
  ceo: Bot,
  commercial: BriefcaseBusiness,
  marketing: Megaphone,
  "content-creator": PenTool,
  "project-manager": ListTodo,
  finance: Landmark,
  "business-intelligence": BarChart3,
  automation: Workflow,
  comptable: Calculator,
  linkedin: AtSign,
  "support-client": Headphones,
  "product-manager": Package,
};

function createInitialSessions() {
  return AGENT_ORDER.reduce<Record<AgentId, SessionState>>((acc, agentId) => {
    acc[agentId] = {
      input: "",
      isLoading: false,
      messages: [],
    };

    return acc;
  }, {} as Record<AgentId, SessionState>);
}

function formatAgentLabel(agentId: AgentId) {
  return AGENTS[agentId].label;
}

export function AgentChatShell({
  initialAgentId = DEFAULT_AGENT_ID,
}: AgentChatShellProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentId>(
    AGENTS[initialAgentId] ? initialAgentId : DEFAULT_AGENT_ID
  );
  const [sessions, setSessions] = useState<Record<AgentId, SessionState>>(
    createInitialSessions
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions[selectedAgent];
  const definition = AGENTS[selectedAgent];
  const Icon = ICONS[selectedAgent];

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [currentSession.messages, currentSession.isLoading]);

  const updateSession = (
    agentId: AgentId,
    updater: (session: SessionState) => SessionState
  ) => {
    setSessions((current) => ({
      ...current,
      [agentId]: updater(current[agentId]),
    }));
  };

  const handleQuickPrompt = (prompt: string) => {
    updateSession(selectedAgent, (session) => ({
      ...session,
      input: prompt,
    }));

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(prompt.length, prompt.length);
    });
  };

  const handleSend = async (messageOverride?: string) => {
    const session = sessions[selectedAgent];
    const content = (messageOverride ?? session.input).trim();

    if (!content || session.isLoading) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...session.messages,
      { role: "user", content },
    ];

    updateSession(selectedAgent, (current) => ({
      ...current,
      input: "",
      isLoading: true,
      messages: nextMessages,
    }));

    try {
      const response = await fetch(`/api/agents/${selectedAgent}`, {
        body: JSON.stringify({
          agentId: selectedAgent,
          messages: nextMessages,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json().catch(() => ({}))) as {
        answer?: string;
        confirmationPreview?: string;
        needsConfirmation?: boolean;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.message || data.answer || "Impossible de joindre l'agent."
        );
      }

      const assistantContent = [
        data.answer || data.message || "L'agent a terminé son analyse.",
        data.needsConfirmation && data.confirmationPreview
          ? `\n\nValidation requise:\n${data.confirmationPreview}`
          : "",
      ]
        .join("")
        .trim();

      updateSession(selectedAgent, (current) => ({
        ...current,
        isLoading: false,
        messages: [
          ...current.messages,
          { role: "assistant", content: assistantContent },
        ],
      }));
    } catch (error) {
      updateSession(selectedAgent, (current) => ({
        ...current,
        isLoading: false,
        messages: [
          ...current.messages,
          {
            role: "assistant",
            content:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue.",
          },
        ],
      }));
    }
  };

  const isEmpty = currentSession.messages.length === 0;

  const quickPrompts = useMemo(
    () => definition.suggestedPrompts,
    [definition]
  );

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_120px_rgba(2,6,23,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_35%)]" />
      <div className="relative flex min-h-[calc(100dvh-220px)] flex-col">
        <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{definition.label}</h2>
                <p className="text-sm text-zinc-400">{definition.description}</p>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-zinc-500">
              Agent IA multi-rôles avec sélection rapide, historique séparé par agent et
              accès aux données du workspace.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Agent actif
            </label>
            <select
              value={selectedAgent}
              onChange={(event) => setSelectedAgent(event.target.value as AgentId)}
              className={formSelectClassName}
            >
              {AGENT_ORDER.map((agentId) => (
                <option key={agentId} value={agentId}>
                  {formatAgentLabel(agentId)}
                </option>
              ))}
            </select>
          </div>
        </header>

        {isEmpty ? (
          <div className="grid flex-1 place-items-center px-5 py-8">
            <div className="w-full max-w-4xl space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur">
                <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">
                  Démarrage rapide
                </p>
                <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  Parle à {definition.label} comme dans ChatGPT, avec le bon agent dès le départ.
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                  L'agent sélectionné peut t'aider à analyser, proposer, générer du contenu, préparer
                  des workflows ou déclencher des actions métier selon son périmètre.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-left text-sm leading-6 text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSend();
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={currentSession.input}
                    onChange={(event) =>
                      updateSession(selectedAgent, (session) => ({
                        ...session,
                        input: event.target.value,
                      }))
                    }
                    placeholder="Écris ta demande ici..."
                    rows={4}
                    className={`${formTextareaClassName} min-h-36 resize-none rounded-[1.75rem] border-white/10 bg-black/40 px-5 py-4 pr-16 text-base`}
                  />

                  <button
                    type="submit"
                    disabled={!currentSession.input.trim() || currentSession.isLoading}
                    className={`absolute bottom-4 right-4 h-11 w-11 rounded-full ${primaryButtonClassName}`}
                    aria-label="Envoyer"
                  >
                    {currentSession.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-6">
              {currentSession.messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={`${selectedAgent}-${index}`}
                    className={isUser ? "ml-auto max-w-[80%]" : "max-w-[88%]"}
                  >
                    <div
                      className={
                        isUser
                          ? "whitespace-pre-wrap rounded-[1.75rem] rounded-br-md bg-brand-500 px-4 py-3 text-sm leading-6 text-slate-950"
                          : "whitespace-pre-wrap rounded-[1.75rem] rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-zinc-100"
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}

              {currentSession.isLoading ? (
                <div className="max-w-[88%]">
                  <div className="flex w-fit items-center gap-2 rounded-[1.75rem] rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </div>
                </div>
              ) : null}

              <div ref={transcriptEndRef} />
            </div>

            <div className="border-t border-white/10 p-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSend();
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={currentSession.input}
                    onChange={(event) =>
                      updateSession(selectedAgent, (session) => ({
                        ...session,
                        input: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Continue la conversation..."
                    rows={2}
                    className={`${formTextareaClassName} max-h-40 resize-none rounded-[1.5rem] border-white/10 bg-black/40 px-5 py-4 pr-16`}
                  />

                  <button
                    type="submit"
                    disabled={!currentSession.input.trim() || currentSession.isLoading}
                    className={`absolute bottom-3 right-3 h-10 w-10 rounded-full ${primaryButtonClassName}`}
                    aria-label="Envoyer"
                  >
                    {currentSession.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickPrompts.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

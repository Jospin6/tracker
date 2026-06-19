"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAgentChatStore } from "@/stores/agent-ia-chat";



const emptyMessages: never[] = [];

type ChatFieldProps = {
  agentId: string;
};

export const ChatField = ({
  agentId,
}: ChatFieldProps) => {
  const messages = useAgentChatStore(
    (state) =>
      state.agents[agentId]?.messages ?? emptyMessages,
  );

  const isLoading = useAgentChatStore(
    (state) =>
      state.agents[agentId]?.isLoading ?? false,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.role === "user"
              ? "ml-auto max-w-[85%]"
              : "max-w-[90%]"
          }
        >
          <div
            className={
              message.role === "user"
                ? "whitespace-pre-wrap rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm leading-6 text-zinc-950"
                : "whitespace-pre-wrap rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-200"
            }
          >
            {message.content}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="max-w-[90%]">
          <div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyse en cours...
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
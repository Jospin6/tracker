"use client";

import {
  FormEvent,
  KeyboardEvent,
  useRef,
} from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import {
  formTextareaClassName,
  primaryButtonClassName,
} from "@/components/dashboard/ui";

import type { QuickAction } from "./chat-types";
import { useAgentChatStore } from "@/stores/agent-ia-chat";

type InputFieldProps = {
  agentId: string;
  quickActions?: QuickAction[];
  placeholder?: string;
  onSend: () => void;
};

export const InputField = ({
  agentId,
  quickActions = [],
  placeholder = "Écrivez votre demande...",
  onSend,
}: InputFieldProps) => {
  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const input = useAgentChatStore(
    (state) =>
      state.agents[agentId]?.input ?? "",
  );

  const isLoading = useAgentChatStore(
    (state) =>
      state.agents[agentId]?.isLoading ?? false,
  );

  const setInput = useAgentChatStore(
    (state) => state.setInput,
  );

  const handleQuickAction = (
    prompt: string,
  ) => {
    setInput(agentId, prompt);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();

      const promptLength = prompt.length;

      textareaRef.current?.setSelectionRange(
        promptLength,
        promptLength,
      );
    });
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    onSend();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-t border-white/10 pt-3">
      {quickActions.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  handleQuickAction(action.prompt)
                }
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Icon && (
                  <Icon className="h-3.5 w-3.5" />
                )}

                {action.label}
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) =>
              setInput(agentId, event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            disabled={isLoading}
            className={`${formTextareaClassName} max-h-40 resize-none pr-14`}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute bottom-3 right-3 h-9 w-9 p-0 ${primaryButtonClassName}`}
            aria-label="Envoyer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
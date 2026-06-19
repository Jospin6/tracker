"use client";

import {
  useCallback,
  useEffect,
} from "react";
import {
  Bot,
  type LucideIcon,
} from "lucide-react";

import {
  Panel,
  SectionTitle,
} from "@/components/dashboard/ui";

import { ChatField } from "./chat-field";
import { InputField } from "./input-field";
import type {
  ChatMessage,
  QuickAction,
} from "./chat-types";
import { useAgentChatStore } from "@/stores/agent-ia-chat";

type ChatComponentProps = {
  agentId: string;
  endpoint: string;
  title: string;
  description?: string;
  placeholder?: string;
  initialMessage?: string;
  icon?: LucideIcon;
  quickActions?: QuickAction[];
};

export const ChatComponent = ({
  agentId,
  endpoint,
  title,
  description,
  placeholder,
  initialMessage,
  icon = Bot,
  quickActions = [],
}: ChatComponentProps) => {
  const initializeAgent = useAgentChatStore(
    (state) => state.initializeAgent,
  );

  useEffect(() => {
    initializeAgent(agentId, initialMessage);
  }, [
    agentId,
    initialMessage,
    initializeAgent,
  ]);

  const sendMessage = useCallback(async () => {
    const store =
      useAgentChatStore.getState();

    const agentState =
      store.agents[agentId];

    const cleanMessage =
      agentState?.input.trim() ?? "";

    if (
      !cleanMessage ||
      agentState?.isLoading
    ) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage,
    };

    store.addMessage(agentId, userMessage);
    store.setInput(agentId, "");
    store.setLoading(agentId, true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          message: cleanMessage,
        }),
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de contacter l’agent.",
        );
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          data.answer ||
          data.message ||
          "L’agent a terminé son analyse.",
      };

      store.addMessage(
        agentId,
        assistantMessage,
      );
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue.",
      };

      store.addMessage(
        agentId,
        errorMessage,
      );
    } finally {
      store.setLoading(agentId, false);
    }
  }, [agentId, endpoint]);

  return (
    <Panel>
      <SectionTitle
        icon={icon}
        title={title}
        description={description}
      />

      <div className="mt-6 flex h-[calc(100dvh-220px)] min-h-130 flex-col overflow-hidden">
        <ChatField agentId={agentId} />

        <InputField
          agentId={agentId}
          quickActions={quickActions}
          placeholder={placeholder}
          onSend={sendMessage}
        />
      </div>
    </Panel>
  );
};
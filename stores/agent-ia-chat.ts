"use client";

import { ChatMessage } from "@/components/agents-ia/chat-types";
import { create } from "zustand";


type AgentChatState = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
};

type AgentChatStore = {
  agents: Record<string, AgentChatState>;

  initializeAgent: (
    agentId: string,
    initialMessage?: string,
  ) => void;

  setInput: (
    agentId: string,
    input: string,
  ) => void;

  addMessage: (
    agentId: string,
    message: ChatMessage,
  ) => void;

  setLoading: (
    agentId: string,
    isLoading: boolean,
  ) => void;

  resetAgent: (
    agentId: string,
    initialMessage?: string,
  ) => void;
};

const createInitialAgentState = (
  agentId: string,
  initialMessage?: string,
): AgentChatState => ({
  messages: initialMessage
    ? [
        {
          id: `${agentId}-welcome`,
          role: "assistant",
          content: initialMessage,
        },
      ]
    : [],
  input: "",
  isLoading: false,
});

export const useAgentChatStore = create<AgentChatStore>((set) => ({
  agents: {},

  initializeAgent: (agentId, initialMessage) =>
    set((state) => {
      if (state.agents[agentId]) {
        return state;
      }

      return {
        agents: {
          ...state.agents,
          [agentId]: createInitialAgentState(
            agentId,
            initialMessage,
          ),
        },
      };
    }),

  setInput: (agentId, input) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          input,
        },
      },
    })),

  addMessage: (agentId, message) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          messages: [
            ...(state.agents[agentId]?.messages ?? []),
            message,
          ],
        },
      },
    })),

  setLoading: (agentId, isLoading) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          isLoading,
        },
      },
    })),

  resetAgent: (agentId, initialMessage) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: createInitialAgentState(
          agentId,
          initialMessage,
        ),
      },
    })),
}));
"use client";

import { AgentConfig } from "./agent-configs";
import { ChatComponent } from "./chat-component";



type AgentViewProps = {
  config: AgentConfig;
};

export const AgentView = ({ config }: AgentViewProps) => {
  return (
    <div className="space-y-8">
      <ChatComponent {...config} />
    </div>
  );
};
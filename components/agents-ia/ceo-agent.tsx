"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";



export const CEOAgent = () => {
  return <AgentView config={agentConfigs.ceo} />;
};
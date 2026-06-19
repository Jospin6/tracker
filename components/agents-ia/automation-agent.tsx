"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";

export const AutomationAgent = () => {
  return <AgentView config={agentConfigs.automation} />;
};
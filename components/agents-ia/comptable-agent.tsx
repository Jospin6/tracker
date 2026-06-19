"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";

export const ComptableAgent = () => {
    return <AgentView config={agentConfigs.comptable} />;
}
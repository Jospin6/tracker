"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";

export const FinanceAgent = () => {
    return <AgentView config={agentConfigs.finance} />;
}
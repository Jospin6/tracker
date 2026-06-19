"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";

export const MarketingAgent = () => {
    return <AgentView config={agentConfigs.marketing} />;
}
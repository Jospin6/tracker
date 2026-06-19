"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";

export const CommercialAgent = () => {
    return <AgentView config={agentConfigs.commercial} />;
}
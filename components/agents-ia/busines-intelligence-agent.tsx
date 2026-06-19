"use client";

import { agentConfigs } from "./agent-configs";
import { AgentView } from "./agentView";


export const BusinessIntelligenceAgent = () => {
    return <AgentView config={agentConfigs.businessIntelligence} />;
}
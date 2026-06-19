"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";

export const LinkedInAgent = () => {
    return <AgentView config={agentConfigs.linkedin} />;
}
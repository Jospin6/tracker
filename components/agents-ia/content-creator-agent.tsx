"use client";

import { agentConfigs } from "./agent-configs";
import { AgentView } from "./agentView";

export const ContentCreatorAgent = () => {
    return <AgentView config={agentConfigs.contentCreator} />;
}
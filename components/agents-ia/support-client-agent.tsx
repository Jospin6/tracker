"use client";

import { agentConfigs } from "./agent-configs";
import { AgentView } from "./agentView";

export const SupportClientAgent = () => {
    return <AgentView config={agentConfigs.supportClient} />;
}
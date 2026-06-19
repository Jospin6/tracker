"use client";

import { AgentView } from "./agentView";
import { agentConfigs } from "./agent-configs";

export const ProjectsManagerAgent = () => {
    return <AgentView config={agentConfigs.projectsManager} />;
}
"use client";

import { agentConfigs } from "./agent-configs"
import { AgentView } from "./agentView"


export const ProductsManagerAgent = () => {
    return <AgentView config={agentConfigs.productsManager} />
}
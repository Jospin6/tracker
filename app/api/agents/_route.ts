import { NextResponse } from "next/server";

import { getAgentDefinition } from "@/lib/ai/agents";
import { runAgentChat } from "@/lib/ai/agent-runtime";

type RouteContext = {
  params: Promise<Record<string, string>>;
};

export function createPlaceholderAgentRoute(agentId: string) {
  return {
    async GET() {
      const definition = getAgentDefinition(agentId);

      return NextResponse.json({
        agent: definition ?? { id: agentId, label: agentId },
        ok: true,
      });
    },
    async POST(request: Request) {
      const body = (await request.json().catch(() => ({}))) as {
        messages?: Array<{ content: string; role: "assistant" | "user" }>;
      };

      const result = await runAgentChat({
        agentId,
        messages: body.messages ?? [],
      });

      return NextResponse.json(result);
    },
  };
}

export async function GET(_request: Request, _context: RouteContext) {
  return NextResponse.json({ ok: true });
}

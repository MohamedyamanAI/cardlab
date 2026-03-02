import { ToolLoopAgent, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import type { ToolLoopAgentSettings } from "ai";

type CreateAgentOptions = {
  instructions: string;
  maxSteps?: number;
};

/**
 * Creates a ToolLoopAgent with Google Search and a configurable system prompt.
 * Reusable across features — each caller provides its own instructions.
 */
export function createAgent({ instructions, maxSteps = 10 }: CreateAgentOptions) {
  return new ToolLoopAgent({
    model: google("gemini-2.5-flash"),
    instructions,
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    stopWhen: stepCountIs(maxSteps),
  } satisfies ToolLoopAgentSettings);
}

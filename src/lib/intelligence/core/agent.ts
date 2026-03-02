import { ToolLoopAgent, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import type { ToolLoopAgentSettings } from "ai";

type CreateAgentOptions = {
  instructions: string;
  model?: string;
  maxSteps?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: Record<string, any>;
};

/**
 * Creates a ToolLoopAgent with a configurable system prompt.
 * Reusable across features — each caller provides its own instructions.
 *
 * NOTE: Google's provider-defined tools (e.g. googleSearch) and custom
 * function tools cannot be mixed — the @ai-sdk/google provider returns
 * early when provider tools are present, dropping all function declarations.
 * Google Search is only included when no custom tools are provided.
 */
export function createAgent({ instructions, model = "gemini-2.5-flash", maxSteps = 10, tools }: CreateAgentOptions) {
  const hasCustomTools = tools && Object.keys(tools).length > 0;

  return new ToolLoopAgent({
    model: google(model),
    instructions,
    tools: hasCustomTools
      ? tools
      : { google_search: google.tools.googleSearch({}) },
    stopWhen: stepCountIs(maxSteps),
  } satisfies ToolLoopAgentSettings);
}

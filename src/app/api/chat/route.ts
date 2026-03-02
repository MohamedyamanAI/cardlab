import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { createIdeationAgent } from "@/lib/intelligence/features/ideation";

const ALLOWED_MODELS = new Set(["gemini-2.5-flash", "gemini-2.5-pro"]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, model }: { messages: UIMessage[]; model?: string } =
    await req.json();

  const selectedModel = model && ALLOWED_MODELS.has(model) ? model : undefined;

  return createAgentUIStreamResponse({
    agent: createIdeationAgent({
      model: selectedModel,
      supabase,
      userId: user.id,
    }),
    uiMessages: messages,
    abortSignal: req.signal,
  });
}

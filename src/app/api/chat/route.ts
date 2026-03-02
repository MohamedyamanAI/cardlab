import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { ideationAgent } from "@/lib/intelligence/features/ideation";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  return createAgentUIStreamResponse({
    agent: ideationAgent,
    uiMessages: messages,
    abortSignal: req.signal,
  });
}

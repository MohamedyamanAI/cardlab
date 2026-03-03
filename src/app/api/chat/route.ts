import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { createIdeationAgent } from "@/lib/intelligence/features/ideation";
import { preprocessMessages } from "@/lib/intelligence/core/preprocess-messages";
import { isValidChatModel } from "@/lib/intelligence/core/providers";

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

  const selectedModel = model && isValidChatModel(model) ? model : undefined;
  const processedMessages = preprocessMessages(messages);

  return createAgentUIStreamResponse({
    agent: createIdeationAgent({
      model: selectedModel,
      supabase,
      userId: user.id,
    }),
    uiMessages: processedMessages,
    abortSignal: req.signal,
  });
}

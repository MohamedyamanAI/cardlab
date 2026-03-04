"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as chatsRepo from "@/lib/repository/chats";
import {
  createChatSchema,
  chatIdSchema,
  saveMessagesSchema,
} from "@/lib/validations/chats";
import type { AiChat, AiChatMessage, ActionResult } from "@/lib/types";

export async function getChats(): Promise<ActionResult<AiChat[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const chats = await chatsRepo.getChatsByUser(supabase, user.id);
    return { success: true, data: chats };
  } catch {
    return { success: false, error: "Failed to fetch chats" };
  }
}

export async function createChat(
  title: string
): Promise<ActionResult<AiChat>> {
  const parsed = createChatSchema.safeParse({ title });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const chat = await chatsRepo.createChat(
      supabase,
      user.id,
      parsed.data.title
    );
    revalidatePath("/ideator");
    return { success: true, data: chat };
  } catch {
    return { success: false, error: "Failed to create chat" };
  }
}

export async function deleteChat(chatId: string): Promise<ActionResult> {
  const parsed = chatIdSchema.safeParse({ chatId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await chatsRepo.getChatById(supabase, parsed.data.chatId, user.id);
    await chatsRepo.deleteChat(supabase, parsed.data.chatId);
    revalidatePath("/ideator");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete chat" };
  }
}

export async function getChatMessages(
  chatId: string
): Promise<ActionResult<AiChatMessage[]>> {
  const parsed = chatIdSchema.safeParse({ chatId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await chatsRepo.getChatById(supabase, parsed.data.chatId, user.id);
    const messages = await chatsRepo.getMessagesByChat(
      supabase,
      parsed.data.chatId
    );
    return { success: true, data: messages };
  } catch {
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function saveMessages(
  chatId: string,
  messages: {
    role: "user" | "assistant" | "tool";
    content: string | null;
    toolCalls?: unknown;
    attachments?: { mediaId: string; filename: string; mediaType: string }[];
    usage?: {
      inputTokens: number;
      outputTokens: number;
      reasoningTokens: number;
      totalTokens: number;
      model: string;
      cost: {
        inputCost: number;
        outputCost: number;
        reasoningCost: number;
        totalCost: number;
      };
    };
  }[]
): Promise<ActionResult> {
  const parsed = saveMessagesSchema.safeParse({ chatId, messages });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await chatsRepo.getChatById(supabase, parsed.data.chatId, user.id);

    await chatsRepo.bulkCreateMessages(
      supabase,
      parsed.data.messages.map((m) => ({
        chatId: parsed.data.chatId,
        role: m.role as "user" | "assistant" | "tool",
        content: m.content ?? null,
        toolCalls: m.toolCalls as import("@/lib/supabase/database.types").Json | undefined,
        attachments: m.attachments as import("@/lib/supabase/database.types").Json | undefined,
        usage: m.usage as import("@/lib/supabase/database.types").Json | undefined,
      }))
    );

    await chatsRepo.touchChat(supabase, parsed.data.chatId);
    revalidatePath("/ideator");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to save messages" };
  }
}

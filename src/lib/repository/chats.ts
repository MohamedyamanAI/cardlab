import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { AiChat, AiChatMessage } from "@/lib/types";
import { sanitizeError } from "./error-utils";

export async function getChatsByUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AiChat[]> {
  const { data, error } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw sanitizeError(error, "getChatsByUser", { userId });
  return data;
}

export async function getChatById(
  supabase: SupabaseClient<Database>,
  chatId: string,
  userId: string
): Promise<AiChat> {
  const { data, error } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_id", userId)
    .single();

  if (error) throw sanitizeError(error, "getChatById", { chatId, userId });
  return data;
}

export async function createChat(
  supabase: SupabaseClient<Database>,
  userId: string,
  title: string
): Promise<AiChat> {
  const { data, error } = await supabase
    .from("ai_chats")
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createChat", { userId });
  return data;
}

export async function updateChatTitle(
  supabase: SupabaseClient<Database>,
  chatId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", chatId);

  if (error) throw sanitizeError(error, "updateChatTitle", { chatId });
}

export async function touchChat(
  supabase: SupabaseClient<Database>,
  chatId: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);

  if (error) throw sanitizeError(error, "touchChat", { chatId });
}

export async function deleteChat(
  supabase: SupabaseClient<Database>,
  chatId: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .delete()
    .eq("id", chatId);

  if (error) throw sanitizeError(error, "deleteChat", { chatId });
}

export async function getMessagesByChat(
  supabase: SupabaseClient<Database>,
  chatId: string
): Promise<AiChatMessage[]> {
  const { data, error } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw sanitizeError(error, "getMessagesByChat", { chatId });
  return data;
}

export async function createMessage(
  supabase: SupabaseClient<Database>,
  params: {
    chatId: string;
    role: "user" | "assistant" | "tool";
    content: string | null;
    toolCalls?: Json;
    toolCallId?: string;
  }
): Promise<AiChatMessage> {
  const { data, error } = await supabase
    .from("ai_chat_messages")
    .insert({
      chat_id: params.chatId,
      role: params.role,
      content: params.content,
      tool_calls: params.toolCalls ?? null,
      tool_call_id: params.toolCallId ?? null,
    })
    .select()
    .single();

  if (error)
    throw sanitizeError(error, "createMessage", { chatId: params.chatId });
  return data;
}

export async function bulkCreateMessages(
  supabase: SupabaseClient<Database>,
  messages: {
    chatId: string;
    role: "user" | "assistant" | "tool";
    content: string | null;
    toolCalls?: Json;
    toolCallId?: string;
    attachments?: Json;
  }[]
): Promise<void> {
  const rows = messages.map((m) => ({
    chat_id: m.chatId,
    role: m.role,
    content: m.content,
    tool_calls: m.toolCalls ?? null,
    tool_call_id: m.toolCallId ?? null,
    attachments: m.attachments ?? null,
  }));

  const { error } = await supabase.from("ai_chat_messages").insert(rows);
  if (error) throw sanitizeError(error, "bulkCreateMessages");
}

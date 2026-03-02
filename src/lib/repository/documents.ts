import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { Document } from "@/lib/types";
import { sanitizeError } from "./error-utils";

export async function getDocumentsByUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw sanitizeError(error, "getDocumentsByUser", { userId });
  return data;
}

export async function getDocumentById(
  supabase: SupabaseClient<Database>,
  documentId: string,
  userId: string
): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (error)
    throw sanitizeError(error, "getDocumentById", { documentId, userId });
  return data;
}

export async function createDocument(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    title: string;
    type?: string | null;
    projectId?: string | null;
    content?: Json;
  }
): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: params.userId,
      title: params.title,
      type: (params.type as Document["type"]) ?? null,
      project_id: params.projectId ?? null,
      content: params.content ?? { type: "doc", content: [{ type: "paragraph" }] },
    })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createDocument", { userId: params.userId });
  return data;
}

export async function updateDocument(
  supabase: SupabaseClient<Database>,
  documentId: string,
  updates: {
    title?: string;
    type?: string | null;
    projectId?: string | null;
    content?: Json;
  }
): Promise<Document> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
  if (updates.content !== undefined) updateData.content = updates.content;

  const { data, error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw sanitizeError(error, "updateDocument", { documentId });
  return data;
}

export async function deleteDocument(
  supabase: SupabaseClient<Database>,
  documentId: string
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) throw sanitizeError(error, "deleteDocument", { documentId });
}

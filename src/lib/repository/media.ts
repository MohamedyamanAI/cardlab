import { SupabaseClient } from "@supabase/supabase-js";
import type { Media, MediaType } from "@/lib/types";

export async function getMediaByUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Media[]> {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Media[];
}

export async function createMediaRecord(
  supabase: SupabaseClient,
  params: {
    userId: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
    type: MediaType;
  }
): Promise<Media> {
  const { data, error } = await supabase
    .from("media")
    .insert({
      user_id: params.userId,
      original_name: params.originalName,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
      storage_path: params.storagePath,
      type: params.type,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Media;
}

export async function deleteMediaRecord(
  supabase: SupabaseClient,
  mediaId: string
): Promise<void> {
  const { error } = await supabase.from("media").delete().eq("id", mediaId);
  if (error) throw error;
}

export async function bulkDeleteMediaRecords(
  supabase: SupabaseClient,
  mediaIds: string[]
): Promise<void> {
  const { error } = await supabase
    .from("media")
    .delete()
    .in("id", mediaIds);

  if (error) throw error;
}

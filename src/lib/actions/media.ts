"use server";

import { createClient } from "@/lib/supabase/server";
import * as mediaRepo from "@/lib/repository/media";
import type { Media, ActionResult } from "@/lib/types";

export async function getMedia(): Promise<ActionResult<Media[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const media = await mediaRepo.getMediaByUser(supabase, user.id);
    return { success: true, data: media };
  } catch {
    return { success: false, error: "Failed to fetch media" };
  }
}

export async function uploadMedia(
  formData: FormData
): Promise<ActionResult<Media>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { success: false, error: "File exceeds 10MB limit" };
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Unsupported file type" };
  }

  try {
    const uuid = crypto.randomUUID();
    const storagePath = `users/${user.id}/${uuid}_${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const media = await mediaRepo.createMediaRecord(supabase, {
      userId: user.id,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storagePath,
      type: "image",
    });

    return { success: true, data: media };
  } catch {
    return { success: false, error: "Failed to upload file" };
  }
}

export async function saveGeneratedImage(params: {
  base64: string;
  prompt: string;
  aspectRatio: string;
  model: string;
}): Promise<ActionResult<Media>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const buffer = Buffer.from(params.base64, "base64");
    const uuid = crypto.randomUUID();
    const filename = `generated_${uuid}.png`;
    const storagePath = `users/${user.id}/${uuid}_${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const media = await mediaRepo.createMediaRecord(supabase, {
      userId: user.id,
      originalName: filename,
      mimeType: "image/png",
      sizeBytes: buffer.byteLength,
      storagePath,
      type: "image",
    });

    return { success: true, data: media };
  } catch {
    return { success: false, error: "Failed to save generated image" };
  }
}

export async function deleteMedia(
  mediaIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (mediaIds.length === 0) {
    return { success: false, error: "No media to delete" };
  }

  try {
    // Fetch storage paths before deleting records
    const { data: mediaRows, error: fetchError } = await supabase
      .from("media")
      .select("storage_path")
      .in("id", mediaIds)
      .eq("user_id", user.id);

    if (fetchError) throw fetchError;

    const paths = (mediaRows ?? []).map((r) => r.storage_path);

    // Delete from storage
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove(paths);
      if (storageError) throw storageError;
    }

    // Delete DB records
    await mediaRepo.bulkDeleteMediaRecords(supabase, mediaIds);

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete media" };
  }
}

export async function resolveMediaIds(
  mediaIds: string[]
): Promise<
  ActionResult<
    Record<string, { signedUrl: string; storagePath: string; originalName: string }>
  >
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (mediaIds.length === 0) {
    return { success: true, data: {} };
  }

  try {
    const { data: mediaRows, error: fetchError } = await supabase
      .from("media")
      .select("id, storage_path, original_name")
      .in("id", mediaIds)
      .eq("user_id", user.id);

    if (fetchError) throw fetchError;
    if (!mediaRows || mediaRows.length === 0) {
      return { success: true, data: {} };
    }

    const paths = mediaRows.map((r) => r.storage_path);
    const { data: signedData, error: signError } = await supabase.storage
      .from("media")
      .createSignedUrls(paths, 3600);

    if (signError) throw signError;

    const pathToUrl: Record<string, string> = {};
    for (const item of signedData ?? []) {
      if (item.signedUrl && item.path) {
        pathToUrl[item.path] = item.signedUrl;
      }
    }

    const result: Record<
      string,
      { signedUrl: string; storagePath: string; originalName: string }
    > = {};
    for (const row of mediaRows) {
      const url = pathToUrl[row.storage_path];
      if (url) {
        result[row.id] = {
          signedUrl: url,
          storagePath: row.storage_path,
          originalName: row.original_name ?? "image",
        };
      }
    }

    return { success: true, data: result };
  } catch {
    return { success: false, error: "Failed to resolve media" };
  }
}

export async function getSignedUrl(
  storagePath: string
): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabase.storage
      .from("media")
      .createSignedUrl(storagePath, 3600);

    if (error) throw error;
    return { success: true, data: data.signedUrl };
  } catch {
    return { success: false, error: "Failed to generate signed URL" };
  }
}

export async function getSignedUrls(
  storagePaths: string[]
): Promise<ActionResult<Record<string, string>>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (storagePaths.length === 0) {
    return { success: true, data: {} };
  }

  try {
    const { data, error } = await supabase.storage
      .from("media")
      .createSignedUrls(storagePaths, 3600);

    if (error) throw error;

    const urlMap: Record<string, string> = {};
    for (const item of data ?? []) {
      if (item.signedUrl && item.path) {
        urlMap[item.path] = item.signedUrl;
      }
    }

    return { success: true, data: urlMap };
  } catch {
    return { success: false, error: "Failed to generate signed URLs" };
  }
}

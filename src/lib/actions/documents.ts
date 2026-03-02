"use server";

import { createClient } from "@/lib/supabase/server";
import * as docRepo from "@/lib/repository/documents";
import type { Document, ActionResult } from "@/lib/types";
import type { Json } from "@/lib/supabase/database.types";
import {
  createDocumentSchema,
  updateDocumentSchema,
} from "@/lib/validations/documents";

export async function getDocuments(): Promise<ActionResult<Document[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const documents = await docRepo.getDocumentsByUser(supabase, user.id);
    return { success: true, data: documents };
  } catch {
    return { success: false, error: "Failed to fetch documents" };
  }
}

export async function getDocument(
  id: string
): Promise<ActionResult<Document>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const document = await docRepo.getDocumentById(supabase, id, user.id);
    return { success: true, data: document };
  } catch {
    return { success: false, error: "Failed to fetch document" };
  }
}

export async function createDocument(input: {
  title: string;
  type?: string;
  project_id?: string;
  content?: Record<string, unknown>;
}): Promise<ActionResult<Document>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = createDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const document = await docRepo.createDocument(supabase, {
      userId: user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      projectId: parsed.data.project_id,
      content: parsed.data.content as Json,
    });
    return { success: true, data: document };
  } catch {
    return { success: false, error: "Failed to create document" };
  }
}

export async function updateDocument(
  id: string,
  input: {
    title?: string;
    type?: string | null;
    project_id?: string | null;
    content?: Record<string, unknown>;
  }
): Promise<ActionResult<Document>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = updateDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Verify ownership
    await docRepo.getDocumentById(supabase, id, user.id);

    const document = await docRepo.updateDocument(supabase, id, {
      title: parsed.data.title,
      type: parsed.data.type,
      projectId: parsed.data.project_id,
      content: parsed.data.content as Json,
    });
    return { success: true, data: document };
  } catch {
    return { success: false, error: "Failed to update document" };
  }
}

export async function deleteDocument(
  id: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Verify ownership
    await docRepo.getDocumentById(supabase, id, user.id);
    await docRepo.deleteDocument(supabase, id);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete document" };
  }
}

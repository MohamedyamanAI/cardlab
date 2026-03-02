"use server";

import { createClient } from "@/lib/supabase/server";
import * as cardsRepo from "@/lib/repository/cards";
import * as projectsRepo from "@/lib/repository/projects";
import type { Card, ActionResult } from "@/lib/types";

async function verifyProjectOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
): Promise<boolean> {
  try {
    await projectsRepo.getProjectById(supabase, projectId, userId);
    return true;
  } catch {
    return false;
  }
}

export async function getCards(
  projectId: string
): Promise<ActionResult<Card[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const cards = await cardsRepo.getCardsByProject(supabase, projectId);
    return { success: true, data: cards };
  } catch {
    return { success: false, error: "Failed to fetch cards" };
  }
}

export async function createCard(
  projectId: string
): Promise<ActionResult<Card>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const card = await cardsRepo.createCard(supabase, projectId);
    return { success: true, data: card };
  } catch {
    return { success: false, error: "Failed to create card" };
  }
}

export async function updateCardCell(
  cardId: string,
  slug: string,
  value: unknown
): Promise<ActionResult<Card>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Verify ownership via the card's project
  const { data: cardRow, error: fetchError } = await supabase
    .from("cards")
    .select("project_id")
    .eq("id", cardId)
    .single();

  if (fetchError || !cardRow)
    return { success: false, error: "Card not found" };

  if (!(await verifyProjectOwnership(supabase, cardRow.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const card = await cardsRepo.updateCardData(supabase, cardId, {
      [slug]: value,
    });
    return { success: true, data: card };
  } catch {
    return { success: false, error: "Failed to update card" };
  }
}

export async function deleteCards(
  cardIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (cardIds.length === 0) {
    return { success: false, error: "No cards to delete" };
  }

  // Verify ownership via the first card's project
  const { data: cardRow, error: fetchError } = await supabase
    .from("cards")
    .select("project_id")
    .eq("id", cardIds[0])
    .single();

  if (fetchError || !cardRow)
    return { success: false, error: "Card not found" };

  if (!(await verifyProjectOwnership(supabase, cardRow.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    await cardsRepo.bulkDeleteCards(supabase, cardIds);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete cards" };
  }
}

export async function duplicateCards(
  cardIds: string[],
  projectId: string
): Promise<ActionResult<Card[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const cards = await cardsRepo.duplicateCards(supabase, cardIds, projectId);
    return { success: true, data: cards };
  } catch {
    return { success: false, error: "Failed to duplicate cards" };
  }
}

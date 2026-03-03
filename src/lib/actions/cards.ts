"use server";

import { createClient } from "@/lib/supabase/server";
import * as cardsRepo from "@/lib/repository/cards";
import { verifyProjectOwnership } from "@/lib/actions/auth-utils";
import {
  createCardSchema,
  updateCardDataSchema,
  bulkDeleteCardsSchema,
  duplicateCardsSchema,
  updateCardStatusSchema,
} from "@/lib/validations/cards";
import * as versionsRepo from "@/lib/repository/versions";
import type { Card, ActionResult, StatusEnum } from "@/lib/types";

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
  const parsed = createCardSchema.safeParse({ project_id: projectId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, parsed.data.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const card = await cardsRepo.createCard(supabase, parsed.data.project_id);
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
  const parsed = updateCardDataSchema.safeParse({ card_id: cardId, data: { [slug]: value } });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: cardRow, error: fetchError } = await supabase
    .from("cards")
    .select("project_id")
    .eq("id", parsed.data.card_id)
    .single();

  if (fetchError || !cardRow)
    return { success: false, error: "Card not found" };

  if (!(await verifyProjectOwnership(supabase, cardRow.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const card = await cardsRepo.updateCardData(supabase, parsed.data.card_id, {
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
  const parsed = bulkDeleteCardsSchema.safeParse({ card_ids: cardIds });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

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

export async function updateCardStatus(
  cardId: string,
  status: StatusEnum
): Promise<ActionResult<Card>> {
  const parsed = updateCardStatusSchema.safeParse({ card_id: cardId, status });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Fetch current card to verify ownership and snapshot before status change
    const card = await cardsRepo.getCard(supabase, cardId);
    if (!(await verifyProjectOwnership(supabase, card.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    // Snapshot current state before status change
    await versionsRepo.createCardVersion(supabase, cardId, card, {
      reason: "status_change",
      createdBy: user.id,
    });

    const updated = await cardsRepo.updateCardStatus(supabase, cardId, parsed.data.status);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update card status" };
  }
}

export async function duplicateCards(
  cardIds: string[],
  projectId: string
): Promise<ActionResult<Card[]>> {
  const parsed = duplicateCardsSchema.safeParse({ card_ids: cardIds, project_id: projectId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, parsed.data.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const cards = await cardsRepo.duplicateCards(supabase, cardIds, projectId);
    return { success: true, data: cards };
  } catch {
    return { success: false, error: "Failed to duplicate cards" };
  }
}

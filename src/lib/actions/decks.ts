"use server";

import { createClient } from "@/lib/supabase/server";
import * as decksRepo from "@/lib/repository/decks";
import type { Deck, ActionResult } from "@/lib/types";

export async function getDecks(
  projectId: string
): Promise<ActionResult<Deck[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const decks = await decksRepo.getDecksByProject(supabase, projectId);
    return { success: true, data: decks };
  } catch {
    return { success: false, error: "Failed to fetch decks" };
  }
}

export async function createDeck(input: {
  project_id: string;
  name: string;
  description?: string;
}): Promise<ActionResult<Deck>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!input.name || input.name.trim().length === 0) {
    return { success: false, error: "Deck name is required" };
  }

  try {
    const deck = await decksRepo.createDeck(supabase, input.project_id, {
      name: input.name.trim(),
      description: input.description?.trim(),
    });
    return { success: true, data: deck };
  } catch {
    return { success: false, error: "Failed to create deck" };
  }
}

export async function getDeckCardIds(
  deckId: string
): Promise<ActionResult<string[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const cardIds = await decksRepo.getDeckCardIds(supabase, deckId);
    return { success: true, data: cardIds };
  } catch {
    return { success: false, error: "Failed to fetch deck cards" };
  }
}

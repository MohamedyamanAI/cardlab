"use server";

import { createClient } from "@/lib/supabase/server";
import * as decksRepo from "@/lib/repository/decks";
import { verifyProjectOwnership } from "@/lib/actions/auth-utils";
import { createDeckSchema } from "@/lib/validations/decks";
import type { Deck, ActionResult } from "@/lib/types";

export async function getDecks(
  projectId: string
): Promise<ActionResult<Deck[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return { success: false, error: "Project not found" };
  }

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
  const parsed = createDeckSchema.safeParse(input);
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
    const deck = await decksRepo.createDeck(supabase, parsed.data.project_id, {
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
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

export async function getDeckCardQuantities(
  deckId: string
): Promise<ActionResult<{ card_id: string; quantity: number }[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const quantities = await decksRepo.getDeckCardQuantities(supabase, deckId);
    return { success: true, data: quantities };
  } catch {
    return { success: false, error: "Failed to fetch deck card quantities" };
  }
}

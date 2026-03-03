"use server";

import { createClient } from "@/lib/supabase/server";
import * as decksRepo from "@/lib/repository/decks";
import { verifyProjectOwnership } from "@/lib/actions/auth-utils";
import { createDeckSchema, updateDeckStatusSchema, updateDeckSchema } from "@/lib/validations/decks";
import * as versionsRepo from "@/lib/repository/versions";
import type { Deck, ActionResult, StatusEnum } from "@/lib/types";

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

export async function updateDeckStatus(
  deckId: string,
  status: StatusEnum
): Promise<ActionResult<Deck>> {
  const parsed = updateDeckStatusSchema.safeParse({ deck_id: deckId, status });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Fetch current deck to verify ownership and snapshot
    const { data: deck, error: fetchError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (fetchError || !deck) return { success: false, error: "Deck not found" };

    if (!(await verifyProjectOwnership(supabase, deck.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    // Snapshot current state before status change
    const deckCards = await decksRepo.getDeckCardQuantities(supabase, deckId);
    await versionsRepo.createDeckVersion(supabase, deckId, deck as Deck, deckCards, {
      reason: "status_change",
      createdBy: user.id,
    });

    const updated = await decksRepo.updateDeckStatus(supabase, deckId, parsed.data.status);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update deck status" };
  }
}

export async function updateDeck(
  deckId: string,
  input: { name?: string; description?: string }
): Promise<ActionResult<Deck>> {
  const parsed = updateDeckSchema.safeParse({ deck_id: deckId, ...input });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: deck, error: fetchError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (fetchError || !deck) return { success: false, error: "Deck not found" };

    if (!(await verifyProjectOwnership(supabase, deck.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    const updated = await decksRepo.updateDeck(supabase, deckId, {
      name: parsed.data.name,
      description: parsed.data.description,
    });
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update deck" };
  }
}

export async function deleteDeck(
  deckId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: deck, error: fetchError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (fetchError || !deck) return { success: false, error: "Deck not found" };

    if (!(await verifyProjectOwnership(supabase, deck.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    await decksRepo.deleteDeck(supabase, deckId);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete deck" };
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

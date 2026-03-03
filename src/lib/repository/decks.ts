import { SupabaseClient } from "@supabase/supabase-js";
import type { Deck, StatusEnum } from "@/lib/types";
import { sanitizeError } from "./error-utils";

export async function getDecksByProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw sanitizeError(error, "getDecksByProject", { projectId });
  return data as Deck[];
}

export async function createDeck(
  supabase: SupabaseClient,
  projectId: string,
  input: { name: string; description?: string }
): Promise<Deck> {
  const { data, error } = await supabase
    .from("decks")
    .insert({ project_id: projectId, ...input })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createDeck", { projectId });
  return data as Deck;
}

export async function updateDeckStatus(
  supabase: SupabaseClient,
  deckId: string,
  status: StatusEnum
): Promise<Deck> {
  const { data: deck, error } = await supabase
    .from("decks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", deckId)
    .select()
    .single();

  if (error) throw sanitizeError(error, "updateDeckStatus", { deckId });
  return deck as Deck;
}

export async function updateDeck(
  supabase: SupabaseClient,
  deckId: string,
  input: { name?: string; description?: string }
): Promise<Deck> {
  const { data, error } = await supabase
    .from("decks")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", deckId)
    .select()
    .single();

  if (error) throw sanitizeError(error, "updateDeck", { deckId });
  return data as Deck;
}

export async function deleteDeck(
  supabase: SupabaseClient,
  deckId: string
): Promise<void> {
  const { error } = await supabase.from("decks").delete().eq("id", deckId);
  if (error) throw sanitizeError(error, "deleteDeck", { deckId });
}

export async function getDeckCardIds(
  supabase: SupabaseClient,
  deckId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("deck_cards")
    .select("card_id")
    .eq("deck_id", deckId);

  if (error) throw sanitizeError(error, "getDeckCardIds", { deckId });
  return (data ?? []).map((row) => row.card_id);
}

export async function getDeckCardQuantities(
  supabase: SupabaseClient,
  deckId: string
): Promise<{ card_id: string; quantity: number }[]> {
  const { data, error } = await supabase
    .from("deck_cards")
    .select("card_id, quantity")
    .eq("deck_id", deckId);

  if (error) throw sanitizeError(error, "getDeckCardQuantities", { deckId });
  return (data ?? []).map((row) => ({
    card_id: row.card_id,
    quantity: row.quantity ?? 1,
  }));
}

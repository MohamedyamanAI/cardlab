import { SupabaseClient } from "@supabase/supabase-js";
import type { Deck } from "@/lib/types";

export async function getDecksByProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
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

  if (error) throw error;
  return data as Deck;
}

export async function getDeckCardIds(
  supabase: SupabaseClient,
  deckId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("deck_cards")
    .select("card_id")
    .eq("deck_id", deckId);

  if (error) throw error;
  return (data ?? []).map((row) => row.card_id);
}

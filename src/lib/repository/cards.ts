import { SupabaseClient } from "@supabase/supabase-js";
import type { Card } from "@/lib/types";

export async function getCardsByProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Card[];
}

export async function createCard(
  supabase: SupabaseClient,
  projectId: string,
  data?: Record<string, unknown>
): Promise<Card> {
  const { data: card, error } = await supabase
    .from("cards")
    .insert({
      project_id: projectId,
      data: data ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return card as Card;
}

export async function updateCardData(
  supabase: SupabaseClient,
  cardId: string,
  cellData: Record<string, unknown>
): Promise<Card> {
  // Fetch current data to merge
  const { data: existing, error: fetchError } = await supabase
    .from("cards")
    .select("data")
    .eq("id", cardId)
    .single();

  if (fetchError) throw fetchError;

  const mergedData = {
    ...(typeof existing.data === "object" && existing.data !== null
      ? existing.data
      : {}),
    ...cellData,
  };

  const { data: card, error } = await supabase
    .from("cards")
    .update({ data: mergedData, updated_at: new Date().toISOString() })
    .eq("id", cardId)
    .select()
    .single();

  if (error) throw error;
  return card as Card;
}

export async function deleteCard(
  supabase: SupabaseClient,
  cardId: string
): Promise<void> {
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw error;
}

export async function bulkDeleteCards(
  supabase: SupabaseClient,
  cardIds: string[]
): Promise<void> {
  const { error } = await supabase
    .from("cards")
    .delete()
    .in("id", cardIds);

  if (error) throw error;
}

export async function duplicateCards(
  supabase: SupabaseClient,
  cardIds: string[],
  projectId: string
): Promise<Card[]> {
  // Fetch source cards
  const { data: sourceCards, error: fetchError } = await supabase
    .from("cards")
    .select("data")
    .in("id", cardIds);

  if (fetchError) throw fetchError;
  if (!sourceCards || sourceCards.length === 0) return [];

  // Insert duplicates
  const inserts = sourceCards.map((card) => ({
    project_id: projectId,
    data: card.data,
  }));

  const { data: newCards, error } = await supabase
    .from("cards")
    .insert(inserts)
    .select();

  if (error) throw error;
  return newCards as Card[];
}

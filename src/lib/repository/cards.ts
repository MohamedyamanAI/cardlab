import { SupabaseClient } from "@supabase/supabase-js";
import type { Card } from "@/lib/types";
import { sanitizeError } from "./error-utils";

export async function getCardsByProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw sanitizeError(error, "getCardsByProject", { projectId });
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

  if (error) throw sanitizeError(error, "createCard", { projectId });
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

  if (fetchError) throw sanitizeError(fetchError, "updateCardData", { cardId });

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

  if (error) throw sanitizeError(error, "updateCardData", { cardId });
  return card as Card;
}

export async function deleteCard(
  supabase: SupabaseClient,
  cardId: string
): Promise<void> {
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw sanitizeError(error, "deleteCard", { cardId });
}

export async function bulkDeleteCards(
  supabase: SupabaseClient,
  cardIds: string[]
): Promise<void> {
  const { error } = await supabase
    .from("cards")
    .delete()
    .in("id", cardIds);

  if (error) throw sanitizeError(error, "bulkDeleteCards");
}

export async function bulkCreateCards(
  supabase: SupabaseClient,
  projectId: string,
  dataArray: Record<string, unknown>[]
): Promise<Card[]> {
  const inserts = dataArray.map((data) => ({
    project_id: projectId,
    data,
  }));

  const { data: cards, error } = await supabase
    .from("cards")
    .insert(inserts)
    .select();

  if (error) throw sanitizeError(error, "bulkCreateCards", { projectId });
  return cards as Card[];
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

  if (fetchError) throw sanitizeError(fetchError, "duplicateCards", { cardIds });
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

  if (error) throw sanitizeError(error, "duplicateCards", { projectId });
  return newCards as Card[];
}

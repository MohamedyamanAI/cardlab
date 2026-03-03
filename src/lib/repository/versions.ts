import { SupabaseClient } from "@supabase/supabase-js";
import type {
  Card,
  CardVersion,
  Document,
  DocumentVersion,
  Deck,
  DeckVersion,
  VersionReason,
} from "@/lib/types";
import { sanitizeError } from "./error-utils";

interface VersionInput {
  reason: VersionReason;
  createdBy: string;
  label?: string;
}

// ============================================================================
// Card Versions
// ============================================================================

export async function createCardVersion(
  supabase: SupabaseClient,
  cardId: string,
  card: Card,
  input: VersionInput
): Promise<CardVersion> {
  const nextVersion = await getNextVersionNumber(supabase, "card_versions", "card_id", cardId);

  const { data, error } = await supabase
    .from("card_versions")
    .insert({
      card_id: cardId,
      project_id: card.project_id,
      version_number: nextVersion,
      data: card.data,
      status: card.status,
      reason: input.reason,
      label: input.label ?? null,
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createCardVersion", { cardId });
  return data as CardVersion;
}

export async function getCardVersions(
  supabase: SupabaseClient,
  cardId: string
): Promise<CardVersion[]> {
  const { data, error } = await supabase
    .from("card_versions")
    .select("*")
    .eq("card_id", cardId)
    .order("version_number", { ascending: false });

  if (error) throw sanitizeError(error, "getCardVersions", { cardId });
  return data as CardVersion[];
}

export async function getCardVersion(
  supabase: SupabaseClient,
  cardId: string,
  versionNumber: number
): Promise<CardVersion> {
  const { data, error } = await supabase
    .from("card_versions")
    .select("*")
    .eq("card_id", cardId)
    .eq("version_number", versionNumber)
    .single();

  if (error) throw sanitizeError(error, "getCardVersion", { cardId, versionNumber });
  return data as CardVersion;
}

// ============================================================================
// Document Versions
// ============================================================================

export async function createDocumentVersion(
  supabase: SupabaseClient,
  documentId: string,
  document: Document,
  input: VersionInput
): Promise<DocumentVersion> {
  const nextVersion = await getNextVersionNumber(supabase, "document_versions", "document_id", documentId);

  const { data, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: documentId,
      user_id: document.user_id,
      version_number: nextVersion,
      title: document.title,
      type: document.type,
      content: document.content,
      reason: input.reason,
      label: input.label ?? null,
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createDocumentVersion", { documentId });
  return data as DocumentVersion;
}

export async function getDocumentVersions(
  supabase: SupabaseClient,
  documentId: string
): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false });

  if (error) throw sanitizeError(error, "getDocumentVersions", { documentId });
  return data as DocumentVersion[];
}

export async function getDocumentVersion(
  supabase: SupabaseClient,
  documentId: string,
  versionNumber: number
): Promise<DocumentVersion> {
  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .eq("version_number", versionNumber)
    .single();

  if (error) throw sanitizeError(error, "getDocumentVersion", { documentId, versionNumber });
  return data as DocumentVersion;
}

// ============================================================================
// Deck Versions
// ============================================================================

export async function createDeckVersion(
  supabase: SupabaseClient,
  deckId: string,
  deck: Deck,
  deckCards: { card_id: string; quantity: number }[],
  input: VersionInput
): Promise<DeckVersion> {
  const nextVersion = await getNextVersionNumber(supabase, "deck_versions", "deck_id", deckId);

  const { data, error } = await supabase
    .from("deck_versions")
    .insert({
      deck_id: deckId,
      project_id: deck.project_id,
      version_number: nextVersion,
      name: deck.name,
      description: deck.description,
      status: deck.status,
      cards: deckCards,
      reason: input.reason,
      label: input.label ?? null,
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createDeckVersion", { deckId });
  return data as DeckVersion;
}

export async function getDeckVersions(
  supabase: SupabaseClient,
  deckId: string
): Promise<DeckVersion[]> {
  const { data, error } = await supabase
    .from("deck_versions")
    .select("*")
    .eq("deck_id", deckId)
    .order("version_number", { ascending: false });

  if (error) throw sanitizeError(error, "getDeckVersions", { deckId });
  return data as DeckVersion[];
}

export async function getDeckVersion(
  supabase: SupabaseClient,
  deckId: string,
  versionNumber: number
): Promise<DeckVersion> {
  const { data, error } = await supabase
    .from("deck_versions")
    .select("*")
    .eq("deck_id", deckId)
    .eq("version_number", versionNumber)
    .single();

  if (error) throw sanitizeError(error, "getDeckVersion", { deckId, versionNumber });
  return data as DeckVersion;
}

// ============================================================================
// Helpers
// ============================================================================

async function getNextVersionNumber(
  supabase: SupabaseClient,
  table: string,
  fkColumn: string,
  fkValue: string
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select("version_number")
    .eq(fkColumn, fkValue)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  return data ? data.version_number + 1 : 1;
}

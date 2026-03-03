"use server";

import { createClient } from "@/lib/supabase/server";
import * as versionsRepo from "@/lib/repository/versions";
import * as cardsRepo from "@/lib/repository/cards";
import * as docRepo from "@/lib/repository/documents";
import * as decksRepo from "@/lib/repository/decks";
import { verifyProjectOwnership } from "@/lib/actions/auth-utils";
import {
  createVersionSchema,
  cardVersionIdSchema,
  documentVersionIdSchema,
  deckVersionIdSchema,
} from "@/lib/validations/versions";
import type {
  ActionResult,
  Card,
  CardVersion,
  Document,
  DocumentVersion,
  Deck,
  DeckVersion,
  VersionReason,
} from "@/lib/types";

// ============================================================================
// Card Version Actions
// ============================================================================

export async function createCardSnapshot(
  cardId: string,
  input?: { reason?: VersionReason; label?: string }
): Promise<ActionResult<CardVersion>> {
  const parsed = createVersionSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const card = await cardsRepo.getCard(supabase, cardId);
    if (!(await verifyProjectOwnership(supabase, card.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    const version = await versionsRepo.createCardVersion(supabase, cardId, card, {
      reason: parsed.data.reason ?? "manual",
      label: parsed.data.label,
      createdBy: user.id,
    });
    return { success: true, data: version };
  } catch {
    return { success: false, error: "Failed to create card snapshot" };
  }
}

export async function getCardVersions(
  cardId: string
): Promise<ActionResult<CardVersion[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const versions = await versionsRepo.getCardVersions(supabase, cardId);
    return { success: true, data: versions };
  } catch {
    return { success: false, error: "Failed to fetch card versions" };
  }
}

export async function restoreCardVersion(
  cardId: string,
  versionNumber: number
): Promise<ActionResult<Card>> {
  const parsed = cardVersionIdSchema.safeParse({ card_id: cardId, version_number: versionNumber });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const card = await cardsRepo.getCard(supabase, cardId);
    if (!(await verifyProjectOwnership(supabase, card.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    // Snapshot current state before restoring
    await versionsRepo.createCardVersion(supabase, cardId, card, {
      reason: "pre_restore",
      createdBy: user.id,
    });

    // Fetch the target version
    const version = await versionsRepo.getCardVersion(supabase, cardId, versionNumber);

    // Overwrite card with version data
    const { data: restored, error } = await supabase
      .from("cards")
      .update({
        data: version.data,
        status: version.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single();

    if (error) return { success: false, error: "Failed to restore card" };
    return { success: true, data: restored as Card };
  } catch {
    return { success: false, error: "Failed to restore card version" };
  }
}

// ============================================================================
// Document Version Actions
// ============================================================================

export async function createDocumentSnapshot(
  documentId: string,
  input?: { reason?: VersionReason; label?: string }
): Promise<ActionResult<DocumentVersion>> {
  const parsed = createVersionSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const document = await docRepo.getDocumentById(supabase, documentId, user.id);
    const version = await versionsRepo.createDocumentVersion(supabase, documentId, document, {
      reason: parsed.data.reason ?? "manual",
      label: parsed.data.label,
      createdBy: user.id,
    });
    return { success: true, data: version };
  } catch {
    return { success: false, error: "Failed to create document snapshot" };
  }
}

export async function getDocumentVersions(
  documentId: string
): Promise<ActionResult<DocumentVersion[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const versions = await versionsRepo.getDocumentVersions(supabase, documentId);
    return { success: true, data: versions };
  } catch {
    return { success: false, error: "Failed to fetch document versions" };
  }
}

export async function restoreDocumentVersion(
  documentId: string,
  versionNumber: number
): Promise<ActionResult<Document>> {
  const parsed = documentVersionIdSchema.safeParse({
    document_id: documentId,
    version_number: versionNumber,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Verify ownership
    const document = await docRepo.getDocumentById(supabase, documentId, user.id);

    // Snapshot current state before restoring
    await versionsRepo.createDocumentVersion(supabase, documentId, document, {
      reason: "pre_restore",
      createdBy: user.id,
    });

    // Fetch the target version
    const version = await versionsRepo.getDocumentVersion(supabase, documentId, versionNumber);

    // Overwrite document with version data
    const restored = await docRepo.updateDocument(supabase, documentId, {
      title: version.title,
      type: version.type,
      content: version.content,
    });

    return { success: true, data: restored };
  } catch {
    return { success: false, error: "Failed to restore document version" };
  }
}

// ============================================================================
// Deck Version Actions
// ============================================================================

export async function createDeckSnapshot(
  deckId: string,
  input?: { reason?: VersionReason; label?: string }
): Promise<ActionResult<DeckVersion>> {
  const parsed = createVersionSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (deckError || !deck) return { success: false, error: "Deck not found" };

    if (!(await verifyProjectOwnership(supabase, deck.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    const deckCards = await decksRepo.getDeckCardQuantities(supabase, deckId);
    const version = await versionsRepo.createDeckVersion(
      supabase,
      deckId,
      deck as Deck,
      deckCards,
      {
        reason: parsed.data.reason ?? "manual",
        label: parsed.data.label,
        createdBy: user.id,
      }
    );
    return { success: true, data: version };
  } catch {
    return { success: false, error: "Failed to create deck snapshot" };
  }
}

export async function getDeckVersions(
  deckId: string
): Promise<ActionResult<DeckVersion[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const versions = await versionsRepo.getDeckVersions(supabase, deckId);
    return { success: true, data: versions };
  } catch {
    return { success: false, error: "Failed to fetch deck versions" };
  }
}

export async function restoreDeckVersion(
  deckId: string,
  versionNumber: number
): Promise<ActionResult<Deck>> {
  const parsed = deckVersionIdSchema.safeParse({
    deck_id: deckId,
    version_number: versionNumber,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (deckError || !deck) return { success: false, error: "Deck not found" };

    if (!(await verifyProjectOwnership(supabase, deck.project_id, user.id))) {
      return { success: false, error: "Project not found" };
    }

    // Snapshot current state before restoring
    const deckCards = await decksRepo.getDeckCardQuantities(supabase, deckId);
    await versionsRepo.createDeckVersion(supabase, deckId, deck as Deck, deckCards, {
      reason: "pre_restore",
      createdBy: user.id,
    });

    // Fetch the target version
    const version = await versionsRepo.getDeckVersion(supabase, deckId, versionNumber);

    // Overwrite deck metadata
    const { data: restored, error: updateError } = await supabase
      .from("decks")
      .update({
        name: version.name,
        description: version.description,
        status: version.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId)
      .select()
      .single();

    if (updateError) return { success: false, error: "Failed to restore deck" };

    // Replace deck_cards junction rows with snapshotted composition
    await supabase.from("deck_cards").delete().eq("deck_id", deckId);

    const snapshotCards = version.cards as { card_id: string; quantity: number }[];
    if (snapshotCards.length > 0) {
      const { error: insertError } = await supabase.from("deck_cards").insert(
        snapshotCards.map((c) => ({
          deck_id: deckId,
          card_id: c.card_id,
          quantity: c.quantity,
        }))
      );
      if (insertError) return { success: false, error: "Failed to restore deck cards" };
    }

    return { success: true, data: restored as Deck };
  } catch {
    return { success: false, error: "Failed to restore deck version" };
  }
}

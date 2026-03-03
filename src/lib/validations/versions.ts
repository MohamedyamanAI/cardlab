import { z } from "zod/v4";

export const versionReasonSchema = z.enum([
  "manual",
  "status_change",
  "pre_import",
  "pre_restore",
  "pre_ai_edit",
  "periodic_auto_save",
]);

export const createVersionSchema = z.object({
  reason: versionReasonSchema.optional(),
  label: z.string().max(100).optional(),
});

export const cardVersionIdSchema = z.object({
  card_id: z.string().uuid(),
  version_number: z.number().int().positive(),
});

export const documentVersionIdSchema = z.object({
  document_id: z.string().uuid(),
  version_number: z.number().int().positive(),
});

export const deckVersionIdSchema = z.object({
  deck_id: z.string().uuid(),
  version_number: z.number().int().positive(),
});

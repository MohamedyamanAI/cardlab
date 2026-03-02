import { z } from "zod/v4";

export const createCardSchema = z.object({
  project_id: z.string().uuid(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const updateCardDataSchema = z.object({
  card_id: z.string().uuid(),
  data: z.record(z.string(), z.unknown()),
});

export const bulkDeleteCardsSchema = z.object({
  card_ids: z.array(z.string().uuid()).min(1),
});

export const duplicateCardsSchema = z.object({
  card_ids: z.array(z.string().uuid()).min(1),
  project_id: z.string().uuid(),
});

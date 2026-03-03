import { z } from "zod/v4";

export const createDeckSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1, "Deck name is required").max(100),
  description: z.string().max(500).optional(),
});

export const deckIdSchema = z.object({
  deck_id: z.string().uuid(),
});

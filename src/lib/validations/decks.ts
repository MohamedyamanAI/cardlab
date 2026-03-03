import { z } from "zod/v4";

export const createDeckSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1, "Deck name is required").max(100),
  description: z.string().max(500).optional(),
});

export const deckIdSchema = z.object({
  deck_id: z.string().uuid(),
});

export const updateDeckStatusSchema = z.object({
  deck_id: z.string().uuid(),
  status: z.enum(["draft", "active", "archived"]),
});

export const updateDeckSchema = z.object({
  deck_id: z.string().uuid(),
  name: z.string().min(1, "Deck name is required").max(100).optional(),
  description: z.string().max(500).optional(),
});

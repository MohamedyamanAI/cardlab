import { z } from "zod/v4";

export const createLayoutSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1, "Layout name is required").max(100),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const updateLayoutSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bleed_margin: z.number().min(0).optional(),
  condition: z.unknown().nullish(),
});

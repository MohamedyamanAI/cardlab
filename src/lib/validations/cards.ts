import { z } from "zod/v4";
import { propertyTypeSchema } from "./properties";

export const importCardsSchema = z.object({
  project_id: z.string().uuid(),
  mappings: z.array(
    z.object({
      sourceIndex: z.number().int().min(0),
      action: z.enum(["map_existing", "create_new", "skip"]),
      existingPropertySlug: z.string().optional(),
      newPropertyName: z.string().min(1).max(50).optional(),
      newPropertyType: propertyTypeSchema.optional(),
      newPropertyOptions: z.array(z.string()).optional(),
    })
  ),
  rows: z.array(z.array(z.string())).min(1).max(2000),
});

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

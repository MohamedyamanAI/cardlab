import { z } from "zod/v4";

const docTypeEnum = z.enum([
  "theme",
  "lore",
  "rules",
  "card_types",
  "sets",
  "distribution",
  "art_style_guide",
  "keywords",
  "resource_system",
  "balance_rules",
]);

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  type: docTypeEnum.optional(),
  project_id: z.string().uuid().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: docTypeEnum.nullish(),
  project_id: z.string().uuid().nullish(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export const documentIdSchema = z.object({
  id: z.string().uuid(),
});

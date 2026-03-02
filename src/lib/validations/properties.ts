import { z } from "zod/v4";

export const propertyTypeSchema = z.enum([
  "text",
  "number",
  "image",
  "select",
  "boolean",
  "color",
]);

export const createPropertySchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(50),
  type: propertyTypeSchema,
  options: z.array(z.string()).optional(),
  is_required: z.boolean().optional(),
});

export const updatePropertySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: propertyTypeSchema.optional(),
  options: z.array(z.string()).optional(),
  is_required: z.boolean().optional(),
});

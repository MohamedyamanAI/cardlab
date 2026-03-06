import { z } from "zod/v4";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

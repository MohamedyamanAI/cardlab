"use server";

import { createClient } from "@/lib/supabase/server";
import * as projectsRepo from "@/lib/repository/projects";
import * as propertiesRepo from "@/lib/repository/properties";
import * as cardsRepo from "@/lib/repository/cards";
import type { ActionResult, Property, PropertyType } from "@/lib/types";
import type { ImportResult } from "@/lib/types/import";
import { importCardsSchema } from "@/lib/validations/cards";

/** Coerce a raw string value to the correct JS type for a given PropertyType */
function coerceValue(raw: string, type: PropertyType): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  switch (type) {
    case "number": {
      const num = Number(trimmed);
      return isNaN(num) ? null : num;
    }
    case "boolean":
      return ["true", "yes", "1"].includes(trimmed.toLowerCase());
    case "text":
    case "color":
    case "image":
    case "select":
    default:
      return trimmed;
  }
}

export async function importCards(input: {
  project_id: string;
  mappings: Array<{
    sourceIndex: number;
    action: "map_existing" | "create_new" | "skip";
    existingPropertySlug?: string;
    newPropertyName?: string;
    newPropertyType?: PropertyType;
    newPropertyOptions?: string[];
  }>;
  rows: string[][];
}): Promise<ActionResult<ImportResult>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = importCardsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid import data" };
  }

  // Verify ownership
  try {
    await projectsRepo.getProjectById(supabase, input.project_id, user.id);
  } catch {
    return { success: false, error: "Project not found" };
  }

  try {
    const { mappings, rows } = input;
    const activeMappings = mappings.filter((m) => m.action !== "skip");

    // Get existing properties
    const existingProperties = await propertiesRepo.getPropertiesByProject(
      supabase,
      input.project_id
    );
    const slugMap = new Map<string, Property>(
      existingProperties.map((p) => [p.slug, p])
    );

    // Create new properties in bulk
    const newPropertyMappings = activeMappings.filter(
      (m) => m.action === "create_new"
    );
    let createdProperties: Property[] = [];
    if (newPropertyMappings.length > 0) {
      createdProperties = await propertiesRepo.bulkCreateProperties(
        supabase,
        input.project_id,
        newPropertyMappings.map((m) => ({
          name: m.newPropertyName!,
          type: m.newPropertyType ?? "text",
          options: m.newPropertyOptions,
        }))
      );
      for (const prop of createdProperties) {
        slugMap.set(prop.slug, prop);
      }
    }

    // Build mapping: sourceIndex → { slug, type }
    const columnTargets = new Map<
      number,
      { slug: string; type: PropertyType }
    >();
    for (const m of activeMappings) {
      if (m.action === "map_existing" && m.existingPropertySlug) {
        const prop = slugMap.get(m.existingPropertySlug);
        if (prop) {
          columnTargets.set(m.sourceIndex, {
            slug: prop.slug,
            type: prop.type,
          });
        }
      } else if (m.action === "create_new" && m.newPropertyName) {
        const prop = createdProperties.find((p) => p.name === m.newPropertyName);
        if (prop) {
          columnTargets.set(m.sourceIndex, {
            slug: prop.slug,
            type: prop.type,
          });
        }
      }
    }

    // Transform rows into card data
    const errors: Array<{ row: number; message: string }> = [];
    const cardDataArray: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const data: Record<string, unknown> = {};
        for (const [sourceIndex, target] of columnTargets) {
          const rawValue = row[sourceIndex] ?? "";
          data[target.slug] = coerceValue(rawValue, target.type);
        }
        // Skip entirely empty rows
        const hasValue = Object.values(data).some((v) => v !== null);
        if (hasValue) {
          cardDataArray.push(data);
        }
      } catch (err) {
        errors.push({ row: i + 1, message: String(err) });
      }
    }

    // Bulk insert in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < cardDataArray.length; i += BATCH_SIZE) {
      const batch = cardDataArray.slice(i, i + BATCH_SIZE);
      await cardsRepo.bulkCreateCards(supabase, input.project_id, batch);
    }

    return {
      success: true,
      data: {
        totalRows: rows.length,
        importedCount: cardDataArray.length,
        skippedCount: rows.length - cardDataArray.length,
        errors,
        createdProperties: createdProperties.map((p) => p.name),
        projectId: input.project_id,
      },
    };
  } catch {
    return { success: false, error: "Failed to import cards" };
  }
}

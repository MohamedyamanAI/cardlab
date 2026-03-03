"use server";

import { createClient } from "@/lib/supabase/server";
import * as propertiesRepo from "@/lib/repository/properties";
import { verifyProjectOwnership } from "@/lib/actions/auth-utils";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/lib/validations/properties";
import type { Property, PropertyType, ActionResult } from "@/lib/types";

export async function getProperties(
  projectId: string
): Promise<ActionResult<Property[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const properties = await propertiesRepo.getPropertiesByProject(
      supabase,
      projectId
    );
    return { success: true, data: properties };
  } catch {
    return { success: false, error: "Failed to fetch properties" };
  }
}

export async function createProperty(input: {
  project_id: string;
  name: string;
  type: PropertyType;
  options?: string[];
  is_required?: boolean;
}): Promise<ActionResult<Property>> {
  const parsed = createPropertySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, parsed.data.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const property = await propertiesRepo.createProperty(supabase, {
      project_id: parsed.data.project_id,
      name: parsed.data.name.trim(),
      type: parsed.data.type,
      options: parsed.data.options,
      is_required: parsed.data.is_required,
    });
    return { success: true, data: property };
  } catch {
    return { success: false, error: "Failed to create property" };
  }
}

export async function updateProperty(
  propertyId: string,
  input: {
    name?: string;
    type?: PropertyType;
    options?: string[];
    is_required?: boolean;
  }
): Promise<ActionResult<Property>> {
  const parsed = updatePropertySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Verify ownership by fetching the property's project
  const { data: prop, error: fetchError } = await supabase
    .from("properties")
    .select("project_id")
    .eq("id", propertyId)
    .single();

  if (fetchError || !prop) return { success: false, error: "Property not found" };

  if (!(await verifyProjectOwnership(supabase, prop.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const property = await propertiesRepo.updateProperty(
      supabase,
      propertyId,
      input
    );
    return { success: true, data: property };
  } catch {
    return { success: false, error: "Failed to update property" };
  }
}

export async function deleteProperty(
  propertyId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Verify ownership
  const { data: prop, error: fetchError } = await supabase
    .from("properties")
    .select("project_id")
    .eq("id", propertyId)
    .single();

  if (fetchError || !prop) return { success: false, error: "Property not found" };

  if (!(await verifyProjectOwnership(supabase, prop.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    await propertiesRepo.deleteProperty(supabase, propertyId);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete property" };
  }
}

export async function reorderProperties(
  projectId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    await propertiesRepo.reorderProperties(supabase, projectId, orderedIds);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to reorder properties" };
  }
}

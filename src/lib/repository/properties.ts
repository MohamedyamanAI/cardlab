import { SupabaseClient } from "@supabase/supabase-js";
import type { Property, PropertyType } from "@/lib/types";
import { slugify } from "@/lib/utils/slugify";

export async function getPropertiesByProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as Property[];
}

export async function createProperty(
  supabase: SupabaseClient,
  input: {
    project_id: string;
    name: string;
    type: PropertyType;
    options?: string[];
    is_required?: boolean;
  }
): Promise<Property> {
  // Generate slug from name
  let slug = slugify(input.name);

  // Check for slug uniqueness within the project
  const { data: existing } = await supabase
    .from("properties")
    .select("slug")
    .eq("project_id", input.project_id)
    .like("slug", `${slug}%`);

  if (existing && existing.length > 0) {
    const existingSlugs = new Set(existing.map((p) => p.slug));
    if (existingSlugs.has(slug)) {
      let counter = 1;
      while (existingSlugs.has(`${slug}-${counter}`)) {
        counter++;
      }
      slug = `${slug}-${counter}`;
    }
  }

  // Get the next sort_order
  const { data: lastProp } = await supabase
    .from("properties")
    .select("sort_order")
    .eq("project_id", input.project_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = lastProp ? (lastProp.sort_order ?? 0) + 1 : 0;

  const { data, error } = await supabase
    .from("properties")
    .insert({
      project_id: input.project_id,
      name: input.name,
      slug,
      type: input.type,
      options: input.options ?? null,
      is_required: input.is_required ?? false,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

export async function updateProperty(
  supabase: SupabaseClient,
  propertyId: string,
  input: {
    name?: string;
    type?: PropertyType;
    options?: string[];
    is_required?: boolean;
  }
): Promise<Property> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.options !== undefined) updateData.options = input.options;
  if (input.is_required !== undefined) updateData.is_required = input.is_required;

  const { data, error } = await supabase
    .from("properties")
    .update(updateData)
    .eq("id", propertyId)
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

export async function deleteProperty(
  supabase: SupabaseClient,
  propertyId: string
): Promise<void> {
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);

  if (error) throw error;
}

export async function reorderProperties(
  supabase: SupabaseClient,
  projectId: string,
  orderedIds: string[]
): Promise<void> {
  // Update sort_order for each property based on its position in the array
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("properties")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("project_id", projectId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

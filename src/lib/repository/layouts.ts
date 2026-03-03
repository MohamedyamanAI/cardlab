import { SupabaseClient } from "@supabase/supabase-js";
import type { Layout } from "@/lib/types";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";
import { sanitizeError } from "./error-utils";

export async function getLayoutsByProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Layout[]> {
  const { data, error } = await supabase
    .from("layouts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw sanitizeError(error, "getLayoutsByProject", { projectId });
  return data as Layout[];
}

export async function getLayoutById(
  supabase: SupabaseClient,
  layoutId: string
): Promise<Layout> {
  const { data, error } = await supabase
    .from("layouts")
    .select("*")
    .eq("id", layoutId)
    .single();

  if (error) throw sanitizeError(error, "getLayoutById", { layoutId });
  return data as Layout;
}

export async function createLayout(
  supabase: SupabaseClient,
  input: {
    project_id: string;
    name: string;
    width?: number;
    height?: number;
  }
): Promise<Layout> {
  const { data, error } = await supabase
    .from("layouts")
    .insert({
      project_id: input.project_id,
      name: input.name,
      width: input.width ?? 825,
      height: input.height ?? 1125,
      canvas_elements: [] as unknown as Json,
    })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createLayout", { project_id: input.project_id });
  return data as Layout;
}

export async function updateLayout(
  supabase: SupabaseClient,
  layoutId: string,
  input: {
    name?: string;
    width?: number;
    height?: number;
    bleed_margin?: number;
    condition?: Json | null;
  }
): Promise<Layout> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.width !== undefined) updateData.width = input.width;
  if (input.height !== undefined) updateData.height = input.height;
  if (input.bleed_margin !== undefined) updateData.bleed_margin = input.bleed_margin;
  if (input.condition !== undefined) updateData.condition = input.condition;

  const { data, error } = await supabase
    .from("layouts")
    .update(updateData)
    .eq("id", layoutId)
    .select()
    .single();

  if (error) throw sanitizeError(error, "updateLayout", { layoutId });
  return data as Layout;
}

export async function saveCanvasElements(
  supabase: SupabaseClient,
  layoutId: string,
  elements: CanvasElement[]
): Promise<Layout> {
  const { data, error } = await supabase
    .from("layouts")
    .update({ canvas_elements: elements as unknown as Json })
    .eq("id", layoutId)
    .select()
    .single();

  if (error) throw sanitizeError(error, "saveCanvasElements", { layoutId });
  return data as Layout;
}

export async function deleteLayout(
  supabase: SupabaseClient,
  layoutId: string
): Promise<void> {
  const { error } = await supabase
    .from("layouts")
    .delete()
    .eq("id", layoutId);

  if (error) throw sanitizeError(error, "deleteLayout", { layoutId });
}

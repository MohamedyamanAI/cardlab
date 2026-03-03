import { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/lib/types";
import { sanitizeError } from "./error-utils";

export async function getProjectsByUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw sanitizeError(error, "getProjectsByUser", { userId });
  return data as Project[];
}

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error) throw sanitizeError(error, "getProjectById", { projectId, userId });
  return data as Project;
}

export async function createProject(
  supabase: SupabaseClient,
  userId: string,
  input: { name: string; description?: string }
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) throw sanitizeError(error, "createProject", { userId });
  return data as Project;
}

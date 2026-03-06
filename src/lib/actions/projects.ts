"use server";

import { createClient } from "@/lib/supabase/server";
import * as projectsRepo from "@/lib/repository/projects";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/projects";
import type { Project, ActionResult } from "@/lib/types";

export async function getProjects(): Promise<ActionResult<Project[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const projects = await projectsRepo.getProjectsByUser(supabase, user.id);
    return { success: true, data: projects };
  } catch {
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function createProject(input: {
  name: string;
  description?: string;
}): Promise<ActionResult<Project>> {
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const project = await projectsRepo.createProject(supabase, user.id, {
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
    });
    return { success: true, data: project };
  } catch {
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProject(
  id: string,
  input: { name?: string; description?: string | null; status?: string }
): Promise<ActionResult<Project>> {
  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const cleanInput: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) cleanInput.name = parsed.data.name.trim();
    if (parsed.data.description !== undefined)
      cleanInput.description = parsed.data.description?.trim() ?? null;
    if (parsed.data.status !== undefined) cleanInput.status = parsed.data.status;

    const project = await projectsRepo.updateProject(
      supabase,
      id,
      user.id,
      cleanInput as { name?: string; description?: string | null; status?: string }
    );
    return { success: true, data: project };
  } catch {
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(
  id: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await projectsRepo.deleteProject(supabase, id, user.id);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete project" };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import * as projectsRepo from "@/lib/repository/projects";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!input.name || input.name.trim().length === 0) {
    return { success: false, error: "Project name is required" };
  }

  try {
    const project = await projectsRepo.createProject(supabase, user.id, {
      name: input.name.trim(),
      description: input.description?.trim(),
    });
    return { success: true, data: project };
  } catch {
    return { success: false, error: "Failed to create project" };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import * as projectsRepo from "@/lib/repository/projects";
import { createProjectSchema } from "@/lib/validations/projects";
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

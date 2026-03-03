"use server";

import { createClient } from "@/lib/supabase/server";
import * as projectsRepo from "@/lib/repository/projects";

export async function verifyProjectOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
): Promise<boolean> {
  try {
    await projectsRepo.getProjectById(supabase, projectId, userId);
    return true;
  } catch {
    return false;
  }
}

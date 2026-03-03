"use server";

import { createClient } from "@/lib/supabase/server";
import * as layoutsRepo from "@/lib/repository/layouts";
import { verifyProjectOwnership } from "@/lib/actions/auth-utils";
import {
  createLayoutSchema,
  updateLayoutSchema,
} from "@/lib/validations/layouts";
import type { Layout, ActionResult } from "@/lib/types";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";

export async function getLayouts(
  projectId: string
): Promise<ActionResult<Layout[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const layouts = await layoutsRepo.getLayoutsByProject(supabase, projectId);
    return { success: true, data: layouts };
  } catch {
    return { success: false, error: "Failed to fetch layouts" };
  }
}

export async function createLayout(input: {
  project_id: string;
  name: string;
  width?: number;
  height?: number;
}): Promise<ActionResult<Layout>> {
  const parsed = createLayoutSchema.safeParse(input);
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
    const layout = await layoutsRepo.createLayout(supabase, {
      project_id: parsed.data.project_id,
      name: parsed.data.name.trim(),
      width: parsed.data.width,
      height: parsed.data.height,
    });
    return { success: true, data: layout };
  } catch {
    return { success: false, error: "Failed to create layout" };
  }
}

export async function updateLayout(
  layoutId: string,
  input: {
    name?: string;
    width?: number;
    height?: number;
    bleed_margin?: number;
    condition?: Json | null;
  }
): Promise<ActionResult<Layout>> {
  const parsed = updateLayoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: layout, error: fetchError } = await supabase
    .from("layouts")
    .select("project_id")
    .eq("id", layoutId)
    .single();

  if (fetchError || !layout) return { success: false, error: "Layout not found" };

  if (!(await verifyProjectOwnership(supabase, layout.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const updated = await layoutsRepo.updateLayout(supabase, layoutId, input);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update layout" };
  }
}

export async function saveCanvasElements(
  layoutId: string,
  elements: CanvasElement[]
): Promise<ActionResult<Layout>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: layout, error: fetchError } = await supabase
    .from("layouts")
    .select("project_id")
    .eq("id", layoutId)
    .single();

  if (fetchError || !layout) return { success: false, error: "Layout not found" };

  if (!(await verifyProjectOwnership(supabase, layout.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    const updated = await layoutsRepo.saveCanvasElements(
      supabase,
      layoutId,
      elements
    );
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to save canvas elements" };
  }
}

export async function deleteLayout(
  layoutId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: layout, error: fetchError } = await supabase
    .from("layouts")
    .select("project_id")
    .eq("id", layoutId)
    .single();

  if (fetchError || !layout) return { success: false, error: "Layout not found" };

  if (!(await verifyProjectOwnership(supabase, layout.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    await layoutsRepo.deleteLayout(supabase, layoutId);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete layout" };
  }
}

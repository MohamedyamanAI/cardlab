"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils/admin";
import * as analyticsRepo from "@/lib/repository/analytics";
import type { AiChatMessage, ActionResult } from "@/lib/types";
import type { SystemOverview } from "@/lib/repository/analytics";

export type ImageGenDetail = {
  id: string;
  createdAt: string;
  model: string;
  prompt: string;
  aspectRatio: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
};

export type ImageGenStats = {
  totalImages: number;
  totalSizeBytes: number;
  totalImageCost: number;
  byDay: { date: string; count: number; cost: number }[];
  details: ImageGenDetail[];
};

export type AiUsageData = {
  messages: AiChatMessage[];
  imageGenStats: ImageGenStats;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email ?? "")) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getSystemOverview(): Promise<ActionResult<SystemOverview>> {
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();
    const overview = await analyticsRepo.getSystemOverview(serviceClient);
    return { success: true, data: overview };
  } catch {
    return { success: false, error: "Failed to fetch system overview" };
  }
}

export async function getAiUsageData(): Promise<ActionResult<AiUsageData>> {
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();

    const [messagesResult, generatedMedia] = await Promise.all([
      // All assistant messages with usage (text generation)
      serviceClient
        .from("ai_chat_messages")
        .select("*")
        .eq("role", "assistant")
        .not("usage", "is", null)
        .order("created_at", { ascending: false }),
      // Generated images (original_name starts with 'generated_')
      serviceClient
        .from("media")
        .select("id, size_bytes, created_at, generation_meta")
        .like("original_name", "generated_%")
        .order("created_at", { ascending: false }),
    ]);

    if (messagesResult.error) throw messagesResult.error;

    // Aggregate image gen by day with cost
    const dayMap = new Map<string, { count: number; cost: number }>();
    let totalSizeBytes = 0;
    let totalImageCost = 0;
    const details: ImageGenDetail[] = [];

    for (const row of generatedMedia.data ?? []) {
      totalSizeBytes += row.size_bytes ?? 0;
      const meta = row.generation_meta as {
        model?: string;
        prompt?: string;
        aspectRatio?: string;
        usage?: {
          inputTokens?: number;
          outputTokens?: number;
          totalTokens?: number;
          cost?: { totalCost?: number };
        };
      } | null;

      const usage = meta?.usage;
      const cost = usage?.cost?.totalCost ?? 0;
      totalImageCost += cost;

      const day = (row.created_at ?? "").slice(0, 10);
      if (day) {
        const existing = dayMap.get(day) ?? { count: 0, cost: 0 };
        existing.count += 1;
        existing.cost += cost;
        dayMap.set(day, existing);
      }

      details.push({
        id: row.id,
        createdAt: row.created_at ?? "",
        model: meta?.model ?? "unknown",
        prompt: meta?.prompt ?? "",
        aspectRatio: meta?.aspectRatio ?? "",
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
        totalTokens: usage?.totalTokens ?? 0,
        cost,
      });
    }

    const byDay = Array.from(dayMap.entries())
      .map(([date, { count, cost }]) => ({ date, count, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      success: true,
      data: {
        messages: messagesResult.data as AiChatMessage[],
        imageGenStats: {
          totalImages: (generatedMedia.data ?? []).length,
          totalSizeBytes,
          totalImageCost,
          byDay,
          details,
        },
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch AI usage data" };
  }
}

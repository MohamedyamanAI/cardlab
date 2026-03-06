import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { sanitizeError } from "./error-utils";

export interface SystemOverview {
  totalUsers: number;
  totalProjects: number;
  totalCards: number;
  totalDocuments: number;
  totalChats: number;
  totalDecks: number;
  totalLayouts: number;
  totalMedia: number;
  storageUsedBytes: number;
  recentUsers: { id: string; email: string; name: string | null; created_at: string | null }[];
  userSignups: { date: string; count: number }[];
  contentBreakdown: { type: string; count: number }[];
  projectStatuses: { status: string; count: number }[];
}

export async function getSystemOverview(
  supabase: SupabaseClient<Database>
): Promise<SystemOverview> {
  try {
    const [
      users, projects, cards, documents, chats, decks, layouts,
      media, recentUsers, allUsers, projectRows,
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("cards").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }),
      supabase.from("ai_chats").select("*", { count: "exact", head: true }),
      supabase.from("decks").select("*", { count: "exact", head: true }),
      supabase.from("layouts").select("*", { count: "exact", head: true }),
      supabase.from("media").select("size_bytes"),
      supabase
        .from("users")
        .select("id, email, name, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      // For signup trend
      supabase.from("users").select("created_at"),
      // For project status breakdown
      supabase.from("projects").select("status"),
    ]);

    const storageUsedBytes = (media.data ?? []).reduce(
      (sum, row) => sum + (row.size_bytes ?? 0),
      0
    );

    // Aggregate user signups by day
    const signupMap = new Map<string, number>();
    for (const u of allUsers.data ?? []) {
      const day = (u.created_at ?? "").slice(0, 10);
      if (day) signupMap.set(day, (signupMap.get(day) ?? 0) + 1);
    }
    const userSignups = Array.from(signupMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Content breakdown
    const contentBreakdown = [
      { type: "Cards", count: cards.count ?? 0 },
      { type: "Documents", count: documents.count ?? 0 },
      { type: "Decks", count: decks.count ?? 0 },
      { type: "Layouts", count: layouts.count ?? 0 },
    ];

    // Project status breakdown
    const statusMap = new Map<string, number>();
    for (const p of projectRows.data ?? []) {
      statusMap.set(p.status, (statusMap.get(p.status) ?? 0) + 1);
    }
    const projectStatuses = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }));

    return {
      totalUsers: users.count ?? 0,
      totalProjects: projects.count ?? 0,
      totalCards: cards.count ?? 0,
      totalDocuments: documents.count ?? 0,
      totalChats: chats.count ?? 0,
      totalDecks: decks.count ?? 0,
      totalLayouts: layouts.count ?? 0,
      totalMedia: (media.data ?? []).length,
      storageUsedBytes,
      recentUsers: recentUsers.data ?? [],
      userSignups,
      contentBreakdown,
      projectStatuses,
    };
  } catch (error) {
    throw sanitizeError(error, "getSystemOverview");
  }
}

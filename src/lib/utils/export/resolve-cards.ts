import type { Card, Layout } from "@/lib/types";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";
import { resolveLayoutForCard } from "@/lib/utils/condition-engine";
import type { ResolvedCard } from "@/lib/types/export";

export function resolveCards(
  cards: Card[],
  layouts: Layout[]
): { resolved: ResolvedCard[]; allMediaIds: string[] } {
  const mediaIds = new Set<string>();
  const resolved: ResolvedCard[] = [];

  for (const card of cards) {
    const cardData =
      typeof card.data === "object" && card.data !== null
        ? (card.data as Record<string, Json>)
        : {};

    const layout = resolveLayoutForCard(layouts, cardData);
    if (!layout) continue;

    const elements = Array.isArray(layout.canvas_elements)
      ? (layout.canvas_elements as unknown as CanvasElement[])
      : [];

    for (const el of elements) {
      if (el.type === "image") {
        const mediaId = el.bind_to
          ? (cardData[el.bind_to] as string | undefined)
          : el.static_src;
        if (typeof mediaId === "string" && mediaId.length > 0) {
          mediaIds.add(mediaId);
        }
      }
    }

    resolved.push({ card, layout, elements, cardData, mediaUrls: {} });
  }

  return { resolved, allMediaIds: [...mediaIds] };
}

export function populateMediaUrls(
  resolved: ResolvedCard[],
  urlMap: Record<string, string>
): void {
  for (const rc of resolved) {
    rc.mediaUrls = {};
    for (const el of rc.elements) {
      if (el.type === "image") {
        const mediaId = el.bind_to
          ? (rc.cardData[el.bind_to] as string | undefined)
          : el.static_src;
        if (mediaId && urlMap[mediaId]) {
          rc.mediaUrls[mediaId] = urlMap[mediaId];
        }
      }
    }
  }
}

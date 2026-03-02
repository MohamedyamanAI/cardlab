import { useEffect } from "react";
import { useCardsStore } from "@/lib/store/cards-store";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useMediaResolution() {
  const cards = useCardsStore((s) => s.cards);
  const properties = useCardsStore((s) => s.properties);
  const resolveMediaIds = useMediaCacheStore((s) => s.resolveMediaIds);

  useEffect(() => {
    const imageSlugs = properties
      .filter((p) => p.type === "image")
      .map((p) => p.slug);

    if (imageSlugs.length === 0) return;

    const mediaIds: string[] = [];
    for (const card of cards) {
      const data =
        typeof card.data === "object" && card.data !== null
          ? (card.data as Record<string, unknown>)
          : {};

      for (const slug of imageSlugs) {
        const val = data[slug];
        if (typeof val === "string" && UUID_REGEX.test(val)) {
          mediaIds.push(val);
        }
      }
    }

    if (mediaIds.length > 0) {
      const unique = [...new Set(mediaIds)];
      resolveMediaIds(unique);
    }
  }, [cards, properties, resolveMediaIds]);
}

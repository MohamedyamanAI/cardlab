"use client";

import { Button } from "@/components/ui/button";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import { IconChevronLeft, IconChevronRight, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useEffect } from "react";
import type { Json } from "@/lib/supabase/database.types";

export function CardPreviewBar() {
  const previewCardIndex = useLayoutEditorStore((s) => s.previewCardIndex);
  const setPreviewCardIndex = useLayoutEditorStore((s) => s.setPreviewCardIndex);
  const elements = useLayoutEditorStore((s) => s.elements);
  const cards = useCardsStore((s) => s.cards);
  const properties = useCardsStore((s) => s.properties);
  const resolveMediaIds = useMediaCacheStore((s) => s.resolveMediaIds);

  const isPreviewOn = previewCardIndex >= 0;
  const currentCard = isPreviewOn && previewCardIndex < cards.length
    ? cards[previewCardIndex]
    : null;

  // Resolve media IDs when preview card changes
  useEffect(() => {
    if (!currentCard) return;
    const data =
      typeof currentCard.data === "object" && currentCard.data !== null
        ? (currentCard.data as Record<string, Json>)
        : {};

    const imageProps = properties.filter((p) => p.type === "image");
    const imageSlugs = elements
      .filter((el) => el.type === "image" && el.bind_to)
      .map((el) => el.bind_to!)
      .concat(imageProps.map((p) => p.slug));

    const mediaIds = imageSlugs
      .map((slug) => data[slug])
      .filter((v): v is string => typeof v === "string" && v.length > 0);

    if (mediaIds.length > 0) {
      resolveMediaIds(mediaIds);
    }
  }, [currentCard, elements, properties, resolveMediaIds]);

  if (cards.length === 0) return null;

  return (
    <div className="flex items-center gap-2 border-t px-4 py-1.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          setPreviewCardIndex(isPreviewOn ? -1 : 0)
        }
        className="gap-1 text-xs"
      >
        {isPreviewOn ? (
          <><IconEyeOff className="size-3.5" /> Preview Off</>
        ) : (
          <><IconEye className="size-3.5" /> Preview</>
        )}
      </Button>

      {isPreviewOn && (
        <>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={previewCardIndex <= 0}
            onClick={() => setPreviewCardIndex(previewCardIndex - 1)}
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Card {previewCardIndex + 1} of {cards.length}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={previewCardIndex >= cards.length - 1}
            onClick={() => setPreviewCardIndex(previewCardIndex + 1)}
          >
            <IconChevronRight className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}

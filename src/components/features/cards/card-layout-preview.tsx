"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useCardsStore } from "@/lib/store/cards-store";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import { resolveLayoutForCard } from "@/lib/utils/condition-engine";
import { TextRenderer } from "@/components/features/layouts/element-renderers/text-renderer";
import { ImageRenderer } from "@/components/features/layouts/element-renderers/image-renderer";
import { ShapeRenderer } from "@/components/features/layouts/element-renderers/shape-renderer";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";
import { IconLayoutOff } from "@tabler/icons-react";

export function CardLayoutPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  const focusedCell = useCardsStore((s) => s.focusedCell);
  const cards = useCardsStore((s) => s.cards);
  const properties = useCardsStore((s) => s.properties);
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const resolveMediaIds = useMediaCacheStore((s) => s.resolveMediaIds);

  const card = focusedCell ? cards[focusedCell.row] ?? null : null;
  const cardData = useMemo(() => {
    if (!card) return {};
    return typeof card.data === "object" && card.data !== null
      ? (card.data as Record<string, Json>)
      : {};
  }, [card]);

  const layout = useMemo(
    () => (card ? resolveLayoutForCard(layouts, cardData) : null),
    [card, layouts, cardData]
  );

  const elements = useMemo(() => {
    if (!layout) return [];
    return Array.isArray(layout.canvas_elements)
      ? (layout.canvas_elements as unknown as CanvasElement[])
      : [];
  }, [layout]);

  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.z_index - b.z_index),
    [elements]
  );

  const canvasWidth = layout?.width ?? 825;
  const canvasHeight = layout?.height ?? 1125;

  // Responsive scaling
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 24;
    const scaleX = (rect.width - padding * 2) / canvasWidth;
    const scaleY = (rect.height - padding * 2) / canvasHeight;
    setScale(Math.min(scaleX, scaleY, 1));
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  // Resolve media IDs when the previewed card changes
  useEffect(() => {
    if (!card) return;
    const imageProps = properties.filter((p) => p.type === "image");
    const imageSlugs = elements
      .filter((el) => el.type === "image" && el.bind_to)
      .map((el) => el.bind_to!)
      .concat(imageProps.map((p) => p.slug));

    const mediaIds = imageSlugs
      .map((slug) => cardData[slug])
      .filter((v): v is string => typeof v === "string" && v.length > 0);

    if (mediaIds.length > 0) {
      resolveMediaIds(mediaIds);
    }
  }, [card, cardData, elements, properties, resolveMediaIds]);

  if (!card) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        Click a cell to preview its card.
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
        <IconLayoutOff className="size-8" />
        <span>No matching layout</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full items-center justify-center overflow-hidden"
    >
      <div
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="relative shrink-0 bg-neutral-800 shadow-2xl"
      >
        {sorted.map((el) => {
          let previewValue: string | null = null;
          if (el.bind_to) {
            const val = cardData[el.bind_to];
            if (val != null) previewValue = String(val);
          }

          return (
            <div
              key={el.id}
              className="absolute overflow-hidden"
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                zIndex: el.z_index,
              }}
            >
              {el.type === "text" && (
                <TextRenderer element={el} previewValue={previewValue} />
              )}
              {el.type === "image" && (
                <ImageRenderer element={el} previewValue={previewValue} />
              )}
              {el.type === "shape" && <ShapeRenderer element={el} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

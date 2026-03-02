"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import { filterCardsByCondition } from "@/lib/utils/condition-engine";
import {
  createTextElement,
  createImageElement,
  createShapeElement,
} from "@/lib/utils/canvas-element-factory";
import {
  IconTypography,
  IconPhoto,
  IconSquare,
  IconArrowUp,
  IconArrowDown,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils/utils";
import type { Json } from "@/lib/supabase/database.types";

export function ElementsPanel() {
  const elements = useLayoutEditorStore((s) => s.elements);
  const selectedElementIds = useLayoutEditorStore((s) => s.selectedElementIds);
  const addElement = useLayoutEditorStore((s) => s.addElement);
  const selectElement = useLayoutEditorStore((s) => s.selectElement);
  const deleteElement = useLayoutEditorStore((s) => s.deleteElement);
  const reorderElement = useLayoutEditorStore((s) => s.reorderElement);
  const previewCardIndex = useLayoutEditorStore((s) => s.previewCardIndex);
  const setPreviewCardIndex = useLayoutEditorStore((s) => s.setPreviewCardIndex);
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const cards = useCardsStore((s) => s.cards);
  const properties = useCardsStore((s) => s.properties);
  const resolveMediaIds = useMediaCacheStore((s) => s.resolveMediaIds);

  const currentLayout = layouts.find((l) => l.id === currentLayoutId) ?? null;
  const matchingIndices = useMemo(
    () => filterCardsByCondition(cards, currentLayout?.condition ?? null),
    [cards, currentLayout?.condition]
  );

  const isPreviewOn = previewCardIndex >= 0;
  const actualCardIndex =
    isPreviewOn && previewCardIndex < matchingIndices.length
      ? matchingIndices[previewCardIndex]
      : -1;
  const currentCard = actualCardIndex >= 0 ? cards[actualCardIndex] : null;

  // Clamp previewCardIndex when matching set shrinks
  useEffect(() => {
    if (previewCardIndex >= 0 && matchingIndices.length > 0 && previewCardIndex >= matchingIndices.length) {
      setPreviewCardIndex(matchingIndices.length - 1);
    }
  }, [matchingIndices.length, previewCardIndex, setPreviewCardIndex]);

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

  const sorted = [...elements].sort((a, b) => b.z_index - a.z_index);

  return (
    <div className="flex h-full w-52 flex-col border-r">
      <div className="border-b p-3">
        <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
          Add Element
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => addElement(createTextElement())}
          >
            <IconTypography className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => addElement(createImageElement())}
          >
            <IconPhoto className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => addElement(createShapeElement())}
          >
            <IconSquare className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <h3 className="p-3 pb-1 text-xs font-medium text-muted-foreground uppercase">
          Layers
        </h3>
        <ScrollArea className="h-full px-2 pb-2">
          <div className="space-y-0.5">
            {sorted.map((el) => (
              <div
                key={el.id}
                className={cn(
                  "group flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors",
                  selectedElementIds.has(el.id)
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={(e) => selectElement(el.id, e.shiftKey)}
              >
                {el.type === "text" && <IconTypography className="size-3.5 shrink-0" />}
                {el.type === "image" && <IconPhoto className="size-3.5 shrink-0" />}
                {el.type === "shape" && <IconSquare className="size-3.5 shrink-0" />}
                <span className="flex-1 truncate">
                  {el.bind_to
                    ? `{${el.bind_to}}`
                    : el.type === "text" && "static_text" in el && el.static_text
                      ? el.static_text
                      : el.type}
                </span>
                <div className="hidden gap-0.5 group-hover:flex">
                  <button
                    onClick={(e) => { e.stopPropagation(); reorderElement(el.id, "up"); }}
                    className="rounded p-0.5 hover:bg-background"
                  >
                    <IconArrowUp className="size-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); reorderElement(el.id, "down"); }}
                    className="rounded p-0.5 hover:bg-background"
                  >
                    <IconArrowDown className="size-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                    className="rounded p-0.5 text-destructive hover:bg-background"
                  >
                    <IconTrash className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Card preview controls */}
      {cards.length > 0 && (
        <div className="border-t p-3">
          <div className="flex items-center gap-1">
            <Button
              variant={isPreviewOn ? "secondary" : "outline"}
              size="sm"
              className="h-7 flex-1 gap-1 text-xs"
              onClick={() => setPreviewCardIndex(isPreviewOn ? -1 : 0)}
              disabled={matchingIndices.length === 0}
            >
              {isPreviewOn ? (
                <><IconEyeOff className="size-3.5" /> Off</>
              ) : (
                <><IconEye className="size-3.5" /> Preview</>
              )}
            </Button>
            {isPreviewOn && matchingIndices.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={previewCardIndex <= 0}
                  onClick={() => setPreviewCardIndex(previewCardIndex - 1)}
                >
                  <IconChevronLeft className="size-3.5" />
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {previewCardIndex + 1}/{matchingIndices.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={previewCardIndex >= matchingIndices.length - 1}
                  onClick={() => setPreviewCardIndex(previewCardIndex + 1)}
                >
                  <IconChevronRight className="size-3.5" />
                </Button>
              </>
            )}
          </div>
          {isPreviewOn && matchingIndices.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">No matching cards</p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { CanvasElementWrapper } from "./canvas-element";
import { MarqueeOverlay } from "./marquee-overlay";

export function CanvasViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const layouts = useLayoutEditorStore((s) => s.layouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const elements = useLayoutEditorStore((s) => s.elements);
  const clearSelection = useLayoutEditorStore((s) => s.clearSelection);
  const previewCardIndex = useLayoutEditorStore((s) => s.previewCardIndex);
  const properties = useCardsStore((s) => s.properties);
  const cards = useCardsStore((s) => s.cards);

  const layout = layouts.find((l) => l.id === currentLayoutId);
  const canvasWidth = layout?.width ?? 825;
  const canvasHeight = layout?.height ?? 1125;
  const bleedMargin = layout?.bleed_margin ?? 0;
  const previewCard =
    previewCardIndex >= 0 && previewCardIndex < cards.length
      ? cards[previewCardIndex]
      : null;

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 40;
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

  const sorted = [...elements].sort((a, b) => a.z_index - b.z_index);

  if (!currentLayoutId) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select or create a layout to start editing.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) clearSelection();
      }}
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
        {/* Bleed margin guide */}
        {bleedMargin > 0 && (
          <div
            className="pointer-events-none absolute border border-dashed border-white/20"
            style={{
              top: bleedMargin,
              left: bleedMargin,
              right: bleedMargin,
              bottom: bleedMargin,
            }}
          />
        )}

        {sorted.map((el) => (
          <CanvasElementWrapper
            key={el.id}
            element={el}
            scale={scale}
            previewCard={previewCard}
            properties={properties}
          />
        ))}

        {/* Marquee selection overlay */}
        <MarqueeOverlay
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          scale={scale}
        />
      </div>
    </div>
  );
}

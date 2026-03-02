"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { CanvasElementWrapper } from "./canvas-element";
import { MarqueeOverlay } from "./marquee-overlay";
import { ZoomControls } from "./zoom-controls";
import { Rulers } from "./rulers";

const RULER_SIZE = 20;

export function CanvasViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const layouts = useLayoutEditorStore((s) => s.layouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const elements = useLayoutEditorStore((s) => s.elements);
  const clearSelection = useLayoutEditorStore((s) => s.clearSelection);
  const previewCardIndex = useLayoutEditorStore((s) => s.previewCardIndex);
  const zoom = useLayoutEditorStore((s) => s.zoom);
  const panX = useLayoutEditorStore((s) => s.panX);
  const panY = useLayoutEditorStore((s) => s.panY);
  const isSpaceHeld = useLayoutEditorStore((s) => s.isSpaceHeld);
  const setZoom = useLayoutEditorStore((s) => s.setZoom);
  const setPan = useLayoutEditorStore((s) => s.setPan);
  const showRulers = useLayoutEditorStore((s) => s.showRulers);
  const rulerUnit = useLayoutEditorStore((s) => s.rulerUnit);
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

  // Auto-fit: compute initial zoom/pan to center canvas in container
  const rulerOffset = showRulers ? RULER_SIZE : 0;
  const autoFit = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const availW = rect.width - rulerOffset;
    const availH = rect.height - rulerOffset;
    const padding = 40;
    const fitZoom = Math.min(
      (availW - padding * 2) / canvasWidth,
      (availH - padding * 2) / canvasHeight,
      1
    );
    const fitPanX = (availW - canvasWidth * fitZoom) / 2 + rulerOffset;
    const fitPanY = (availH - canvasHeight * fitZoom) / 2 + rulerOffset;
    setZoom(fitZoom);
    setPan(fitPanX, fitPanY);
  }, [canvasWidth, canvasHeight, setZoom, setPan, rulerOffset]);

  // Auto-fit on mount, layout change, and container resize
  useEffect(() => {
    autoFit();
    const observer = new ResizeObserver(autoFit);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoFit]);

  // If store signals resetView (zoom = -1), re-autofit
  useEffect(() => {
    if (zoom === -1) autoFit();
  }, [zoom, autoFit]);

  // Wheel: Ctrl/Cmd → zoom toward cursor, else → pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const focalX = e.clientX - rect.left;
        const focalY = e.clientY - rect.top;
        const delta = -e.deltaY * 0.002;
        const newZoom = zoom * (1 + delta);
        setZoom(newZoom, focalX, focalY);
      } else {
        setPan(panX - e.deltaX, panY - e.deltaY);
      }
    },
    [zoom, panX, panY, setZoom, setPan]
  );

  // Spacebar+drag pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isSpaceHeld && e.button === 0) {
        e.preventDefault();
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
      }
    },
    [isSpaceHeld, panX, panY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Track cursor for rulers
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasX = (e.clientX - rect.left - panX) / zoom;
        const canvasY = (e.clientY - rect.top - panY) / zoom;
        setCursorPos({ x: canvasX, y: canvasY });
      }

      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy);
      }
    },
    [zoom, panX, panY, setPan]
  );

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPanningRef.current = false;
    setCursorPos(null);
  }, []);

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
      className="relative flex-1 overflow-hidden bg-muted/30"
      style={{ cursor: isSpaceHeld ? (isPanningRef.current ? "grabbing" : "grab") : undefined }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSpaceHeld) clearSelection();
      }}
    >
      {/* Rulers */}
      {showRulers && (
        <Rulers
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          zoom={zoom}
          panX={panX}
          panY={panY}
          cursorPos={cursorPos}
          rulerSize={RULER_SIZE}
          unit={rulerUnit}
        />
      )}

      {/* Canvas layer */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        }}
      >
        <div
          style={{ width: canvasWidth, height: canvasHeight }}
          className="relative bg-neutral-800 shadow-2xl"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSpaceHeld) clearSelection();
          }}
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
              scale={zoom}
              previewCard={previewCard}
              properties={properties}
            />
          ))}

          {/* Marquee selection overlay */}
          {!isSpaceHeld && (
            <MarqueeOverlay
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              scale={zoom}
            />
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <ZoomControls />
    </div>
  );
}

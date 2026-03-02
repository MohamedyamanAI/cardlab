"use client";

import { useState, useCallback, useRef } from "react";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface MarqueeOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function MarqueeOverlay({ canvasWidth, canvasHeight, scale }: MarqueeOverlayProps) {
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const elements = useLayoutEditorStore((s) => s.elements);
  const selectElements = useLayoutEditorStore((s) => s.selectElements);
  const clearSelection = useLayoutEditorStore((s) => s.clearSelection);

  const getCanvasPos = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      };
    },
    [scale]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start marquee on left click directly on overlay (not on elements)
      if (e.button !== 0) return;
      if (e.target !== e.currentTarget) return;

      if (!e.shiftKey) {
        clearSelection();
      }
      const pos = getCanvasPos(e);
      startRef.current = pos;
      setMarquee({ x: pos.x, y: pos.y, width: 0, height: 0 });
    },
    [getCanvasPos, clearSelection]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!startRef.current) return;
      const pos = getCanvasPos(e);
      const x = Math.min(startRef.current.x, pos.x);
      const y = Math.min(startRef.current.y, pos.y);
      const width = Math.abs(pos.x - startRef.current.x);
      const height = Math.abs(pos.y - startRef.current.y);
      setMarquee({ x, y, width, height });
    },
    [getCanvasPos]
  );

  const handleMouseUp = useCallback(() => {
    if (marquee && marquee.width > 2 && marquee.height > 2) {
      const intersecting = elements.filter((el) => {
        return (
          el.x < marquee.x + marquee.width &&
          el.x + el.width > marquee.x &&
          el.y < marquee.y + marquee.height &&
          el.y + el.height > marquee.y
        );
      });
      if (intersecting.length > 0) {
        selectElements(intersecting.map((el) => el.id));
      }
    }
    startRef.current = null;
    setMarquee(null);
  }, [marquee, elements, selectElements]);

  return (
    <div
      className="absolute inset-0"
      style={{ width: canvasWidth, height: canvasHeight }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {marquee && marquee.width > 2 && marquee.height > 2 && (
        <div
          className="pointer-events-none absolute border border-blue-500 bg-blue-500/10"
          style={{
            left: marquee.x,
            top: marquee.y,
            width: marquee.width,
            height: marquee.height,
          }}
        />
      )}
    </div>
  );
}

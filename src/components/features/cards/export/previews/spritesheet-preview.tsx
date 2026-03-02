"use client";

import { useRef, useState, useEffect } from "react";
import type { ResolvedCard } from "@/lib/types/export";
import { CardExportRenderer } from "../../preview/card-export-renderer";
import { DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT } from "../export-constants";

interface SpritesheetPreviewProps {
  resolved: ResolvedCard[];
  cols: number;
  reserveSlots: number;
  excludedIndices: Set<number>;
  onToggleExclude: (index: number) => void;
}

export function SpritesheetPreview({
  resolved,
  cols,
  reserveSlots,
  excludedIndices,
  onToggleExclude,
}: SpritesheetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.1);

  const firstW = resolved[0]?.layout.width ?? DEFAULT_CARD_WIDTH;
  const firstH = resolved[0]?.layout.height ?? DEFAULT_CARD_HEIGHT;
  const totalSlots = reserveSlots > 0 ? resolved.length + reserveSlots : resolved.length;
  const rows = Math.ceil(totalSlots / cols);
  const sheetW = cols * firstW;
  const sheetH = rows * firstH;

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pad = 32;
      const sx = (rect.width - pad) / sheetW;
      const sy = (rect.height - pad) / sheetH;
      setPreviewScale(Math.min(sx, sy, 0.3));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [sheetW, sheetH]);

  return (
    <div ref={containerRef} className="flex flex-1 items-center justify-center overflow-hidden">
      <div
        style={{
          width: sheetW,
          height: sheetH,
          transform: `scale(${previewScale})`,
          transformOrigin: "center center",
        }}
        className="relative shrink-0 bg-black"
      >
        {resolved.map((rc, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const w = rc.layout.width ?? DEFAULT_CARD_WIDTH;
          const h = rc.layout.height ?? DEFAULT_CARD_HEIGHT;
          const excluded = excludedIndices.has(i);

          return (
            <div
              key={`${rc.card.id}-${i}`}
              className={`absolute overflow-hidden cursor-pointer transition-opacity ${excluded ? "opacity-30" : ""}`}
              style={{
                left: col * firstW,
                top: row * firstH,
                width: firstW,
                height: firstH,
              }}
              onClick={() => onToggleExclude(i)}
            >
              <div style={{ width: w, height: h, transform: `scale(${firstW / w})`, transformOrigin: "top left" }}>
                <CardExportRenderer
                  elements={rc.elements}
                  cardData={rc.cardData}
                  mediaUrls={rc.mediaUrls}
                  width={w}
                  height={h}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

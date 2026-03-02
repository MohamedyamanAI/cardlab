"use client";

import type { ResolvedCard } from "@/lib/types/export";
import { CardExportRenderer } from "../../preview/card-export-renderer";
import { DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT, getCardLabel } from "../export-constants";

interface CardGridPreviewProps {
  resolved: ResolvedCard[];
  excludedIndices: Set<number>;
  onToggleExclude: (index: number) => void;
}

export function CardGridPreview({
  resolved,
  excludedIndices,
  onToggleExclude,
}: CardGridPreviewProps) {
  const THUMB_WIDTH = 150;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="mb-3 text-[11px] text-muted-foreground">Click a card to exclude/include it</p>
      <div className="flex flex-wrap gap-3">
        {resolved.map((rc, i) => {
          const w = rc.layout.width ?? DEFAULT_CARD_WIDTH;
          const h = rc.layout.height ?? DEFAULT_CARD_HEIGHT;
          const scale = THUMB_WIDTH / w;
          const thumbH = h * scale;
          const excluded = excludedIndices.has(i);

          return (
            <div
              key={`${rc.card.id}-${i}`}
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => onToggleExclude(i)}
            >
              <div
                style={{ width: THUMB_WIDTH, height: thumbH }}
                className={`relative overflow-hidden rounded shadow-sm transition-opacity ${excluded ? "opacity-30" : "hover:ring-2 hover:ring-primary/50"}`}
              >
                <div
                  style={{
                    width: w,
                    height: h,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <CardExportRenderer
                    elements={rc.elements}
                    cardData={rc.cardData}
                    mediaUrls={rc.mediaUrls}
                    width={w}
                    height={h}
                  />
                </div>
                {excluded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                      EXCLUDED
                    </span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] truncate max-w-[150px] ${excluded ? "text-muted-foreground/50 line-through" : "text-muted-foreground"}`}>
                {getCardLabel(rc, i)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

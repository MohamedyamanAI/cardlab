"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { PAGE_DIMENSIONS } from "@/lib/types/export";
import type { PageSize, PdfLayoutMode, ResolvedCard } from "@/lib/types/export";
import type { computePdfLayout } from "@/lib/utils/export/generate-pdf";
import { CardExportRenderer } from "../../preview/card-export-renderer";
import { DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT, PDF_MARGIN } from "../export-constants";

interface PdfPreviewProps {
  resolved: ResolvedCard[];
  pdfLayout: ReturnType<typeof computePdfLayout>;
  pageSize: PageSize;
  layoutMode: PdfLayoutMode;
  cardGap: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  excludedIndices: Set<number>;
  onToggleExclude: (index: number) => void;
}

export function PdfPreview({
  resolved,
  pdfLayout,
  pageSize,
  layoutMode,
  cardGap: gap,
  currentPage,
  totalPages,
  onPageChange,
  excludedIndices,
  onToggleExclude,
}: PdfPreviewProps) {
  const pageDim = PAGE_DIMENSIONS[pageSize];
  const { cardsPerPage, cardsPerRow, cardW, cardH } = pdfLayout;

  const startIdx = currentPage * cardsPerPage;
  const pageCards = resolved.slice(startIdx, startIdx + cardsPerPage);

  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(0.15);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pad = 32;
      const sx = (rect.width - pad) / pageDim.width;
      const sy = (rect.height - pad) / pageDim.height;
      setPageScale(Math.min(sx, sy, 0.4));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [pageDim.width, pageDim.height]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="flex flex-1 items-center justify-center overflow-hidden"
      >
        <div
          style={{
            width: pageDim.width,
            height: pageDim.height,
            transform: `scale(${pageScale})`,
            transformOrigin: "center center",
          }}
          className="relative shrink-0 rounded bg-white shadow-lg"
        >
          <div
            className="absolute border border-dashed border-neutral-200"
            style={{
              left: PDF_MARGIN,
              top: PDF_MARGIN,
              right: PDF_MARGIN,
              bottom: PDF_MARGIN,
            }}
          />

          {pageCards.map((rc, i) => {
            const globalIdx = startIdx + i;
            let x: number;
            let y: number;

            if (layoutMode === "one-per-page") {
              x = (pageDim.width - cardW) / 2;
              y = (pageDim.height - cardH) / 2;
            } else {
              const col = i % cardsPerRow;
              const row = Math.floor(i / cardsPerRow);
              x = PDF_MARGIN + col * (cardW + gap);
              y = PDF_MARGIN + row * (cardH + gap);
            }

            const origW = rc.layout.width ?? DEFAULT_CARD_WIDTH;
            const origH = rc.layout.height ?? DEFAULT_CARD_HEIGHT;
            const cardScale = cardW / origW;
            const excluded = excludedIndices.has(globalIdx);

            return (
              <div
                key={`${rc.card.id}-${i}`}
                className={`absolute overflow-hidden cursor-pointer transition-opacity ${excluded ? "opacity-30" : ""}`}
                style={{ left: x, top: y, width: cardW, height: cardH }}
                onClick={() => onToggleExclude(globalIdx)}
              >
                <div
                  style={{
                    width: origW,
                    height: origH,
                    transform: `scale(${cardScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <CardExportRenderer
                    elements={rc.elements}
                    cardData={rc.cardData}
                    mediaUrls={rc.mediaUrls}
                    width={origW}
                    height={origH}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-2 border-t px-4 py-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <IconChevronLeft size={14} />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <IconChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}

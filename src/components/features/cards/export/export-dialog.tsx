"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCardsStore } from "@/lib/store/cards-store";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import {
  resolveCards,
  populateMediaUrls,
  renderCardToPng,
  renderCardToSvg,
  downloadPng,
  downloadSvg,
  generatePdf,
  generateSpritesheet,
  computePdfLayout,
} from "@/lib/utils/export";
import { CardExportRenderer } from "../preview/card-export-renderer";
import type {
  CardExportFormat,
  ExportScope,
  PageSize,
  PdfLayoutMode,
  ExportProgress,
  ResolvedCard,
} from "@/lib/types/export";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import { toast } from "sonner";
import {
  DEFAULT_CARD_WIDTH,
  DEFAULT_CARD_HEIGHT,
  PDF_GAP,
  PDF_MARGIN,
  FORMAT_LABELS,
  getCardName,
} from "./export-constants";
import { ExportConfigPanel } from "./export-config-panel";
import { CardGridPreview } from "./previews/card-grid-preview";
import { SpritesheetPreview } from "./previews/spritesheet-preview";
import { PdfPreview } from "./previews/pdf-preview";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialScope?: ExportScope;
}

export function ExportDialog({ open, onOpenChange, initialScope }: ExportDialogProps) {
  // Config state
  const [format, setFormat] = useState<CardExportFormat>("png");
  const [scope, setScope] = useState<ExportScope>(initialScope ?? "all");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [maintainCardSize, setMaintainCardSize] = useState(true);
  const [pdfLayoutMode, setPdfLayoutMode] = useState<PdfLayoutMode>("grid");
  const [cropMarks, setCropMarks] = useState(false);
  const [backLayoutId, setBackLayoutId] = useState<string | null>(null);
  const [spritesheetCols, setSpritesheetCols] = useState(10);
  const [noSpacing, setNoSpacing] = useState(false);
  const [includeQuantities, setIncludeQuantities] = useState(true);

  // Sync scope when dialog opens with a different initialScope
  useEffect(() => {
    if (open && initialScope) {
      setScope(initialScope);
    }
  }, [open, initialScope]);

  // Progress state
  const [progress, setProgress] = useState<ExportProgress>({
    status: "idle",
    current: 0,
    total: 0,
    message: "",
  });

  // Preview state
  const [resolvedPreview, setResolvedPreview] = useState<ResolvedCard[]>([]);
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(new Set());
  const [pdfPage, setPdfPage] = useState(0);

  // Render state
  const [currentCard, setCurrentCard] = useState<ResolvedCard | null>(null);
  const [currentBackElements, setCurrentBackElements] = useState<ResolvedCard | null>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const backRenderRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  // Store data
  const cards = useCardsStore((s) => s.cards);
  const filteredCards = useCardsStore((s) => s.filteredCards);
  const selectedCardIds = useCardsStore((s) => s.selectedCardIds);
  const selectedDeckId = useCardsStore((s) => s.selectedDeckId);
  const deckCardQuantities = useCardsStore((s) => s.deckCardQuantities);
  const selectedProjectId = useCardsStore((s) => s.selectedProjectId);
  const projects = useCardsStore((s) => s.projects);
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const resolveMediaIds = useMediaCacheStore((s) => s.resolveMediaIds);
  const getSignedUrl = useMediaCacheStore((s) => s.getSignedUrl);

  const project = projects.find((p) => p.id === selectedProjectId);
  const projectName = project?.name ?? "cards";

  const isPdf = format === "pdf";
  const isSpritesheet = format === "spritesheet-tts" || format === "spritesheet-roll20";

  // Expand cards by deck quantities when applicable
  const exportCards = useMemo(() => {
    let base: typeof cards;
    if (scope === "selected") {
      base = cards.filter((c) => selectedCardIds.has(c.id));
    } else if (scope === "filtered") {
      base = filteredCards();
    } else {
      base = cards;
    }

    if (includeQuantities && deckCardQuantities && selectedDeckId) {
      const expanded: typeof cards = [];
      for (const card of base) {
        const qty = deckCardQuantities.get(card.id) ?? 1;
        for (let q = 0; q < qty; q++) {
          expanded.push(card);
        }
      }
      return expanded;
    }

    return base;
  }, [scope, cards, selectedCardIds, filteredCards, includeQuantities, deckCardQuantities, selectedDeckId]);

  const hasSelection = selectedCardIds.size > 0;
  const hasDeckFilter = !!selectedDeckId;

  const isExporting =
    progress.status !== "idle" &&
    progress.status !== "complete" &&
    progress.status !== "error";

  const backLayout = useMemo(
    () => (backLayoutId ? layouts.find((l) => l.id === backLayoutId) ?? null : null),
    [backLayoutId, layouts]
  );

  // Resolve preview cards
  useEffect(() => {
    if (!open || layouts.length === 0 || exportCards.length === 0) {
      setResolvedPreview([]);
      return;
    }

    const { resolved, allMediaIds } = resolveCards(exportCards, layouts);

    if (allMediaIds.length > 0) {
      resolveMediaIds(allMediaIds).then(() => {
        const urlMap: Record<string, string> = {};
        for (const id of allMediaIds) {
          const url = getSignedUrl(id);
          if (url) urlMap[id] = url;
        }
        populateMediaUrls(resolved, urlMap);
        setResolvedPreview([...resolved]);
      });
    } else {
      setResolvedPreview(resolved);
    }

    setPdfPage(0);
    setExcludedIndices(new Set());
  }, [open, exportCards, layouts, resolveMediaIds, getSignedUrl]);

  const toggleExclude = useCallback((index: number) => {
    setExcludedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const activeCount = resolvedPreview.length - excludedIndices.size;
  const skippedCount = exportCards.length - resolvedPreview.length;

  // PDF layout computation
  const { cardAspectRatio, nativeCardWidth, firstBleedMargin } = useMemo(() => {
    if (resolvedPreview.length === 0)
      return {
        cardAspectRatio: DEFAULT_CARD_HEIGHT / DEFAULT_CARD_WIDTH,
        nativeCardWidth: DEFAULT_CARD_WIDTH,
        firstBleedMargin: 0,
      };
    const first = resolvedPreview[0];
    const w = first.layout.width ?? DEFAULT_CARD_WIDTH;
    const h = first.layout.height ?? DEFAULT_CARD_HEIGHT;
    return {
      cardAspectRatio: h / w,
      nativeCardWidth: w,
      firstBleedMargin: first.layout.bleed_margin ?? 0,
    };
  }, [resolvedPreview]);

  const cardGap = noSpacing ? 0 : PDF_GAP;

  const pdfConfig = useMemo(
    () => ({
      pageSize,
      cardsPerRow,
      cardGap,
      pageMargin: PDF_MARGIN,
      maintainCardSize,
      layoutMode: pdfLayoutMode,
      cropMarks,
      bleedMargin: firstBleedMargin,
      backLayoutId,
    }),
    [pageSize, cardsPerRow, cardGap, maintainCardSize, pdfLayoutMode, cropMarks, firstBleedMargin, backLayoutId]
  );

  const pdfLayout = useMemo(
    () => computePdfLayout(pdfConfig, cardAspectRatio, nativeCardWidth),
    [pdfConfig, cardAspectRatio, nativeCardWidth]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(resolvedPreview.length / pdfLayout.cardsPerPage)
  );

  const reset = useCallback(() => {
    setProgress({ status: "idle", current: 0, total: 0, message: "" });
    setCurrentCard(null);
    setCurrentBackElements(null);
    abortRef.current = false;
  }, []);

  const handleClose = (value: boolean) => {
    if (isExporting) {
      abortRef.current = true;
      return;
    }
    if (!value) reset();
    onOpenChange(value);
  };

  const handleExport = async () => {
    if (layouts.length === 0) {
      toast.error("No layouts found. Create a layout first.");
      return;
    }

    abortRef.current = false;

    setProgress({ status: "preparing", current: 0, total: 0, message: "Resolving layouts\u2026" });

    const { resolved: allResolved, allMediaIds } = resolveCards(exportCards, layouts);
    const resolved = allResolved.filter((_, i) => !excludedIndices.has(i));
    if (resolved.length === 0) {
      toast.error("No cards to export");
      setProgress({ status: "idle", current: 0, total: 0, message: "" });
      return;
    }

    const skipped = exportCards.length - allResolved.length;

    if (allMediaIds.length > 0) {
      setProgress({ status: "preparing", current: 0, total: 0, message: "Loading images\u2026" });
      await resolveMediaIds(allMediaIds);
      const urlMap: Record<string, string> = {};
      for (const id of allMediaIds) {
        const url = getSignedUrl(id);
        if (url) urlMap[id] = url;
      }
      populateMediaUrls(resolved, urlMap);
    }

    // ─── Render front images ───
    const renderedImages: { dataUrl: string; width: number; height: number }[] = [];

    for (let i = 0; i < resolved.length; i++) {
      if (abortRef.current) { toast.info("Export cancelled"); reset(); return; }

      setProgress({
        status: "rendering",
        current: i + 1,
        total: resolved.length,
        message: `Rendering card ${i + 1} of ${resolved.length}\u2026`,
      });

      setCurrentCard(resolved[i]);
      await new Promise((r) => setTimeout(r, 200));
      if (!renderRef.current) continue;

      try {
        const w = resolved[i].layout.width ?? DEFAULT_CARD_WIDTH;
        const h = resolved[i].layout.height ?? DEFAULT_CARD_HEIGHT;
        const dataUrl = format === "svg"
          ? await renderCardToSvg(renderRef.current, w, h)
          : await renderCardToPng(renderRef.current, w, h, 2);
        renderedImages.push({ dataUrl, width: w, height: h });
      } catch (err) {
        console.error(`Failed to render card ${i}:`, err);
      }
    }

    // ─── Render back images ───
    let backImages: { dataUrl: string; width: number; height: number }[] | undefined;

    if (isPdf && backLayout) {
      backImages = [];
      const backElements = Array.isArray(backLayout.canvas_elements)
        ? (backLayout.canvas_elements as unknown as CanvasElement[])
        : [];

      for (let i = 0; i < resolved.length; i++) {
        if (abortRef.current) { toast.info("Export cancelled"); reset(); return; }

        setProgress({
          status: "rendering",
          current: i + 1,
          total: resolved.length,
          message: `Rendering card back ${i + 1} of ${resolved.length}\u2026`,
        });

        setCurrentBackElements({ ...resolved[i], layout: backLayout, elements: backElements });
        await new Promise((r) => setTimeout(r, 200));
        if (!backRenderRef.current) continue;

        try {
          const w = backLayout.width ?? DEFAULT_CARD_WIDTH;
          const h = backLayout.height ?? DEFAULT_CARD_HEIGHT;
          const dataUrl = await renderCardToPng(backRenderRef.current, w, h, 2);
          backImages.push({ dataUrl, width: w, height: h });
        } catch (err) {
          console.error(`Failed to render card back ${i}:`, err);
        }
      }
    }

    setCurrentCard(null);
    setCurrentBackElements(null);

    if (renderedImages.length === 0) {
      toast.error("Failed to render any cards");
      reset();
      return;
    }

    setProgress({
      status: "assembling",
      current: resolved.length,
      total: resolved.length,
      message: isPdf ? "Generating PDF\u2026" : isSpritesheet ? "Generating spritesheet\u2026" : "Preparing downloads\u2026",
    });

    await new Promise((r) => setTimeout(r, 50));

    if (isPdf) {
      generatePdf(renderedImages, pdfConfig, projectName, backImages);
    } else if (isSpritesheet) {
      await generateSpritesheet(
        renderedImages,
        { cols: spritesheetCols, reserveSlots: format === "spritesheet-tts" ? 2 : 0 },
        projectName
      );
    } else if (format === "svg") {
      for (let i = 0; i < renderedImages.length; i++) {
        downloadSvg(renderedImages[i].dataUrl, `${projectName}-${getCardName(resolved[i], i)}.svg`);
        if (renderedImages.length > 1) await new Promise((r) => setTimeout(r, 100));
      }
    } else {
      for (let i = 0; i < renderedImages.length; i++) {
        downloadPng(renderedImages[i].dataUrl, `${projectName}-${getCardName(resolved[i], i)}.png`);
        if (renderedImages.length > 1) await new Promise((r) => setTimeout(r, 100));
      }
    }

    const formatLabel = FORMAT_LABELS[format] ?? format.toUpperCase();
    const msg =
      `Exported ${renderedImages.length} cards as ${formatLabel}` +
      (skipped > 0 ? ` (${skipped} skipped \u2014 no matching layout)` : "");
    toast.success(msg);

    setProgress({ status: "complete", current: resolved.length, total: resolved.length, message: msg });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Export Cards</DialogTitle>
          <DialogDescription>
            Render cards as images, spritesheets, or a print-ready PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
          {/* Left: Config panel */}
          <div className="w-[280px] shrink-0 space-y-4 overflow-y-auto">
            <ExportConfigPanel
              format={format}
              onFormatChange={setFormat}
              scope={scope}
              onScopeChange={setScope}
              cards={cards}
              hasSelection={hasSelection}
              selectedCount={selectedCardIds.size}
              hasDeckFilter={hasDeckFilter}
              filteredCount={filteredCards().length}
              hasDeckQuantities={hasDeckFilter && !!deckCardQuantities}
              includeQuantities={includeQuantities}
              onIncludeQuantitiesChange={setIncludeQuantities}
              spritesheetCols={spritesheetCols}
              onSpritesheetColsChange={setSpritesheetCols}
              pdfLayoutMode={pdfLayoutMode}
              onPdfLayoutModeChange={setPdfLayoutMode}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              maintainCardSize={maintainCardSize}
              onMaintainCardSizeChange={setMaintainCardSize}
              noSpacing={noSpacing}
              onNoSpacingChange={setNoSpacing}
              cardsPerRow={cardsPerRow}
              onCardsPerRowChange={setCardsPerRow}
              firstBleedMargin={firstBleedMargin}
              cropMarks={cropMarks}
              onCropMarksChange={setCropMarks}
              backLayoutId={backLayoutId}
              onBackLayoutIdChange={setBackLayoutId}
              layouts={layouts}
              skippedCount={skippedCount}
              progress={progress}
              isExporting={isExporting}
            />
          </div>

          {/* Right: Preview panel */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden rounded-lg border bg-muted/30">
            {resolvedPreview.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                {layouts.length === 0
                  ? "No layouts found. Create a layout first."
                  : "No cards to preview."}
              </div>
            ) : isPdf ? (
              <PdfPreview
                resolved={resolvedPreview}
                pdfLayout={pdfLayout}
                pageSize={pageSize}
                layoutMode={pdfLayoutMode}
                cardGap={cardGap}
                currentPage={pdfPage}
                totalPages={totalPages}
                onPageChange={setPdfPage}
                excludedIndices={excludedIndices}
                onToggleExclude={toggleExclude}
              />
            ) : isSpritesheet ? (
              <SpritesheetPreview
                resolved={resolvedPreview}
                cols={spritesheetCols}
                reserveSlots={format === "spritesheet-tts" ? 2 : 0}
                excludedIndices={excludedIndices}
                onToggleExclude={toggleExclude}
              />
            ) : (
              <CardGridPreview
                resolved={resolvedPreview}
                excludedIndices={excludedIndices}
                onToggleExclude={toggleExclude}
              />
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0">
          {isExporting ? (
            <Button variant="outline" onClick={() => { abortRef.current = true; }}>
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                {progress.status === "complete" ? "Done" : "Cancel"}
              </Button>
              {progress.status !== "complete" && (
                <Button onClick={handleExport} disabled={activeCount === 0}>
                  Export {activeCount} card{activeCount !== 1 ? "s" : ""}
                </Button>
              )}
            </>
          )}
        </DialogFooter>

        {/* Off-screen render containers */}
        {currentCard && (
          <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
            <CardExportRenderer
              ref={renderRef}
              elements={currentCard.elements}
              cardData={currentCard.cardData}
              mediaUrls={currentCard.mediaUrls}
              width={currentCard.layout.width ?? DEFAULT_CARD_WIDTH}
              height={currentCard.layout.height ?? DEFAULT_CARD_HEIGHT}
            />
          </div>
        )}
        {currentBackElements && (
          <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
            <CardExportRenderer
              ref={backRenderRef}
              elements={currentBackElements.elements}
              cardData={currentBackElements.cardData}
              mediaUrls={currentBackElements.mediaUrls}
              width={currentBackElements.layout.width ?? DEFAULT_CARD_WIDTH}
              height={currentBackElements.layout.height ?? DEFAULT_CARD_HEIGHT}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
} from "@/lib/utils/export-cards";
import { CardExportRenderer } from "./card-export-renderer";
import { PAGE_DIMENSIONS } from "@/lib/types/export";
import type {
  CardExportFormat,
  ExportScope,
  PageSize,
  PdfLayoutMode,
  ExportProgress,
  ResolvedCard,
} from "@/lib/types/export";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_CARD_WIDTH = 825;
const DEFAULT_CARD_HEIGHT = 1125;
const PDF_GAP = 20;
const PDF_MARGIN = 40;

const FORMAT_LABELS: Record<CardExportFormat, string> = {
  png: "PNG Images",
  svg: "SVG Images",
  pdf: "PDF Print Sheet",
  "spritesheet-tts": "TTS Spritesheet",
  "spritesheet-roll20": "Roll20 Spritesheet",
};

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  // Config state
  const [format, setFormat] = useState<CardExportFormat>("png");
  const [scope, setScope] = useState<ExportScope>("all");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [maintainCardSize, setMaintainCardSize] = useState(true);
  const [pdfLayoutMode, setPdfLayoutMode] = useState<PdfLayoutMode>("grid");
  const [cropMarks, setCropMarks] = useState(false);
  const [backLayoutId, setBackLayoutId] = useState<string | null>(null);
  const [spritesheetCols, setSpritesheetCols] = useState(10);
  const [noSpacing, setNoSpacing] = useState(false);
  const [includeQuantities, setIncludeQuantities] = useState(true);

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

    // Apply deck quantities
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

  // Get the back layout object
  const backLayout = useMemo(
    () => (backLayoutId ? layouts.find((l) => l.id === backLayoutId) ?? null : null),
    [backLayoutId, layouts]
  );

  // Resolve preview cards when dialog opens or scope changes
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

    setProgress({
      status: "preparing",
      current: 0,
      total: 0,
      message: "Resolving layouts\u2026",
    });

    const { resolved: allResolved, allMediaIds } = resolveCards(exportCards, layouts);
    // Filter out cards excluded by clicking in preview
    const resolved = allResolved.filter((_, i) => !excludedIndices.has(i));
    if (resolved.length === 0) {
      toast.error("No cards to export");
      setProgress({ status: "idle", current: 0, total: 0, message: "" });
      return;
    }

    const skipped = exportCards.length - allResolved.length;

    if (allMediaIds.length > 0) {
      setProgress({
        status: "preparing",
        current: 0,
        total: 0,
        message: "Loading images\u2026",
      });
      await resolveMediaIds(allMediaIds);
      const urlMap: Record<string, string> = {};
      for (const id of allMediaIds) {
        const url = getSignedUrl(id);
        if (url) urlMap[id] = url;
      }
      populateMediaUrls(resolved, urlMap);
    }

    // ─── Render front images ───
    const renderedImages: {
      dataUrl: string;
      width: number;
      height: number;
    }[] = [];

    for (let i = 0; i < resolved.length; i++) {
      if (abortRef.current) {
        toast.info("Export cancelled");
        reset();
        return;
      }

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

        if (format === "svg") {
          const dataUrl = await renderCardToSvg(renderRef.current, w, h);
          renderedImages.push({ dataUrl, width: w, height: h });
        } else {
          const dataUrl = await renderCardToPng(renderRef.current, w, h, 2);
          renderedImages.push({ dataUrl, width: w, height: h });
        }
      } catch (err) {
        console.error(`Failed to render card ${i}:`, err);
      }
    }

    // ─── Render back images (PDF with card backs) ───
    let backImages: { dataUrl: string; width: number; height: number }[] | undefined;

    if (isPdf && backLayout) {
      backImages = [];
      const backElements = Array.isArray(backLayout.canvas_elements)
        ? (backLayout.canvas_elements as unknown as import("@/lib/types/canvas-elements").CanvasElement[])
        : [];

      for (let i = 0; i < resolved.length; i++) {
        if (abortRef.current) {
          toast.info("Export cancelled");
          reset();
          return;
        }

        setProgress({
          status: "rendering",
          current: i + 1,
          total: resolved.length,
          message: `Rendering card back ${i + 1} of ${resolved.length}\u2026`,
        });

        // Create a back-side resolved card using the back layout but same card data
        const backResolved: ResolvedCard = {
          ...resolved[i],
          layout: backLayout,
          elements: backElements,
        };

        setCurrentBackElements(backResolved);
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
      message: isPdf
        ? "Generating PDF\u2026"
        : isSpritesheet
          ? "Generating spritesheet\u2026"
          : "Preparing downloads\u2026",
    });

    await new Promise((r) => setTimeout(r, 50));

    if (isPdf) {
      generatePdf(renderedImages, pdfConfig, projectName, backImages);
    } else if (isSpritesheet) {
      const reserveSlots = format === "spritesheet-tts" ? 2 : 0;
      await generateSpritesheet(
        renderedImages,
        { cols: spritesheetCols, reserveSlots },
        projectName
      );
    } else if (format === "svg") {
      for (let i = 0; i < renderedImages.length; i++) {
        const cardName = getCardName(resolved[i], i);
        downloadSvg(renderedImages[i].dataUrl, `${projectName}-${cardName}.svg`);
        if (renderedImages.length > 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    } else {
      // PNG
      for (let i = 0; i < renderedImages.length; i++) {
        const cardName = getCardName(resolved[i], i);
        downloadPng(renderedImages[i].dataUrl, `${projectName}-${cardName}.png`);
        if (renderedImages.length > 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    }

    const formatLabel = FORMAT_LABELS[format] ?? format.toUpperCase();
    const msg =
      `Exported ${renderedImages.length} cards as ${formatLabel}` +
      (skipped > 0 ? ` (${skipped} skipped \u2014 no matching layout)` : "");
    toast.success(msg);

    setProgress({
      status: "complete",
      current: resolved.length,
      total: resolved.length,
      message: msg,
    });
  };

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

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
            {isExporting ? (
              <div className="space-y-4 py-4">
                <Progress value={progressPercent} />
                <p className="text-center text-sm text-muted-foreground">
                  {progress.message}
                </p>
              </div>
            ) : (
              <>
                {/* Format selector */}
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={format}
                    onValueChange={(v) => setFormat(v as CardExportFormat)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scope selector */}
                <div className="space-y-2">
                  <Label>Cards to export</Label>
                  <Select
                    value={scope}
                    onValueChange={(v) => setScope(v as ExportScope)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All cards ({cards.length})
                      </SelectItem>
                      {hasSelection && (
                        <SelectItem value="selected">
                          Selected ({selectedCardIds.size})
                        </SelectItem>
                      )}
                      {hasDeckFilter && (
                        <SelectItem value="filtered">
                          Current deck ({filteredCards().length})
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Deck quantities checkbox */}
                {hasDeckFilter && deckCardQuantities && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-quantities"
                      checked={includeQuantities}
                      onCheckedChange={(v) => setIncludeQuantities(!!v)}
                    />
                    <Label htmlFor="include-quantities" className="text-sm font-normal">
                      Include deck quantities
                    </Label>
                  </div>
                )}

                {/* ─── Spritesheet options ─── */}
                {isSpritesheet && (
                  <div className="space-y-2">
                    <Label>Columns</Label>
                    <Select
                      value={String(spritesheetCols)}
                      onValueChange={(v) => setSpritesheetCols(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 6, 7, 8, 9, 10, 12].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} columns
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {format === "spritesheet-tts" && (
                      <p className="text-xs text-muted-foreground">
                        TTS uses 10\u00d77 grids (last 2 slots reserved).
                        Max 68 cards per sheet.
                      </p>
                    )}
                  </div>
                )}

                {/* ─── PDF options ─── */}
                {isPdf && (
                  <>
                    {/* Layout mode */}
                    <div className="space-y-2">
                      <Label>Layout mode</Label>
                      <Select
                        value={pdfLayoutMode}
                        onValueChange={(v) => setPdfLayoutMode(v as PdfLayoutMode)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid (multiple per page)</SelectItem>
                          <SelectItem value="one-per-page">One card per page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Page size */}
                    <div className="space-y-2">
                      <Label>Page size</Label>
                      <Select
                        value={pageSize}
                        onValueChange={(v) => setPageSize(v as PageSize)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAGE_DIMENSIONS).map(([key, dim]) => (
                            <SelectItem key={key} value={key}>
                              {dim.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Grid-specific options */}
                    {pdfLayoutMode === "grid" && (
                      <>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="maintain-size"
                            checked={maintainCardSize}
                            onCheckedChange={(v) => setMaintainCardSize(!!v)}
                          />
                          <Label htmlFor="maintain-size" className="text-sm font-normal">
                            Maintain original card size
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="no-spacing"
                            checked={noSpacing}
                            onCheckedChange={(v) => setNoSpacing(!!v)}
                          />
                          <Label htmlFor="no-spacing" className="text-sm font-normal">
                            No spacing between cards
                          </Label>
                        </div>

                        {!maintainCardSize && (
                          <div className="space-y-2">
                            <Label>Cards per row</Label>
                            <Select
                              value={String(cardsPerRow)}
                              onValueChange={(v) => setCardsPerRow(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )}

                    {/* Crop marks */}
                    {firstBleedMargin > 0 && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="crop-marks"
                          checked={cropMarks}
                          onCheckedChange={(v) => setCropMarks(!!v)}
                        />
                        <Label htmlFor="crop-marks" className="text-sm font-normal">
                          Include crop marks
                        </Label>
                      </div>
                    )}

                    {/* Card back layout */}
                    <div className="space-y-2">
                      <Label>Card back</Label>
                      <Select
                        value={backLayoutId ?? "__none__"}
                        onValueChange={(v) =>
                          setBackLayoutId(v === "__none__" ? null : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {layouts.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {skippedCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {skippedCount} card{skippedCount !== 1 ? "s" : ""} skipped
                    (no matching layout)
                  </p>
                )}

                {progress.status === "complete" && (
                  <p className="text-sm text-muted-foreground">
                    {progress.message}
                  </p>
                )}
              </>
            )}
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
            <Button
              variant="outline"
              onClick={() => {
                abortRef.current = true;
              }}
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                {progress.status === "complete" ? "Done" : "Cancel"}
              </Button>
              {progress.status !== "complete" && (
                <Button
                  onClick={handleExport}
                  disabled={activeCount === 0}
                >
                  Export {activeCount} card
                  {activeCount !== 1 ? "s" : ""}
                </Button>
              )}
            </>
          )}
        </DialogFooter>

        {/* Off-screen render container (front) */}
        {currentCard && (
          <div
            style={{
              position: "fixed",
              left: -9999,
              top: 0,
              pointerEvents: "none",
            }}
          >
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

        {/* Off-screen render container (back) */}
        {currentBackElements && (
          <div
            style={{
              position: "fixed",
              left: -9999,
              top: 0,
              pointerEvents: "none",
            }}
          >
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

// ─── Card Grid Preview (PNG / SVG): scrollable grid of card thumbnails ───────

function CardGridPreview({
  resolved,
  excludedIndices,
  onToggleExclude,
}: {
  resolved: ResolvedCard[];
  excludedIndices: Set<number>;
  onToggleExclude: (index: number) => void;
}) {
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

// ─── Spritesheet Preview ────────────────────────────────────────────────────

function SpritesheetPreview({
  resolved,
  cols,
  reserveSlots,
  excludedIndices,
  onToggleExclude,
}: {
  resolved: ResolvedCard[];
  cols: number;
  reserveSlots: number;
  excludedIndices: Set<number>;
  onToggleExclude: (index: number) => void;
}) {
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

// ─── PDF Preview: page mockup with card grid ────────────────────────────────

function PdfPreview({
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
}: {
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
}) {
  const pageDim = PAGE_DIMENSIONS[pageSize];
  const { cardsPerPage, cardsPerRow, cardW, cardH } = pdfLayout;

  // Cards on this page
  const startIdx = currentPage * cardsPerPage;
  const pageCards = resolved.slice(startIdx, startIdx + cardsPerPage);

  // Scale the page to fit the preview container
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
      {/* Page view */}
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
          {/* Margin guide */}
          <div
            className="absolute border border-dashed border-neutral-200"
            style={{
              left: PDF_MARGIN,
              top: PDF_MARGIN,
              right: PDF_MARGIN,
              bottom: PDF_MARGIN,
            }}
          />

          {/* Card slots */}
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

      {/* Page navigation */}
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCardLabel(rc: ResolvedCard, index: number): string {
  const data = rc.cardData;
  for (const key of ["name", "title", "card-name", "card_name"]) {
    if (typeof data[key] === "string" && (data[key] as string).length > 0) {
      return String(data[key]);
    }
  }
  return `Card ${index + 1}`;
}

function getCardName(rc: ResolvedCard, index: number): string {
  const data = rc.cardData;
  for (const key of ["name", "title", "card-name", "card_name"]) {
    if (typeof data[key] === "string" && (data[key] as string).length > 0) {
      return String(data[key])
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }
  }
  return String(index + 1).padStart(3, "0");
}

"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PAGE_DIMENSIONS } from "@/lib/types/export";
import type {
  CardExportFormat,
  ExportScope,
  PageSize,
  PdfLayoutMode,
  ExportProgress,
} from "@/lib/types/export";
import type { Card, Layout } from "@/lib/types";
import { FORMAT_LABELS } from "./export-constants";

interface ExportConfigPanelProps {
  // Format
  format: CardExportFormat;
  onFormatChange: (format: CardExportFormat) => void;
  // Scope
  scope: ExportScope;
  onScopeChange: (scope: ExportScope) => void;
  cards: Card[];
  hasSelection: boolean;
  selectedCount: number;
  hasDeckFilter: boolean;
  filteredCount: number;
  // Quantities
  hasDeckQuantities: boolean;
  includeQuantities: boolean;
  onIncludeQuantitiesChange: (v: boolean) => void;
  // Spritesheet
  spritesheetCols: number;
  onSpritesheetColsChange: (v: number) => void;
  // PDF
  pdfLayoutMode: PdfLayoutMode;
  onPdfLayoutModeChange: (v: PdfLayoutMode) => void;
  pageSize: PageSize;
  onPageSizeChange: (v: PageSize) => void;
  maintainCardSize: boolean;
  onMaintainCardSizeChange: (v: boolean) => void;
  noSpacing: boolean;
  onNoSpacingChange: (v: boolean) => void;
  cardsPerRow: number;
  onCardsPerRowChange: (v: number) => void;
  firstBleedMargin: number;
  cropMarks: boolean;
  onCropMarksChange: (v: boolean) => void;
  backLayoutId: string | null;
  onBackLayoutIdChange: (v: string | null) => void;
  layouts: Layout[];
  // Status
  skippedCount: number;
  progress: ExportProgress;
  isExporting: boolean;
}

export function ExportConfigPanel({
  format,
  onFormatChange,
  scope,
  onScopeChange,
  cards,
  hasSelection,
  selectedCount,
  hasDeckFilter,
  filteredCount,
  hasDeckQuantities,
  includeQuantities,
  onIncludeQuantitiesChange,
  spritesheetCols,
  onSpritesheetColsChange,
  pdfLayoutMode,
  onPdfLayoutModeChange,
  pageSize,
  onPageSizeChange,
  maintainCardSize,
  onMaintainCardSizeChange,
  noSpacing,
  onNoSpacingChange,
  cardsPerRow,
  onCardsPerRowChange,
  firstBleedMargin,
  cropMarks,
  onCropMarksChange,
  backLayoutId,
  onBackLayoutIdChange,
  layouts,
  skippedCount,
  progress,
  isExporting,
}: ExportConfigPanelProps) {
  const isPdf = format === "pdf";
  const isSpritesheet = format === "spritesheet-tts" || format === "spritesheet-roll20";

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  if (isExporting) {
    return (
      <div className="space-y-4 py-4">
        <Progress value={progressPercent} />
        <p className="text-center text-sm text-muted-foreground">
          {progress.message}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Format selector */}
      <div className="space-y-2">
        <Label>Format</Label>
        <Select
          value={format}
          onValueChange={(v) => onFormatChange(v as CardExportFormat)}
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
          onValueChange={(v) => onScopeChange(v as ExportScope)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cards ({cards.length})</SelectItem>
            {hasSelection && (
              <SelectItem value="selected">
                Selected ({selectedCount})
              </SelectItem>
            )}
            {hasDeckFilter && (
              <SelectItem value="filtered">
                Current deck ({filteredCount})
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Deck quantities */}
      {hasDeckQuantities && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-quantities"
            checked={includeQuantities}
            onCheckedChange={(v) => onIncludeQuantitiesChange(!!v)}
          />
          <Label htmlFor="include-quantities" className="text-sm font-normal">
            Include deck quantities
          </Label>
        </div>
      )}

      {/* Spritesheet options */}
      {isSpritesheet && (
        <div className="space-y-2">
          <Label>Columns</Label>
          <Select
            value={String(spritesheetCols)}
            onValueChange={(v) => onSpritesheetColsChange(Number(v))}
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
              TTS uses 10×7 grids (last 2 slots reserved). Max 68 cards per sheet.
            </p>
          )}
        </div>
      )}

      {/* PDF options */}
      {isPdf && (
        <>
          <div className="space-y-2">
            <Label>Layout mode</Label>
            <Select
              value={pdfLayoutMode}
              onValueChange={(v) => onPdfLayoutModeChange(v as PdfLayoutMode)}
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

          <div className="space-y-2">
            <Label>Page size</Label>
            <Select
              value={pageSize}
              onValueChange={(v) => onPageSizeChange(v as PageSize)}
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

          {pdfLayoutMode === "grid" && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="maintain-size"
                  checked={maintainCardSize}
                  onCheckedChange={(v) => onMaintainCardSizeChange(!!v)}
                />
                <Label htmlFor="maintain-size" className="text-sm font-normal">
                  Maintain original card size
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="no-spacing"
                  checked={noSpacing}
                  onCheckedChange={(v) => onNoSpacingChange(!!v)}
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
                    onValueChange={(v) => onCardsPerRowChange(Number(v))}
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

          {firstBleedMargin > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="crop-marks"
                checked={cropMarks}
                onCheckedChange={(v) => onCropMarksChange(!!v)}
              />
              <Label htmlFor="crop-marks" className="text-sm font-normal">
                Include crop marks
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label>Card back</Label>
            <Select
              value={backLayoutId ?? "__none__"}
              onValueChange={(v) =>
                onBackLayoutIdChange(v === "__none__" ? null : v)
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
          {skippedCount} card{skippedCount !== 1 ? "s" : ""} skipped (no matching layout)
        </p>
      )}

      {progress.status === "complete" && (
        <p className="text-sm text-muted-foreground">{progress.message}</p>
      )}
    </>
  );
}

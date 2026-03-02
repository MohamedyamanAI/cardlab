import type { Card, Layout } from "@/lib/types";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";

export type ExportScope = "all" | "selected" | "filtered";

export type DataExportFormat = "csv" | "json";

export type CardExportFormat =
  | "png"
  | "pdf"
  | "svg"
  | "spritesheet-tts"
  | "spritesheet-roll20";

export type PageSize = "a4" | "a3" | "letter" | "legal" | "tabloid";

export const PAGE_DIMENSIONS: Record<
  PageSize,
  { width: number; height: number; label: string }
> = {
  a4: { width: 2480, height: 3508, label: "A4 (210 × 297 mm)" },
  a3: { width: 3508, height: 4961, label: "A3 (297 × 420 mm)" },
  letter: { width: 2550, height: 3300, label: "US Letter (8.5 × 11 in)" },
  legal: { width: 2550, height: 4200, label: "US Legal (8.5 × 14 in)" },
  tabloid: { width: 3300, height: 5100, label: "Tabloid (11 × 17 in)" },
};

export type PdfLayoutMode = "grid" | "one-per-page";

export interface PdfExportConfig {
  pageSize: PageSize;
  cardsPerRow: number;
  cardGap: number;
  pageMargin: number;
  maintainCardSize: boolean;
  layoutMode: PdfLayoutMode;
  cropMarks: boolean;
  bleedMargin: number;
  backLayoutId: string | null;
}

export interface SpritesheetConfig {
  cols: number;
  reserveSlots: number; // TTS: 2 (last slots unused), Roll20: 0
}

export interface ExportProgress {
  status:
    | "idle"
    | "preparing"
    | "rendering"
    | "assembling"
    | "complete"
    | "error";
  current: number;
  total: number;
  message: string;
}

export interface ResolvedCard {
  card: Card;
  layout: Layout;
  elements: CanvasElement[];
  cardData: Record<string, Json>;
  mediaUrls: Record<string, string>;
}

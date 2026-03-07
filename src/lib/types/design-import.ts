import type { z } from "zod/v4";
import type {
  detectedPropertySchema,
  detectedLayoutElementSchema,
  detectedCardSchema,
  analysisResultSchema,
} from "@/lib/intelligence/features/design-import/schema";

// ─── Illustrator File Parsing (input to AI) ────────────────────────

export interface TextItemInfo {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
}

export interface ParsedPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  textItems: TextItemInfo[];
  thumbnailBase64?: string;
}

export interface ParsedDesignFile {
  fileName: string;
  fileSize: number;
  pageCount: number;
  pageWidth: number;
  pageHeight: number;
  pages: ParsedPageInfo[];
  compositeThumbnail: string;
}

// ─── AI Analysis Output (derived from Zod schemas) ─────────────────

export type DetectedProperty = z.infer<typeof detectedPropertySchema>;
export type DetectedLayoutElement = z.infer<typeof detectedLayoutElementSchema>;
export type DetectedCard = z.infer<typeof detectedCardSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// ─── Import Result (server action output) ──────────────────────────

export interface DesignImportResult {
  projectId: string;
  projectName: string;
  propertiesCreated: number;
  layoutCreated: boolean;
  cardsCreated: number;
  mediaUploaded: number;
  errors: Array<{ step: string; message: string }>;
  canvasElements?: Record<string, unknown>[];
}

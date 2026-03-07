import { extractAiNativeText } from "./native-text";
import type {
  ParsedDesignFile,
  ParsedPageInfo,
  TextItemInfo,
} from "@/lib/types/design-import";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const WARN_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/** Pages to extract text from for AI analysis (first N pages) */
const MAX_ANALYSIS_PAGES = 5;

/** Thumbnail render scale (must be high enough for AI to read text) */
const THUMBNAIL_SCALE = 3;

// Lazy-load pdfjs-dist to avoid DOMMatrix reference error during SSR.
let _pdfjsLib: typeof import("pdfjs-dist") | null = null;
export async function getPdfjs() {
  if (!_pdfjsLib) {
    _pdfjsLib = await import("pdfjs-dist");
    _pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return _pdfjsLib;
}

export type PDFDocumentProxy = Awaited<
  ReturnType<typeof import("pdfjs-dist").getDocument>["promise"]
>;

/**
 * Parse an .ai file (PDF-compatible) and extract text + thumbnail.
 * First tries to extract real text from AI private data,
 * then falls back to pdfjs text extraction (may be garbled).
 */
export async function parseAiFile(file: File): Promise<{
  parsed: ParsedDesignFile;
  pdfDocument: PDFDocumentProxy;
  warning?: string;
  nativeTextDebug?: string;
}> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File is too large (${(file.size / 1024 / 1024).toFixed(0)}MB). Maximum is 200MB.`
    );
  }

  const warning =
    file.size > WARN_FILE_SIZE
      ? `Large file (${(file.size / 1024 / 1024).toFixed(0)}MB) — parsing may take a moment.`
      : undefined;

  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();

  const nativeResult = await extractAiNativeText(arrayBuffer);

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const firstPage = await pdf.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1 });
  const pageWidth = viewport.width;
  const pageHeight = viewport.height;

  const pagesToAnalyze = Math.min(pdf.numPages, MAX_ANALYSIS_PAGES);
  const pages: ParsedPageInfo[] = [];

  for (let i = 1; i <= pagesToAnalyze; i++) {
    const textItems = await extractPageText(pdf, i);

    if (nativeResult) {
      const nativeTexts = nativeResult.pageTexts.get(i);
      if (nativeTexts) {
        replaceGarbledText(textItems, nativeTexts);
      }
    }

    const thumbnailBase64 = await renderPage(pdf, i, THUMBNAIL_SCALE);
    pages.push({
      pageNumber: i,
      width: pageWidth,
      height: pageHeight,
      textItems,
      thumbnailBase64,
    });
  }

  const compositeThumbnail = pages[0].thumbnailBase64!;

  return {
    parsed: {
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdf.numPages,
      pageWidth,
      pageHeight,
      pages,
      compositeThumbnail,
    },
    pdfDocument: pdf,
    warning,
    nativeTextDebug: nativeResult?.rawDebug,
  };
}

/**
 * Replace garbled text in pdfjs text items with native AI text.
 * Matches by order — the Tx operators in AI format appear in the
 * same order as the text items on the page.
 */
function replaceGarbledText(
  items: TextItemInfo[],
  nativeTexts: string[]
): void {
  const count = Math.min(items.length, nativeTexts.length);
  for (let i = 0; i < count; i++) {
    items[i].text = nativeTexts[i];
  }
}

/**
 * Render a single PDF page to a base64 PNG string via offscreen canvas.
 */
export async function renderPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;

  await page.render({ canvasContext: ctx, canvas, viewport }).promise;

  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.split(",")[1];
}

/**
 * Extract text items with positions from a PDF page.
 */
export async function extractPageText(
  pdf: PDFDocumentProxy,
  pageNumber: number
): Promise<TextItemInfo[]> {
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  const items: TextItemInfo[] = [];

  for (const item of textContent.items) {
    if ("type" in item) continue;

    const text = item.str.trim();
    if (!text) continue;

    const tx = item.transform;
    const fontSize = Math.abs(tx[3]) || Math.abs(tx[0]) || 12;

    // PDF y-axis is bottom-up, convert to top-down.
    const x = tx[4];
    const y = viewport.height - tx[5] - fontSize;

    items.push({
      text,
      x,
      y,
      width: item.width,
      height: item.height || fontSize,
      fontName: item.fontName,
      fontSize: Math.round(fontSize * 10) / 10,
    });
  }

  return items;
}

/**
 * Render all pages at full resolution.
 */
export async function renderAllPages(
  pdf: PDFDocumentProxy,
  scale: number
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const base64 = await renderPage(pdf, i, scale);
    results.push(base64);
  }
  return results;
}
